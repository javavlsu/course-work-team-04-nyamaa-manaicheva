import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Input from "@/components/ui/Input";
import {
  emailValidation,
  firstNameValidation,
  lastNameValidation,
} from "@/lib/utils/inputValidations";
import { useAuth } from "@/context/AuthContext.jsx";
import { update, remove } from "@/api/users.js";
import { ArrowLeft, Calendar, User } from "lucide-react";
import DeleteAccountModal from "./DeleteAccountModal";

export function roleLabel(role) {
  return role === "Admin" ? "Администратор" : "Клиент";
}

const birthdayValidation = {
  type: "date",
  name: "birthdayDate",
  label: "Дата рождения",
  autoComplete: "bday",
  validation: {
    validate: (value) => {
      if (!value) return true;
      const date = new Date(`${value}T00:00:00`);
      return (
        (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) ||
        "Дата рождения не может быть в будущем"
      );
    },
  },
};

function ProfileSection({ onBack }) {
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const methods = useForm({
    mode: "onSubmit",
    defaultValues: {
      firstName: currentUser?.name ?? "",
      lastName: currentUser?.surname ?? "",
      email: currentUser?.email ?? "",
      birthdayDate: currentUser?.birthdayDate ?? "",
    },
  });

  const handleSubmit = async (data) => {
    setFormError("");
    setSaved(false);
    setIsSaving(true);

    try {
      const updated = await update(currentUser.id, {
        name: data.firstName,
        surname: data.lastName,
        email: data.email,
        birthdayDate: data.birthdayDate || null,
      });
      updateUser(updated);
      methods.reset({
        firstName: updated.name,
        lastName: updated.surname,
        email: updated.email,
        birthdayDate: updated.birthdayDate || "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setFormError(err.message || "Не удалось сохранить профиль");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setIsDeleting(true);

    try {
      await remove(currentUser.id);
      await logout();
      navigate("/login", { replace: true, state: { accountDeleted: true } });
    } catch (err) {
      setDeleteError(err.message || "Не удалось удалить аккаунт");
      setIsDeleting(false);
    }
  };

  const registrationDate = currentUser?.registrationDate
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(currentUser.registrationDate))
    : "";

  return (
    <div className="account-section visible">
      <button type="button" className="account-back" onClick={onBack}>
        <ArrowLeft strokeWidth={1.6} aria-hidden="true" />
        Назад к настройкам
      </button>
      <div className="account-title">Аккаунт</div>
      <div className="account-meta">
        <div className="account-badge">
          <Calendar strokeWidth={1.6} aria-hidden="true" />
          Дата регистрации: <strong>{registrationDate}</strong>
        </div>
        <div className="account-badge">
          <User strokeWidth={1.6} aria-hidden="true" />
          Роль: <strong>{roleLabel(currentUser?.role)}</strong>
        </div>
      </div>
      <FormProvider {...methods}>
        <form className="account-form" onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
          <div className="form-row">
            <Input {...firstNameValidation} />
            <Input {...lastNameValidation} />
          </div>
          <Input {...emailValidation} />
          <Input {...birthdayValidation} />
          {formError && (
            <div className="settings-feedback settings-feedback-error">{formError}</div>
          )}
          <div className="account-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving
                ? "Сохранение…"
                : saved
                  ? "Сохранено ✓"
                  : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </FormProvider>
      <div className="account-bottom-actions">
        <button type="button" className="btn btn-logout" onClick={handleLogout}>
          Выйти
        </button>
        <button type="button" className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
          Удалить аккаунт
        </button>
      </div>
      {deleteOpen && (
        <DeleteAccountModal
          isDeleting={isDeleting}
          error={deleteError}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}

export default ProfileSection;