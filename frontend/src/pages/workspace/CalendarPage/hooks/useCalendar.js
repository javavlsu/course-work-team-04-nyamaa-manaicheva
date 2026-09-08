import { useCallback, useMemo, useState } from "react";

export const CATEGORY_META = {
  work: { label: "Рабочие задачи", color: "var(--accent)" },
  personal: { label: "Личные заметки", color: "var(--success)" },
  deadline: { label: "Дедлайн", color: "var(--danger)" },
};

const MOCK_EVENTS = [
  { id: "ev-01", title: "Спринт Q3 — старт", start: "2026-08-03", end: "2026-08-03", allDay: true, category: "work", noteIds: [] },
  { id: "ev-02", title: "Встреча с заказчиком: тренд-анализ", start: "2026-08-05", end: "2026-08-05", allDay: true, category: "personal", noteIds: [] },
  { id: "ev-03", title: "Техническое задание: API авторизации", start: "2026-08-08", end: "2026-08-08", allDay: true, category: "work", noteIds: [] },
  { id: "ev-04", title: "Дедлайн: REST API", start: "2026-08-10", end: "2026-08-10", allDay: true, category: "deadline", noteIds: [] },
  { id: "ev-05", title: "Спринт Q3 — приоритеты", start: "2026-08-12", end: "2026-08-12", allDay: true, category: "work", noteIds: [] },
  { id: "ev-06", title: "Дизайн-ревью интерфейса v2", start: "2026-08-14", end: "2026-08-14", allDay: true, category: "work", noteIds: [] },
  { id: "ev-07", title: "Дедлайн: ТЗ API", start: "2026-08-14", end: "2026-08-14", allDay: true, category: "personal", noteIds: [] },
  { id: "ev-08", title: "Согласовать типографику", start: "2026-08-18", end: "2026-08-18", allDay: true, category: "deadline", noteIds: [] },
  { id: "ev-09", title: "Интеграция с Google Calendar", start: "2026-08-19", end: "2026-08-19", allDay: true, category: "work", noteIds: [] },
  { id: "ev-10", title: "Hover-состояния кнопок", start: "2026-08-20", end: "2026-08-20", allDay: true, category: "work", noteIds: [] },
  { id: "ev-11", title: "Оптимизация изображений", start: "2026-08-21", end: "2026-08-21", allDay: true, category: "work", noteIds: [] },
  { id: "ev-12", title: "Mobile-adaptive проверка", start: "2026-08-22", end: "2026-08-22", allDay: true, category: "personal", noteIds: [] },
  { id: "ev-13", title: "Документация API", start: "2026-08-25", end: "2026-08-25", allDay: true, category: "work", noteIds: [] },
];

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  const events = useMemo(() => MOCK_EVENTS, []);

  const eventsByDate = useMemo(() => {
    const byDate = new Map();
    for (const event of MOCK_EVENTS) {
      const day = byDate.get(event.start) ?? [];
      day.push(event);
      byDate.set(event.start, day);
    }
    return byDate;
  }, []);

  const openDay = useCallback((dateStr) => setSelectedDate(dateStr), []);
  const closeDay = useCallback(() => setSelectedDate(null), []);

  const getDayEvents = useCallback(
    (dateStr) =>
      (eventsByDate.get(dateStr) ?? []).map((event) => ({
        title: event.title,
        cat: CATEGORY_META[event.category]?.label ?? "",
        color: CATEGORY_META[event.category]?.color ?? "var(--muted)",
      })),
    [eventsByDate],
  );

  return { events, selectedDate, openDay, closeDay, getDayEvents };
}