import { useCallback, useEffect, useRef, useState } from "react";

import * as permissionsApi from "@/api/permissions.js";
import * as usersApi from "@/api/users.js";
import { adaptPermission } from "../utils";

export function useNotePermissions(id, isNew, currentUser) {
  const [shareUsers, setShareUsers] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState(null);
  const [isAddingShareUser, setIsAddingShareUser] = useState(false);
  const [removingShareUserId, setRemovingShareUserId] = useState(null);
  const [confirmRemoveShareUserIndex, setConfirmRemoveShareUserIndex] = useState(null);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState("private");
  const [ownerId, setOwnerId] = useState(null);
  const privacyWrapRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        privacyWrapRef.current &&
        !privacyWrapRef.current.contains(e.target)
      ) {
        setPrivacyOpen(false);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () =>
      document.removeEventListener("click", handleDocumentClick);
  }, []);

  const load = useCallback(
    async (ownerIdParam) => {
      if (isNew) return;

      setOwnerId(ownerIdParam ?? null);
      setShareUsers([]);
      setPermissionsError(null);

      if (!currentUser || ownerIdParam !== currentUser.id) return;

      setPermissionsLoading(true);

      try {
        const permissionsList = await permissionsApi.list(id);
        setShareUsers((permissionsList ?? []).map((p) => adaptPermission(p, undefined)));
      } catch (err) {
        setPermissionsError(err.message || "Не удалось загрузить доступ к заметке");
      } finally {
        setPermissionsLoading(false);
      }
    },
    [id, isNew, currentUser],
  );

  const addShareUser = useCallback(
    async (draftValue) => {
      if (isNew || isAddingShareUser) return;

      const trimmed = draftValue.trim();
      if (!trimmed) return;

      setIsAddingShareUser(true);
      setPermissionsError(null);

      try {
        const results = await usersApi.search(trimmed);

        if (!results || results.length === 0) {
          setPermissionsError("Пользователь не найден");
          return;
        }

        const lower = trimmed.toLowerCase();
        const matched =
          results.find((u) => (u.email || "").toLowerCase() === lower) ?? results[0];

        if (matched.id === ownerId) {
          setPermissionsError("Нельзя добавить владельца заметки");
          return;
        }

        if (shareUsers.some((u) => u.userId === matched.id)) {
          setPermissionsError("Этот пользователь уже добавлен");
          return;
        }

        const created = await permissionsApi.grant({
          type: "View",
          noteId: id,
          userId: matched.id,
        });
        setShareUsers((prev) => [...prev, adaptPermission(created, matched)]);
      } catch (err) {
        setPermissionsError(err.message || "Не удалось предоставить доступ");
      } finally {
        setIsAddingShareUser(false);
      }
    },
    [id, isNew, isAddingShareUser, ownerId, shareUsers],
  );

  const removeShareUser = useCallback(
    (index) => {
      if (isNew || removingShareUserId) return;
      setConfirmRemoveShareUserIndex(index);
    },
    [isNew, removingShareUserId],
  );

  const confirmRemoveShareUser = useCallback(async () => {
    if (confirmRemoveShareUserIndex === null) return;

    const target = shareUsers[confirmRemoveShareUserIndex];
    if (!target) return;

    setRemovingShareUserId(target.id);
    setPermissionsError(null);

    try {
      await permissionsApi.remove(target.id);
      setShareUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err) {
      setPermissionsError(err.message || "Не удалось убрать доступ");
    } finally {
      setRemovingShareUserId(null);
      setConfirmRemoveShareUserIndex(null);
    }
  }, [confirmRemoveShareUserIndex, shareUsers]);

  return {
    shareUsers,
    load,
    addShareUser,
    removeShareUser,
    confirmRemoveShareUser,
    privacyOpen,
    togglePrivacy: () => setPrivacyOpen((prev) => !prev),
    privacy,
    selectPrivacy: setPrivacy,
    privacyWrapRef,
    error: permissionsError,
    dismissError: () => setPermissionsError(null),
    confirmRemoveShareUserIndex,
    cancelRemoveShareUser: () => setConfirmRemoveShareUserIndex(null),
  };
}