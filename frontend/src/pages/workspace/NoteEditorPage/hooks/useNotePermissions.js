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

  // --- Sharing: privacy UI-состояние локально (link/public не поддерживаются backend);
  // shareUsers заполняется реальными permissions (см. load). ownerId аккумулируется из
  // ownerIdParam при load, чтобы addShareUser мог проверить "нельзя добавить владельца".
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

  /**
   * Загружает permissions заметки. Доступно только владельцу заметки —
   * backend вернёт 403 иначе, поэтому запрос вообще не делается, если currentUser не совпадает
   * с ownerId. ownerIdParam передаётся явно (а не читается из state ownerId), чтобы избежать
   * stale-чтения сразу после setOwnerId в том же синхронном блоке.
   *
   * GET /api/users теперь admin-only, поэтому резолвить имена всех участников одним
   * запросом больше нельзя (обычный пользователь получит 403). Список permissions показывается
   * без резолва имён (adaptPermission без user отдаёт заглушку "Неизвестный пользователь").
   *
   * Список и ошибки сбрасываются до загрузки — при смене заметки в UI не остаётся
   * permissions предыдущей заметки (в т.ч. для не-владельца, который грузить не будет).
   */
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

  /**
   * Добавляет пользователя в список доступа. Использует GET /api/users/search?q=... —
   * доступен любому аутентифицированному пользователю (в отличие от старого admin-only
   * GET /api/users). Backend сам фильтрует по email/имени/фамилии и возвращает только
   * { id, email, name } (без surname) — из нескольких результатов берём точное совпадение
   * по email, иначе первый результат. Владелец заметки не может быть добавлен сам себе
   * (backend всё равно вернёт 400, но проверяем на клиенте, чтобы не делать заведомо
   * бесполезный запрос). Защита от повторной отправки через isAddingShareUser. Новый
   * permission id не генерируется локально — берётся из ответа backend через уже существующий
   * adaptPermission.
   */
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
        // В список добавляется именно permission из ответа backend (с реальным id).
        // matched из /api/users/search имеет только { id, email, name } (без surname) —
        // adaptPermission корректно обрабатывает отсутствие surname.
        setShareUsers((prev) => [...prev, adaptPermission(created, matched)]);
      } catch (err) {
        // 400 (например, попытка добавить владельца) или 403 (не владелец ресурса) —
        // пользователь в UI не добавляется.
        setPermissionsError(err.message || "Не удалось предоставить доступ");
      } finally {
        setIsAddingShareUser(false);
      }
    },
    [id, isNew, isAddingShareUser, ownerId, shareUsers],
  );

  /**
   * Убирает доступ пользователя (revoke). PrivacyMenu передаёт индекс в массиве shareUsers
   * (onRemove(i) не менялся) — реальный permission.id для DELETE берётся из shareUsers[index],
   * а не из самого индекса. Перед запросом — window.confirm. Защита от повторной
   * отправки через removingShareUserId. При ошибке пользователь остаётся в списке.
   */
  const removeShareUser = useCallback(
    async (index) => {
      if (isNew || removingShareUserId) return;

      const target = shareUsers[index];
      if (!target) return;

      const confirmed = window.confirm(`Убрать доступ пользователя «${target.name}»?`);
      if (!confirmed) return;

      setRemovingShareUserId(target.id);
      setPermissionsError(null);

      try {
        await permissionsApi.remove(target.id);
        // Локально фильтруем по permission.id (не по индексу) — повторный GET не делается.
        setShareUsers((prev) => prev.filter((u) => u.id !== target.id));
      } catch (err) {
        // Ошибка — пользователь остаётся в списке.
        setPermissionsError(err.message || "Не удалось убрать доступ");
      } finally {
        setRemovingShareUserId(null);
      }
    },
    [isNew, removingShareUserId, shareUsers],
  );

  return {
    shareUsers,
    load,
    addShareUser,
    removeShareUser,
    privacyOpen,
    togglePrivacy: () => setPrivacyOpen((prev) => !prev),
    privacy,
    selectPrivacy: setPrivacy,
    privacyWrapRef,
    error: permissionsError,
    dismissError: () => setPermissionsError(null),
  };
}