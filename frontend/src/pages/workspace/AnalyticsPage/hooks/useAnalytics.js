import { useCallback, useEffect, useState } from "react";

import * as analyticsApi from "@/api/analytics";
import * as kanbanApi from "@/api/kanban";

const DONE = "Done";
const IN_PROGRESS = "InProgress";
const TODO = "Todo";

function formatWeekLabel(weekStart) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(weekStart ?? "");
  if (!match) return weekStart ?? "";
  return `${match[3]}.${match[2]}`;
}

function adaptWeeklyNotes(notesCreatedByWeek) {
  return (notesCreatedByWeek ?? []).map((entry) => ({
    week: formatWeekLabel(entry.weekStart),
    value: entry.count,
  }));
}

function adaptDirectoryNotes(notesByDirectory) {
  return (notesByDirectory ?? []).map((entry, index) => ({
    dir: entry.title,
    value: entry.notesCount,
    colorKey: index === 0 ? "primary" : "secondary",
  }));
}

function buildStats(analytics) {
  return [
    { label: "Всего заметок", value: analytics.totalNotes, accent: true },
    { label: "Избранное", value: analytics.favouriteNotes },
    { label: "Совместный доступ", value: analytics.sharedNotes },
    { label: "Директории", value: analytics.totalDirectories },
  ];
}

function computeProgress(board) {
  const tasks = board?.columns?.flatMap((column) => column.tasks ?? []) ?? [];

  let done = 0;
  let inProgress = 0;
  let todo = 0;

  for (const task of tasks) {
    if (task.archived) continue;
    if (task.status === DONE) done += 1;
    else if (task.status === IN_PROGRESS) inProgress += 1;
    else todo += 1;
  }

  const total = todo + inProgress + done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, inProgress, todo, percent };
}

export function useAnalytics() {
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [analytics, board] = await Promise.all([
        analyticsApi.getAnalytics(),
        kanbanApi.getMyBoard(),
      ]);
      setData({
        stats: buildStats(analytics),
        weeklyNotes: adaptWeeklyNotes(analytics.notesCreatedByWeek),
        directoryNotes: adaptDirectoryNotes(analytics.notesByDirectory),
      });
      setProgress(computeProgress(board));
    } catch (err) {
      setError(err.message || "Не удалось загрузить аналитику");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const donut = progress
    ? [
        {
          id: "done",
          label: "Завершено",
          value: progress.percent,
          color: "var(--accent)",
        },
        {
          id: "left",
          label: "Осталось",
          value: 100 - progress.percent,
          color: "var(--border)",
        },
      ]
    : [];

  return {
    data,
    progress,
    donut,
    isLoading,
    error,
    reload: load,
  };
}