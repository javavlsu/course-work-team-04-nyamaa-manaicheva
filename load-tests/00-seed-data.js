// Одноразовый скрипт подготовки тестовой выборки.
// k6 run --vus 1 --iterations 1 00-seed-data.js

import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// клиентский пул
const CLIENT_POOL_SIZE = Number(__ENV.CLIENT_POOL_SIZE || 150);
const NOTES_PER_USER = Number(__ENV.NOTES_PER_USER || 300);
const DIRECTORIES_PER_USER = Number(__ENV.DIRECTORIES_PER_USER || 5);
const NOTES_PER_DIRECTORY = Number(__ENV.NOTES_PER_DIRECTORY || 5);
const COMMENTS_PER_NOTE = Number(__ENV.COMMENTS_PER_NOTE || 5);
const KANBAN_TASKS_PER_COLUMN = Number(__ENV.KANBAN_TASKS_PER_COLUMN || 3);
const CALENDAR_EVENTS_PER_USER = Number(__ENV.CALENDAR_EVENTS_PER_USER || 5);
const EMAIL_PREFIX = __ENV.CLIENT_EMAIL_PREFIX || 'loadtest-client';
const PASSWORD = __ENV.CLIENT_PASSWORD || 'LoadTest123!';

// пул админов
const ADMIN_EMAIL_PREFIX = __ENV.ADMIN_EMAIL_PREFIX || 'loadtest-admin';
const ADMIN_POOL_SIZE = Number(__ENV.ADMIN_POOL_SIZE || 150);
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'LoadTest123!';

// отдельный аккаунт для сценария восстановления пароля
const RECOVERY_EMAIL = __ENV.RECOVERY_EMAIL || 'loadtest-recovery@example.com';
const RECOVERY_PASSWORD = __ENV.CLIENT_PASSWORD || 'LoadTest123!';

const jsonHeaders = { headers: { 'Content-Type': 'application/json' } };

function registerUser(email, password) {
  const res = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      name: 'Load',
      surname: 'Test',
      email,
      birthdayDate: '2000-01-01',
      password,
      passwordConfirm: password,
    }),
    jsonHeaders
  );
  const ok = res.status === 201 || (res.status === 400 && res.body.includes('уже зарегистрирован'));
  check(res, { [`register ${email}: ok`]: () => ok });
  return ok;
}

function login(email, password) {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password }),
    jsonHeaders
  );
  check(res, { [`login ${email}: 200`]: (r) => r.status === 200 });
  return res.status === 200;
}

function createNote(title, content) {
  const res = http.post(
    `${BASE_URL}/api/notes`,
    JSON.stringify({ title, content, noteType: 'Empty', isFavourite: false }),
    jsonHeaders
  );
  if (res.status !== 200) return null;
  return JSON.parse(res.body);
}

function createDirectory(title) {
  const res = http.post(`${BASE_URL}/api/directories`, JSON.stringify({ title }), jsonHeaders);
  if (res.status !== 200) return null;
  return JSON.parse(res.body);
}

function addNoteToDirectory(directoryId, noteId) {
  return http.post(`${BASE_URL}/api/directories/${directoryId}/notes/${noteId}`, null, jsonHeaders).status === 200;
}

function createComment(noteId, content) {
  return http.post(
    `${BASE_URL}/api/notes/${noteId}/comments`,
    JSON.stringify({ content }),
    jsonHeaders
  ).status === 200;
}

function ensureKanbanBoard() {
  const res = http.get(`${BASE_URL}/api/kanban/board`, jsonHeaders);
  if (res.status !== 200) return null;
  return JSON.parse(res.body);
}

function createKanbanColumn(boardId, title, position) {
  const res = http.post(
    `${BASE_URL}/api/kanban/boards/${boardId}/columns`,
    JSON.stringify({ title, position }),
    jsonHeaders
  );
  if (res.status !== 200) return null;
  return JSON.parse(res.body);
}

function createKanbanTask(columnId, title, position) {
  return http.post(
    `${BASE_URL}/api/kanban/columns/${columnId}/tasks`,
    JSON.stringify({ title, description: '', position }),
    jsonHeaders
  ).status === 200;
}

function ensureCalendar() {
  const res = http.get(`${BASE_URL}/api/calendar`, jsonHeaders);
  if (res.status !== 200) return null;
  return JSON.parse(res.body);
}

function toLocalIso(date) {
  return date.toISOString().slice(0, 23);
}

function createCalendarEvent(calendarId, title, startAt, endAt) {
  return http.post(
    `${BASE_URL}/api/calendar/${calendarId}/events`,
    JSON.stringify({ title, description: '', startAt, endAt, allDay: false }),
    jsonHeaders
  ).status === 200;
}

export default function () {
  // клиентский пул
  for (let u = 0; u < CLIENT_POOL_SIZE; u++) {
    const email = `${EMAIL_PREFIX}-${u}@example.com`;
    registerUser(email, PASSWORD);

    if (!login(email, PASSWORD)) {
      console.error(`Не удалось войти под ${email}, пропускаю`);
      continue;
    }

    // заметки
    const noteIds = [];
    for (let n = 0; n < NOTES_PER_USER; n++) {
      const note = createNote(`Load test note #${n}`, { text: `Автосгенерированная заметка №${n}` });
      if (note) noteIds.push(note.id);
    }

    // директории + заметки в первой директории
    for (let d = 0; d < DIRECTORIES_PER_USER; d++) {
      const dir = createDirectory(`Load test directory #${d}`);
      if (dir && d === 0) {
        for (let i = 0; i < Math.min(NOTES_PER_DIRECTORY, noteIds.length); i++) {
          addNoteToDirectory(dir.id, noteIds[i]);
        }
      }
    }

    // комментарии на первой заметке
    if (noteIds.length > 0) {
      for (let c = 0; c < COMMENTS_PER_NOTE; c++) {
        createComment(noteIds[0], `Комментарий #${c} для нагрузочного теста`);
      }
    }

    // канбан: доска (auto-create) + 2 колонки + задачи в первой
    const board = ensureKanbanBoard();
    if (board) {
      const colTodo = createKanbanColumn(board.id, 'To Do', 0);
      createKanbanColumn(board.id, 'Done', 1);
      if (colTodo) {
        for (let t = 0; t < KANBAN_TASKS_PER_COLUMN; t++) {
          createKanbanTask(colTodo.id, `Задача #${t}`, t);
        }
      }
    }

    // календарь: auto-create + события на ближайшие дни
    const calendar = ensureCalendar();
    if (calendar) {
      for (let e = 0; e < CALENDAR_EVENTS_PER_USER; e++) {
        const start = new Date(Date.now() + e * 24 * 3600 * 1000);
        const end = new Date(start.getTime() + 3600 * 1000);
        createCalendarEvent(calendar.id, `Событие #${e}`, toLocalIso(start), toLocalIso(end));
      }
    }

    console.log(`${email}: заметок=${noteIds.length}, директорий=${DIRECTORIES_PER_USER}, канбан=ok, календарь=ok`);
  }

  // пул админов
  for (let a = 0; a < ADMIN_POOL_SIZE; a++) {
    const adminEmail = `${ADMIN_EMAIL_PREFIX}-${a}@example.com`;
    registerUser(adminEmail, ADMIN_PASSWORD);
  }

  // отдельный аккаунт для восстановления пароля
  registerUser(RECOVERY_EMAIL, RECOVERY_PASSWORD);

  console.log(
    `\nПул кандидатов в админы: ${ADMIN_EMAIL_PREFIX}-0..${ADMIN_POOL_SIZE - 1}@example.com (${ADMIN_POOL_SIZE} шт.).\n` +
    `Коменда для выдачи роли Admin: UPDATE "User" SET role = 'Admin' WHERE email LIKE '${ADMIN_EMAIL_PREFIX}-%@example.com';\n`
  );

}