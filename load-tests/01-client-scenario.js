// Клиентский сценарий:
//   1. Заметки — список
//   2. Заметки — конкретная заметка
//   3. Директории — список
//   4. Директории — добавление/удаление заметки из директории
//   5. Комментарии — создание + список
//   6. Канбан — доска + перемещение задачи между колонками
//   7. Календарь — получение + события за диапазон дат
// k6 run 01-client-scenario.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const POOL_SIZE = Number(__ENV.CLIENT_POOL_SIZE || 150);
const EMAIL_PREFIX = __ENV.CLIENT_EMAIL_PREFIX || 'loadtest-client';
const PASSWORD = __ENV.CLIENT_PASSWORD || 'LoadTest123!';
const THINK_TIME = Number(__ENV.THINK_TIME || 3);

const getNotesTrend = new Trend('get_notes_duration', true);
const loginFailures = new Counter('login_failures');
const getNotesFailures = new Counter('get_notes_failures');

const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };

export const options = {
  scenarios: {
    client_read_load: {
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
    get_notes_duration: ['p(95)<800'],
    'http_req_duration{endpoint:login}': ['p(95)<500'],
    'http_req_duration{endpoint:kanban_move}': ['p(95)<500'],
    'http_req_duration{endpoint:calendar_events}': ['p(95)<500'],
  },
};

export default function () {
  const vuUser = __VU % POOL_SIZE;
  const email = `${EMAIL_PREFIX}-${vuUser}@example.com`;

  // 0. Вход в систему
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } }
  );
  const loginOk = check(loginRes, { 'login: статус 200': (r) => r.status === 200 });
  if (!loginOk) {
    loginFailures.add(1);
    sleep(1);
    return;
  }

  // 1. Заметки: список
  let notesItems = [];
  group('notes_list', () => {
    const res1 = http.get(`${BASE_URL}/api/notes?limit=20`, { tags: { endpoint: 'notes_list' } });
    getNotesTrend.add(res1.timings.duration);
    if (!check(res1, { 'notes #1: статус 200': (r) => r.status === 200 })) getNotesFailures.add(1);

    sleep(THINK_TIME);

    const res2 = http.get(`${BASE_URL}/api/notes?limit=20`, { tags: { endpoint: 'notes_list' } });
    getNotesTrend.add(res2.timings.duration);
    if (!check(res2, { 'notes #2: статус 200': (r) => r.status === 200 })) getNotesFailures.add(1);

    if (res2.status === 200) {
      notesItems = JSON.parse(res2.body).items || [];
    }
  });

  if (notesItems.length === 0) {
    sleep(1);
    return;
  }

  const primaryNoteId = notesItems[0].id;
  const spareNoteId = notesItems[notesItems.length - 1].id;

  // 2. Заметки: деталь
  group('notes_detail', () => {
    const res = http.get(`${BASE_URL}/api/notes/${primaryNoteId}`, { tags: { endpoint: 'notes_detail' } });
    check(res, { 'note detail: статус 200': (r) => r.status === 200 });
  });

  // 3. Директории: список
  let directories = [];
  group('directories_list', () => {
    const res = http.get(`${BASE_URL}/api/directories?limit=20`, { tags: { endpoint: 'directories_list' } });
    check(res, { 'directories: статус 200': (r) => r.status === 200 });
    if (res.status === 200) {
      directories = JSON.parse(res.body).items || [];
    }
  });

  // 4. Директории: добавить заметку и сразу убрать
  if (directories.length > 0) {
    const dirId = directories[0].id;
    group('directory_note_link', () => {
      const addRes = http.post(
        `${BASE_URL}/api/directories/${dirId}/notes/${spareNoteId}`,
        null,
        { tags: { endpoint: 'directory_note_add' } }
      );
      check(addRes, { 'add note to directory: статус 200': (r) => r.status === 200 });

      const removeRes = http.del(
        `${BASE_URL}/api/directories/${dirId}/notes/${spareNoteId}`,
        null,
        { tags: { endpoint: 'directory_note_remove' } }
      );
      check(removeRes, { 'remove note from directory: статус 2xx': (r) => r.status >= 200 && r.status < 300 });
    });
  }

  // 5. Комментарии: создать + получить список
  group('comments', () => {
    const createRes = http.post(
      `${BASE_URL}/api/notes/${primaryNoteId}/comments`,
      JSON.stringify({ content: `k6 comment ${Date.now()}` }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'comment_create' } }
    );
    check(createRes, { 'create comment: статус 200': (r) => r.status === 200 });

    const listRes = http.get(`${BASE_URL}/api/notes/${primaryNoteId}/comments`, { tags: { endpoint: 'comment_list' } });
    check(listRes, { 'list comments: статус 200': (r) => r.status === 200 });
  });

  // 6. Канбан: доска + перемещение задачи между колонками
  group('kanban', () => {
    const boardRes = http.get(`${BASE_URL}/api/kanban/board`, { tags: { endpoint: 'kanban_board' } });
    const boardOk = check(boardRes, { 'kanban board: статус 200': (r) => r.status === 200 });
    if (!boardOk) return;

    const board = JSON.parse(boardRes.body);
    if (!board.columns || board.columns.length < 2) return;

    const [colA, colB] = board.columns;
    const task = (colA.tasks && colA.tasks[0]) || (colB.tasks && colB.tasks[0]);
    if (!task) return;

    const targetColumnId = task.columnId === colA.id ? colB.id : colA.id;
    const moveRes = http.patch(
      `${BASE_URL}/api/kanban/tasks/${task.id}/move`,
      JSON.stringify({ targetColumnId, position: 0 }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'kanban_move' } }
    );
    check(moveRes, { 'move task: статус 200': (r) => r.status === 200 });
  });

  // 7. Календарь: получение + события за диапазон
  group('calendar', () => {
    const calendarRes = http.get(`${BASE_URL}/api/calendar`, { tags: { endpoint: 'calendar_get' } });
    const calendarOk = check(calendarRes, { 'calendar: статус 200': (r) => r.status === 200 });
    if (!calendarOk) return;

    const calendarId = JSON.parse(calendarRes.body).id;
    const from = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 23);
    const to = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 23);

    const eventsRes = http.get(
      `${BASE_URL}/api/calendar/${calendarId}/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { tags: { endpoint: 'calendar_events' } }
    );
    check(eventsRes, { 'calendar events: статус 200': (r) => r.status === 200 });
  });

  sleep(1);
}