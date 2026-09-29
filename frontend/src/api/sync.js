import { api } from "./client.js";

export function sync(lastSyncAt = null) {
  return api.post("/api/sync", { lastSyncAt });
}