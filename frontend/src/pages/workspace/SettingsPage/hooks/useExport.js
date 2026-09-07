import { useCallback, useState } from "react";

import { list as listNotes } from "../../../../api/notes";

export default function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const exportAll = useCallback(async () => {
    setError("");
    setIsExporting(true);

    try {
      const items = [];
      let cursor = null;
      let hasMore = true;

      while (hasMore) {
        const page = await listNotes({ limit: 100, cursor });
        items.push(...page.items);
        hasMore = page.hasMore;
        cursor = page.nextCursor;
        if (!cursor) break;
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        notes: items,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `notesbook-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Не удалось выгрузить заметки");
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { isExporting, error, exportAll };
}