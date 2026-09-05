export const mockNotes = [
  {
    id: 1,
    folder: "design",
    title: "Дизайн-ревью интерфейса v2",
    excerpt:
      "Проверить контрастность текста на карточках, обновить отступы в боковой панели и согласовать типографику с новым брендбуком.",
    createdAt: "14 авг 2026",
    updatedAt: "14 авг 2026, 15:32",
    tag: "Список",
    favorited: true,
    content: `## Задачи по ревью

- [x] Проверить контрастность текста на карточках
- [x] Обновить отступы в боковой панели
- [ ] Согласовать типографику с брендбуком
- [ ] Проверить hover-состояния на кнопках
- [ ] Сверить mobile-adaptive с макетом
- [ ] Отправить на ревью тимлиду

## Таблица статусов

| Задача | Ответственный | Статус | Приоритет | Срок |
|--------|--------------|--------|-----------|------|
| Проверить контрастность | Алексей В. | Готово | Высокий | 15 авг 2026 |
| Обновить отступы | Мария К. | Готово | Средний | 16 авг 2026 |
| Согласовать типографику | Алексей В. | В работе | Высокий | 18 авг 2026 |
| Проверить hover-состояния | Дмитрий С. | К выполнению | Средний | 20 авг 2026 |`,
  },
  {
    id: 2,
    folder: "work",
    title: "Спринт Q3 — приоритеты",
    excerpt:
      "Запуск бета-версии, миграция на новую архитектуру, найм двух фронтенд-разработчиков.",
    createdAt: "12 авг 2026",
    updatedAt: "12 авг 2026, 11:20",
    tag: "Таблица",
    favorited: false,
    content: `## Приоритеты спринта

Запуск бета-версии намечен на конец августа.

- Миграция на новую архитектуру
- Найм двух фронтенд-разработчиков
- Стабилизация сборки`,
  },
  {
    id: 3,
    folder: "work",
    title: "Интервью с заказчиком",
    excerpt:
      "Пользователи хотят быстрый поиск, offline-режим и интеграцию с календарём. Приоритет — offline.",
    createdAt: "10 авг 2026",
    updatedAt: "10 авг 2026, 14:05",
    tag: "Список",
    favorited: false,
    content: `## Интервью с заказчиком

Ключевые запросы пользователей:

- Быстрый поиск по заметкам
- Offline-режим
- Интеграция с календарём`,
  },
  {
    id: 4,
    folder: "work",
    title: "ТЗ: API авторизации",
    excerpt:
      "REST API для регистрации, логина, восстановления пароля. JWT токены, refresh mechanism.",
    createdAt: "8 авг 2026",
    updatedAt: "8 авг 2026, 09:45",
    tag: "Таблица",
    favorited: true,
    content: `## ТЗ: API авторизации

REST API для регистрации, логина и восстановления пароля.

- JWT токены и refresh mechanism
- Ограничение числа попыток входа`,
  },
  {
    id: 5,
    folder: "marketing",
    title: "Маркетинговая кампания",
    excerpt:
      "Запуск через Telegram-канал, партнёрство с блогерами, серия лонгридов о productivity.",
    createdAt: "5 авг 2026",
    updatedAt: "5 авг 2026, 16:30",
    tag: "Список",
    favorited: false,
    avatars: ["МК", "ДС"],
    content: `## Маркетинговая кампания

План запуска на август.

- Анонс в Telegram-канале
- Партнёрство с блогерами
- Серия лонгридов о productivity`,
  },
  {
    id: 6,
    folder: "work",
    title: "Матрица приоритетов",
    excerpt:
      "Распределение по оси «Важность» × «Срочность». Высокий приоритет: критичные баги.",
    createdAt: "3 авг 2026",
    updatedAt: "3 авг 2026, 10:10",
    tag: "Таблица",
    favorited: false,
    content: `## Матрица приоритетов

Распределение по осям «Важность» и «Срочность».

- Высокий приоритет: критичные баги
- Средний: улучшения UX`,
  },
  {
    id: 7,
    folder: "work",
    title: "Чек-лист релиза v1.0",
    excerpt:
      "Финальное тестирование, обновление документации, настройка мониторинга, changelog.",
    createdAt: "1 авг 2026",
    updatedAt: "1 авг 2026, 12:00",
    tag: "Список",
    favorited: true,
    content: `## Чек-лист релиза v1.0

- [x] Финальное тестирование
- [x] Обновление документации
- [ ] Настройка мониторинга
- [ ] Changelog`,
  },
  {
    id: 8,
    folder: "design",
    title: "Цвета в UI",
    excerpt:
      "Тёплые нейтралы для фона, один акцентный цвет для CTA. Избегать холодных оттенков.",
    createdAt: "28 июл 2026",
    updatedAt: "28 июл 2026, 18:40",
    tag: "Список",
    favorited: false,
    content: `## Цвета в UI

Тёплые нейтралы для фона, один акцентный цвет для CTA.

- Избегать холодных оттенков
- Проверять контраст по WCAG`,
  },
];

export const calendarEvents = {
  3: [{ label: "Спринт Q3", type: "work" }],
  5: [{ label: "Встреча с заказчиком", type: "personal" }],
  8: [{ label: "ТЗ: API", type: "work" }],
  10: [{ label: "Дедлайн API", type: "deadline" }],
  12: [{ label: "Приоритеты Q3", type: "work" }],
  14: [
    { label: "Дизайн-ревью", type: "work" },
    { label: "Дедлайн ТЗ", type: "personal" },
  ],
  18: [{ label: "Типографика", type: "deadline" }],
  19: [{ label: "Google Calendar", type: "work" }],
  20: [{ label: "Hover-состояния", type: "work" }],
  21: [{ label: "Оптимизация", type: "work" }],
  22: [{ label: "Mobile-adaptive", type: "personal" }],
  25: [{ label: "Документация API", type: "work" }],
};

export const calendarDayDetails = {
  3: [{ title: "Спринт Q3 — старт", cat: "Рабочие задачи", color: "var(--accent)" }],
  5: [{ title: "Встреча с заказчиком: тренд-анализ", cat: "Личные заметки", color: "var(--success)" }],
  8: [{ title: "Техническое задание: API авторизации", cat: "Рабочие задачи", color: "var(--accent)" }],
  10: [{ title: "Дедлайн: REST API", cat: "Рабочие задачи", color: "var(--danger)" }],
  12: [{ title: "Спринт Q3 — приоритеты", cat: "Рабочие задачи", color: "var(--accent)" }],
  14: [
    { title: "Дизайн-ревью интерфейса v2", cat: "Рабочие задачи", color: "var(--accent)" },
    { title: "Дедлайн: ТЗ API", cat: "Личные заметки", color: "var(--success)" },
  ],
  18: [{ title: "Согласовать типографику", cat: "Рабочие задачи", color: "var(--danger)" }],
  19: [{ title: "Интеграция с Google Calendar", cat: "Рабочие задачи", color: "var(--accent)" }],
  20: [{ title: "Hover-состояния кнопок", cat: "Рабочие задачи", color: "var(--accent)" }],
  21: [{ title: "Оптимизация изображений", cat: "Рабочие задачи", color: "var(--accent)" }],
  22: [{ title: "Mobile-adaptive проверка", cat: "Личные заметки", color: "var(--success)" }],
  25: [{ title: "Документация API", cat: "Рабочие задачи", color: "var(--accent)" }],
};

export const mockColumns = [
  {
    key: "todo",
    title: "К выполнению",
    dotClass: "todo",
    dotStyle: null,
    cards: [
      {
        id: 1,
        title: "Проверить hover-состояния на кнопках",
        priority: "medium",
        label: "Средний",
        avatar: "ДС",
        date: "20 авг 2026",
      },
      {
        id: 2,
        title: "Сверить mobile-adaptive с макетом",
        priority: "medium",
        label: "Средний",
        avatar: "АВ",
        date: "22 авг 2026",
      },
      {
        id: 3,
        title: "Написать unit-тесты для API",
        priority: "urgent",
        label: "Высокий",
        avatar: "МК",
        date: "18 авг 2026",
      },
      {
        id: 4,
        title: "Обновить документацию API",
        priority: "low",
        label: "Низкий",
        avatar: "ДС",
        date: "25 авг 2026",
      },
    ],
  },
  {
    key: "progress",
    title: "В работе",
    dotClass: "progress",
    dotStyle: null,
    cards: [
      {
        id: 5,
        title: "Согласовать типографику с брендбуком",
        priority: "urgent",
        label: "Высокий",
        avatar: "АВ",
        date: "18 авг 2026",
      },
      {
        id: 6,
        title: "Интеграция с календарём Google",
        priority: "urgent",
        label: "Высокий",
        avatar: "МК",
        date: "19 авг 2026",
      },
      {
        id: 7,
        title: "Оптимизация загрузки изображений",
        priority: "medium",
        label: "Средний",
        avatar: "ДС",
        date: "21 авг 2026",
      },
    ],
  },
  {
    key: "review",
    title: "На проверке",
    dotClass: "",
    dotStyle: { background: "var(--info)" },
    cards: [
      {
        id: 8,
        title: "Обновить отступы в боковой панели",
        priority: "medium",
        label: "Средний",
        avatar: "МК",
        date: "16 авг 2026",
      },
      {
        id: 9,
        title: "Отправить на ревью тимлиду",
        priority: "low",
        label: "Низкий",
        avatar: "АВ",
        date: "17 авг 2026",
      },
    ],
  },
  {
    key: "done",
    title: "Готово",
    dotClass: "done",
    dotStyle: null,
    cards: [
      {
        id: 10,
        title: "Проверить контрастность текста",
        priority: "low",
        label: "Низкий",
        avatar: "АВ",
        date: "14 авг 2026",
        done: true,
      },
      {
        id: 11,
        title: "Настроить CI/CD пайплайн",
        priority: "medium",
        label: "Средний",
        avatar: "ДС",
        date: "12 авг 2026",
        done: true,
      },
    ],
  },
];

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

export const mockComments = [
  {
    author: "Мария К.",
    initials: "МК",
    avatarClass: "av-warm",
    time: "14 авг, 16:05",
    text: "Отступы в боковой панели стали заметно аккуратнее. Проверила на планшете — всё помещается.",
  },
  {
    author: "Дмитрий С.",
    initials: "ДС",
    time: "14 авг, 17:42",
    text: "По типографике: заголовки в превью хорошо смотрятся serif-ом, но в таблице статусов шрифт мелковат. Предлагаю поднять до 14px.",
  },
];

export const privacyOptions = [
  { key: "private", label: "Только я", desc: "— приватная заметка" },
  { key: "link", label: "По ссылке", desc: "— кто угодно с ссылкой" },
  { key: "team", label: "Команда", desc: "— только добавленные люди" },
  { key: "public", label: "Публичная", desc: "— видна всем в организации" },
];
