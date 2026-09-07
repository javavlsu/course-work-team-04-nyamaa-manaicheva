import { useState } from "react";

import {
  analyticsStats,
  directoryNotes,
  notesPerWeek,
  progressData,
  recentActivity,
} from "../../../../lib/utils/mockData";

export const PERIODS = ["Неделя", "Месяц", "Квартал"];

const donutData = [
  {
    id: "done",
    label: "Завершено",
    value: progressData.percent,
    color: "var(--accent)",
  },
  {
    id: "left",
    label: "Осталось",
    value: 100 - progressData.percent,
    color: "var(--border)",
  },
];

export function useAnalytics() {
  const [period, setPeriod] = useState(PERIODS[1]);

  return {
    period,
    onPeriodChange: setPeriod,
    stats: analyticsStats,
    weeklyNotes: notesPerWeek,
    directoryNotes,
    progress: progressData,
    donut: donutData,
    activity: recentActivity,
  };
}