/**
 * Sync API
 *
 * Backend contract (SyncContracts.java):
 *   POST /api/sync
 *   SyncRequest   { lastSyncAt: LocalDateTime|null }
 *   SyncResponse  { syncAt, notes[], directories[], directoryNotes[],
 *                   accessibleNoteIds[], accessibleDirectoryIds[] }
 *
 * lastSyncAt == null → сервер возвращает полную видимую пользователю выборку;
 * иначе — только изменения после указанного момента. Значение нужно передавать
 * в ISO-локальном формате ("YYYY-MM-DDTHH:mm:ss"), без смещения.
 */

import { api } from "./client.js";

/**
 * Выполняет pull-синхронизацию с сервером.
 *
 * @param {string|null} [lastSyncAt=null] ISO-локальная дата-время последней
 *   синхронизации или null для полной выборки.
 * @returns {Promise<object>} SyncResponse
 */
export function sync(lastSyncAt = null) {
  return api.post("/api/sync", { lastSyncAt });
}