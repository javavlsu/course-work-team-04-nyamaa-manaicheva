import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as calendarApi from "@/api/calendar.js";

function toDateTime(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
}

function mapEvent(event) {
  return {
    id: event.id,
    title: event.title,
    start: event.allDay ? event.startAt.slice(0, 10) : event.startAt,
    end: event.allDay ? event.endAt.slice(0, 10) : event.endAt,
    allDay: event.allDay,
    noteId: event.noteId,
  };
}

export function useCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCalendar, setHasCalendar] = useState(false);

  const requestSeqRef = useRef(0);
  const abortRef = useRef(null);
  const calendarIdRef = useRef(null);
  const loadedRangeRef = useRef(null);
  const pendingRangeRef = useRef(null);
  const lastRequestedRef = useRef(null);

  const fetchRange = useCallback((from, to, force = false) => {
    const calendarId = calendarIdRef.current;
    if (!calendarId) {
      pendingRangeRef.current = { from, to };
      return;
    }

    const key = `${calendarId}|${from}|${to}`;
    if (!force && loadedRangeRef.current?.key === key) return;

    lastRequestedRef.current = { from, to };

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const seq = ++requestSeqRef.current;

    setIsLoading(true);
    setError(null);

    calendarApi
      .getEventsByRange(calendarId, from, to, { signal: controller.signal })
      .then((data) => {
        if (seq !== requestSeqRef.current) return;
        setEvents(data.map(mapEvent));
        loadedRangeRef.current = { key, from, to };
        setIsLoading(false);
      })
      .catch((err) => {
        if (seq !== requestSeqRef.current) return;
        setError(err.message || "Не удалось загрузить события");
        setIsLoading(false);
      });
  }, []);

  const fetchCalendar = useCallback(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    const seq = ++requestSeqRef.current;

    setError(null);
    setIsLoading(true);

    calendarApi
      .getMyCalendar({ signal: controller.signal })
      .then((calendar) => {
        if (seq !== requestSeqRef.current) return;
        calendarIdRef.current = calendar.id;
        setHasCalendar(true);
        const pending = pendingRangeRef.current;
        setIsLoading(false);
        if (pending) {
          pendingRangeRef.current = null;
          fetchRange(pending.from, pending.to);
        }
      })
      .catch((err) => {
        if (seq !== requestSeqRef.current) return;
        setError(err.message || "Не удалось загрузить календарь");
        setIsLoading(false);
      });
  }, [fetchRange]);

  useEffect(() => {
    fetchCalendar();
    return () => {
      requestSeqRef.current += 1;
      abortRef.current?.abort();
    };
  }, [fetchCalendar]);

  const loadRange = useCallback(
    (from, to) => {
      fetchRange(toDateTime(from), toDateTime(to));
    },
    [fetchRange],
  );

  const reload = useCallback(() => {
    if (!calendarIdRef.current) {
      fetchCalendar();
      return;
    }
    const range = loadedRangeRef.current ?? lastRequestedRef.current ?? pendingRangeRef.current;
    if (range) {
      fetchRange(range.from, range.to, true);
      return;
    }
    fetchCalendar();
  }, [fetchCalendar, fetchRange]);

  const addEvent = useCallback(
    async (payload) => {
      const calendarId = calendarIdRef.current;
      if (!calendarId) {
        throw new Error("Календарь не загружен");
      }
      await calendarApi.createEvent(calendarId, payload);
      const range = loadedRangeRef.current ?? lastRequestedRef.current;
      if (range) {
        fetchRange(range.from, range.to, true);
      }
    },
    [fetchRange],
  );

  const eventsByDate = useMemo(() => {
    const byDate = new Map();
    for (const event of events) {
      const day = event.start.slice(0, 10);
      const bucket = byDate.get(day) ?? [];
      bucket.push(event);
      byDate.set(day, bucket);
    }
    return byDate;
  }, [events]);

  const openDay = useCallback((dateStr) => setSelectedDate(String(dateStr).slice(0, 10)), []);
  const closeDay = useCallback(() => setSelectedDate(null), []);

  const getDayEvents = useCallback(
    (dateStr) => eventsByDate.get(String(dateStr).slice(0, 10)) ?? [],
    [eventsByDate],
  );

  return {
    events,
    selectedDate,
    isLoading,
    error,
    hasCalendar,
    openDay,
    closeDay,
    getDayEvents,
    loadRange,
    reload,
    addEvent,
  };
}