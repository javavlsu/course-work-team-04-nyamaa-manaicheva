/**
 * Analytics API
 *
 * Backend: GET /api/analytics
 * Response: AnalyticsResponse
 *   totalNotes          — все видимые заметки пользователя
 *   favouriteNotes      — из заметок вошедшие в избранное
 *   sharedNotes         — заметки владельца с выданными доступами
 *   notesByType         — Map<NoteTypeEnum, Long>
 *   notesCreatedByWeek  — [ { weekStart: LocalDate, count } ] — фиксированные 8 недель
 *   notesByDirectory    — [ { directoryId, title, notesCount } ]
 *   totalDirectories    — видимые директории
 *   totalComments       — всего комментариев по видимым заметкам
 *   totalAttachments    — всего вложений по видимым заметкам
 */

import { api } from "./client.js";

/**
 * Загружает агрегированную статистику текущего пользователя.
 *
 * @returns {Promise<object>} AnalyticsResponse
 */
export function getAnalytics() {
  return api.get("/api/analytics");
}