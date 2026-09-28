// Административный сценарий:
//   1. Пользователи — список
//   2. Пользователи — CRUD: регистрация одноразового пользователя, поиск его id, получение, обновление, удаление
//   3. Восстановление пароля — forgot-password, письмо в MailHog, reset-password
//   4. Вложения — загрузка файла на заметку, список, удаление
//   5. Ревизии заметок — обновление заметки (создаёт ревизию) + список ревизий
//   6. Права доступа — выдать право другому клиенту, список, отозвать
//   7. Аналитика
// k6 run 02-admin-scenario.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const MAILHOG_URL = __ENV.MAILHOG_URL || 'http://localhost:8025';
const ADMIN_EMAIL_PREFIX = __ENV.ADMIN_EMAIL_PREFIX || 'loadtest-admin';
const ADMIN_POOL_SIZE = Number(__ENV.ADMIN_POOL_SIZE || 150);
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'LoadTest123!';
const CLIENT_EMAIL_PREFIX = __ENV.CLIENT_EMAIL_PREFIX || 'loadtest-client';
const CLIENT_POOL_SIZE = Number(__ENV.CLIENT_POOL_SIZE || 150);
const CLIENT_PASSWORD = __ENV.CLIENT_PASSWORD || 'LoadTest123!';
const RECOVERY_EMAIL = __ENV.RECOVERY_EMAIL || 'loadtest-recovery@example.com';
const RECOVERY_PASSWORD = __ENV.CLIENT_PASSWORD || 'LoadTest123!';
const THINK_TIME = Number(__ENV.THINK_TIME || 3);
const ATTACHMENTS_ENABLED = (__ENV.ATTACHMENTS_ENABLED || '1') !== '0';

const getUsersTrend = new Trend('get_users_duration', true);
const loginFailures = new Counter('admin_login_failures');
const getUsersFailures = new Counter('get_users_failures');

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

export const options = {
  scenarios: {
    admin_read_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 60 },
        { duration: '2m', target: 60 },
        { duration: '30s', target: 150 },
        { duration: '2m', target: 150 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    get_users_duration: ['p(95)<800'],
    'http_req_duration{endpoint:login}': ['p(95)<900'],
  },
};

export default function () {
  // 0a. Вход под админом
  const vuAdmin = __VU % ADMIN_POOL_SIZE;
  const adminEmail = `${ADMIN_EMAIL_PREFIX}-${vuAdmin}@example.com`;
  const adminLoginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: adminEmail, password: ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } }
  );
  const adminLoginOk = check(adminLoginRes, { 'admin login: статус 200': (r) => r.status === 200 });
  if (!adminLoginOk) {
    loginFailures.add(1);
    sleep(1);
    return;
  }

  // 1. Пользователи: список
  group('users_list', () => {
    const res1 = http.get(`${BASE_URL}/api/users`, { tags: { endpoint: 'users_list' } });
    getUsersTrend.add(res1.timings.duration);
    if (!check(res1, { 'get_users #1: статус 200': (r) => r.status === 200 })) getUsersFailures.add(1);

    sleep(THINK_TIME);

    const res2 = http.get(`${BASE_URL}/api/users`, { tags: { endpoint: 'users_list' } });
    getUsersTrend.add(res2.timings.duration);
    if (!check(res2, { 'get_users #2: статус 200': (r) => r.status === 200 })) getUsersFailures.add(1);
  });

  // 2. Пользователи: полный CRUD-цикл на одноразовом аккаунте
  group('users_crud', () => {
    const throwawayEmail = `loadtest-crud-${__VU}-${__ITER}-${Date.now()}@example.com`;

    const registerRes = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({
        name: 'Crud', surname: 'Test', email: throwawayEmail,
        birthdayDate: '2000-01-01', password: 'Throwaway123!', passwordConfirm: 'Throwaway123!',
      }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'user_register' } }
    );
    if (!check(registerRes, { 'register throwaway user: статус 201': (r) => r.status === 201 })) return;

    const searchRes = http.get(
      `${BASE_URL}/api/users/search?q=${encodeURIComponent(throwawayEmail)}`,
      { tags: { endpoint: 'user_search' } }
    );
    if (!check(searchRes, { 'search throwaway user: статус 200': (r) => r.status === 200 })) return;
    const found = JSON.parse(searchRes.body)[0];
    if (!found) return;
    const userId = found.id;

    const detailRes = http.get(`${BASE_URL}/api/users/${userId}`, { tags: { endpoint: 'user_detail' } });
    check(detailRes, { 'get user detail: статус 200': (r) => r.status === 200 });

    const updateRes = http.put(
      `${BASE_URL}/api/users/${userId}`,
      JSON.stringify({ surname: 'UpdatedByLoadTest' }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'user_update' } }
    );
    check(updateRes, { 'update user: статус 200': (r) => r.status === 200 });

    const deleteRes = http.del(`${BASE_URL}/api/users/${userId}`, null, { tags: { endpoint: 'user_delete' } });
    check(deleteRes, { 'delete user: статус 2xx': (r) => r.status >= 200 && r.status < 300 });
  });

  // 3. Восстановление пароля: forgot, письмо в MailHog, reset
  group('password_recovery', () => {
    const forgotRes = http.post(
      `${BASE_URL}/api/auth/forgot-password`,
      JSON.stringify({ email: RECOVERY_EMAIL }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'password_forgot' } }
    );
    if (!check(forgotRes, { 'forgot-password: статус 200': (r) => r.status === 200 })) return;

    sleep(0.5);

    const mailRes = http.get(`${MAILHOG_URL}/api/v2/messages?limit=20`, { tags: { endpoint: 'mailhog' } });
    if (!check(mailRes, { 'mailhog: статус 200': (r) => r.status === 200 })) return;

    const messages = JSON.parse(mailRes.body).items || [];
    const message = messages.find((m) => {
      const to = m.To && m.To[0];
      return to && `${to.Mailbox}@${to.Domain}`.toLowerCase() === RECOVERY_EMAIL.toLowerCase();
    });
    if (!message) return;

    const body = message.Content && message.Content.Body ? message.Content.Body : '';
    const match = body.match(/token=([A-Za-z0-9_-]+)/);
    if (!match) return;
    const token = match[1];

    const resetRes = http.post(
      `${BASE_URL}/api/auth/reset-password`,
      JSON.stringify({ token, newPassword: RECOVERY_PASSWORD, newPasswordConfirm: RECOVERY_PASSWORD }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'password_reset' } }
    );
    check(resetRes, { 'reset-password: статус 200': (r) => r.status === 200 });
  });

  // 0b. Переключаемся на клиента
  const vuClient = __VU % CLIENT_POOL_SIZE;
  const clientEmail = `${CLIENT_EMAIL_PREFIX}-${vuClient}@example.com`;
  const clientLoginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: clientEmail, password: CLIENT_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } }
  );
  const clientLoginOk = check(clientLoginRes, { 'client login: статус 200': (r) => r.status === 200 });
  if (!clientLoginOk) {
    loginFailures.add(1);
    sleep(1);
    return;
  }

  // общий noteId для модулей 4-6
  let clientNoteId = null;
  group('own_notes_lookup', () => {
    const res = http.get(`${BASE_URL}/api/notes?limit=5`, { tags: { endpoint: 'client_notes_list' } });
    if (check(res, { 'client notes: статус 200': (r) => r.status === 200 })) {
      const items = JSON.parse(res.body).items || [];
      if (items.length > 0) clientNoteId = items[0].id;
    }
  });

  if (clientNoteId) {
    // 4. Вложения
    if (ATTACHMENTS_ENABLED) {
      group('attachments', () => {
        const fileContent = `k6 load test attachment ${Date.now()}`;
        const uploadRes = http.post(
          `${BASE_URL}/api/notes/${clientNoteId}/attachments`,
          { file: http.file(fileContent, 'load-test.txt', 'text/plain') },
          { tags: { endpoint: 'attachment_upload' } }
        );
        const uploadOk = check(uploadRes, { 'upload attachment: статус 200': (r) => r.status === 200 });

        const listRes = http.get(
          `${BASE_URL}/api/notes/${clientNoteId}/attachments`,
          { tags: { endpoint: 'attachment_list' } }
        );
        check(listRes, { 'list attachments: статус 200': (r) => r.status === 200 });

        if (uploadOk) {
          const attachmentId = JSON.parse(uploadRes.body).id;
          const deleteRes = http.del(
            `${BASE_URL}/api/attachments/${attachmentId}`,
            null,
            { tags: { endpoint: 'attachment_delete' } }
          );
          check(deleteRes, { 'delete attachment: статус 2xx': (r) => r.status >= 200 && r.status < 300 });
        }
      });
    }

    // 5. Ревизии заметок
    group('note_revisions', () => {
      const updateRes = http.put(
        `${BASE_URL}/api/notes/${clientNoteId}`,
        JSON.stringify({ title: `Note updated by load test ${Date.now()}` }),
        { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'note_update' } }
      );
      check(updateRes, { 'update note (создаёт ревизию): статус 200': (r) => r.status === 200 });

      const revisionsRes = http.get(
        `${BASE_URL}/api/notes/${clientNoteId}/revisions`,
        { tags: { endpoint: 'note_revisions_list' } }
      );
      check(revisionsRes, { 'list revisions: статус 200': (r) => r.status === 200 });
    });

    // 6. Права доступа
    group('permission_access', () => {
      const targetVu = (vuClient + 1) % CLIENT_POOL_SIZE;
      const targetEmailPrefix = `${CLIENT_EMAIL_PREFIX}-${targetVu}`;

      const searchRes = http.get(
        `${BASE_URL}/api/users/search?q=${encodeURIComponent(targetEmailPrefix)}`,
        { tags: { endpoint: 'permission_target_search' } }
      );
      if (!check(searchRes, { 'search target user: статус 200': (r) => r.status === 200 })) return;
      const target = JSON.parse(searchRes.body)[0];
      if (!target) return;

      const grantRes = http.post(
        `${BASE_URL}/api/permissions`,
        JSON.stringify({ type: 'View', noteId: clientNoteId, userId: target.id }),
        { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'permission_grant' } }
      );
      const grantOk = check(grantRes, { 'grant permission: статус 200': (r) => r.status === 200 });

      const listRes = http.get(
        `${BASE_URL}/api/notes/${clientNoteId}/permissions`,
        { tags: { endpoint: 'permission_list' } }
      );
      check(listRes, { 'list permissions: статус 200': (r) => r.status === 200 });

      if (grantOk) {
        const permissionId = JSON.parse(grantRes.body).id;
        const revokeRes = http.del(
          `${BASE_URL}/api/permissions/${permissionId}`,
          null,
          { tags: { endpoint: 'permission_revoke' } }
        );
        check(revokeRes, { 'revoke permission: статус 2xx': (r) => r.status >= 200 && r.status < 300 });
      }
    });

    // 7. Аналитика
    group('analytics', () => {
      const res = http.get(`${BASE_URL}/api/analytics`, { tags: { endpoint: 'analytics_get' } });
      check(res, { 'analytics: статус 200': (r) => r.status === 200 });
    });
  }

  sleep(1);
}