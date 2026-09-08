export const analyticsStats = [
  {
    label: "Всего заметок",
    value: "12",
    change: "+3 за месяц",
    trend: "up",
    accent: true,
  },
  { label: "Завершено задач", value: "8", change: "+2 за месяц", trend: "up" },
  { label: "В работе", value: "3", change: "−1 за месяц", trend: "down" },
  { label: "Совместный доступ", value: "4", change: "+1 за месяц", trend: "up" },
];

export const notesPerWeek = [
  { week: "1 нед", value: 30 },
  { week: "2 нед", value: 55 },
  { week: "3 нед", value: 45 },
  { week: "4 нед", value: 75 },
  { week: "5 нед", value: 90 },
  { week: "6 нед", value: 65 },
  { week: "7 нед", value: 40 },
  { week: "8 нед", value: 85 },
];

export const directoryNotes = [
  { dir: "Рабочие", value: 70, colorKey: "primary" },
  { dir: "Личные", value: 50, colorKey: "secondary" },
  { dir: "Иссл.", value: 40, colorKey: "secondary" },
  { dir: "Без папки", value: 20, colorKey: "secondary" },
];

export const progressData = { percent: 75, done: 8, inProgress: 3, todo: 1 };

export const recentActivity = [
  {
    type: "create",
    text: "Создана заметка «Дизайн-ревью интерфейса v2»",
    time: "Сегодня, 10:15",
  },
  {
    type: "complete",
    text: "Задача «Проверить контрастность» завершена",
    time: "Вчера, 16:42",
  },
  {
    type: "share",
    text: "Доступ к «Спринт Q3» предоставлен Дмитрию С.",
    time: "12 авг, 09:30",
  },
  {
    type: "create",
    text: "Создана заметка «Техническое задание: API авторизации»",
    time: "8 авг, 14:20",
  },
  {
    type: "complete",
    text: "Задача «Настроить CI/CD» завершена",
    time: "12 авг, 11:05",
  },
];

export const privacyOptions = [
  { key: "private", label: "Только я", desc: "— приватная заметка" },
  { key: "link", label: "По ссылке", desc: "— кто угодно с ссылкой" },
  { key: "team", label: "Команда", desc: "— только добавленные люди" },
  { key: "public", label: "Публичная", desc: "— видна всем в организации" },
];
