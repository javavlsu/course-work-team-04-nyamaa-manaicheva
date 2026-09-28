import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import {
  confirmPasswordValidation,
  emailValidation,
  firstNameValidation,
  lastNameValidation,
  registerPasswordValidation,
} from "@/lib/utils/inputValidations";
import { ROLE_ADMIN, ROLE_CLIENT } from "@/lib/utils/roles.js";

const birthdayValidation = {
  type: "date",
  name: "birthdayDate",
  label: "Дата рождения",
  autoComplete: "off",
  validation: {
    validate: (value) => {
      if (!value) return true;
      const date = new Date(`${value}T00:00:00`);
      return (
        Number.isNaN(date.getTime()) ||
        date.getTime() <= Date.now() ||
        "Дата рождения не может быть в будущем"
      );
    },
  },
};

/**
 * Модалка создания / редактирования пользователя.
 *
 * mode="create": форма как при регистрации + выбор роли (можно создать и администратора).
 * mode="edit":   все поля профиля + смена роли. Для собственной записи роль заблокирована
 *                (backend вернёт 403 на смену собственной роли).
 *
 * onSubmit получает { name, surname, email, birthdayDate, role, password? } и должен
 * вернуть Promise; при ошибке выбрасывайте Error — сообщение покажем в форме.
 */
function UserFormModal({ mode, user, isSelf = false, onClose, onSubmit }) {
  const isCreate = mode === "create";
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm({
    mode: "onSubmit",
    defaultValues: {
      firstName: user?.name ?? "",
      lastName: user?.surname ?? "",
      email: user?.email ?? "",
      birthdayDate: user?.birthdayDate ?? "",
      role: user?.role ?? ROLE_CLIENT,
      password: "",
      passwordConfirm: "",
    },
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, isSaving]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) onClose();
  };

  const submit = async (data) => {
    setError("");
    setIsSaving(true);
    try {
      await onSubmit({
        name: data.firstName,
        surname: data.lastName,
        email: data.email,
        birthdayDate: data.birthdayDate || null,
        role: data.role,
        ...(isCreate ? { password: data.password } : {}),
      });
    } catch (err) {
      setError(err.message || "Не удалось сохранить пользователя");
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? "Добавить пользователя" : "Редактировать пользователя"}
      >
        <h3 className="trash-modal-title">
          {isCreate ? "Добавить пользователя" : "Редактировать пользователя"}
        </h3>
        <FormProvider {...methods}>
          <form className="admin-modal-form" onSubmit={methods.handleSubmit(submit)} noValidate>
            <div className="admin-modal-grid">
              <Input {...firstNameValidation} requiredIndicator />
              <Input {...lastNameValidation} requiredIndicator />
            </div>
            <Input {...emailValidation} requiredIndicator placeholder="user@example.com" />
            <Input {...birthdayValidation} />

            {isCreate && (
              <>
                <Input {...registerPasswordValidation} requiredIndicator />
                <Input {...confirmPasswordValidation} requiredIndicator />
              </>
            )}

            <div className="input-group">
              <label className="input-label" htmlFor="role">
                Роль
              </label>
              <select
                id="role"
                className="input admin-select"
                disabled={isSelf}
                {...methods.register("role")}
              >
                <option value={ROLE_CLIENT}>Клиент</option>
                <option value={ROLE_ADMIN}>Администратор</option>
              </select>
              {isSelf && (
                <span className="admin-hint">Свою роль изменить нельзя</span>
              )}
            </div>

            {error && (
              <div className="trash-action-error admin-modal-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            <div className="trash-modal-actions">
              <button type="button" className="trash-modal-cancel" onClick={onClose} disabled={isSaving}>
                Отмена
              </button>
              <button type="submit" className="admin-primary-btn" disabled={isSaving}>
                {isSaving ? "Сохранение…" : isCreate ? "Создать" : "Сохранить"}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default UserFormModal;
