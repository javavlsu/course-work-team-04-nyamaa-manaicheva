import { useCallback, useState } from "react";

import { sync as syncApi } from "@/api/sync";

const LAST_SYNC_KEY = "nb_last_sync";

export default function useSync() {
  const [lastSyncAt, setLastSyncAt] = useState(
    () => localStorage.getItem(LAST_SYNC_KEY) || "",
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  const sync = useCallback(async () => {
    setError("");
    setIsSyncing(true);

    try {
      const response = await syncApi(null);
      const syncAt = response?.syncAt
        ? new Date(response.syncAt).toISOString()
        : new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, syncAt);
      setLastSyncAt(syncAt);
    } catch (err) {
      setError(err.message || "Не удалось синхронизировать данные");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { lastSyncAt, isSyncing, error, sync };
}