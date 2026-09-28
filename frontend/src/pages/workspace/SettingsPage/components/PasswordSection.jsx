import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext.jsx";
import * as usersApi from "@/api/users.js";

const currentPasswordValidation = {
  type: "password",
  name: "currentPassword",
  label: "Текущий пароль",
  placeholder: "Введите текущий пароль",
  autoComplete: "current-password",
  validation: {
    required: { value: true, message: "Введите текущий пароль" },
    maxLength: { value: 100, message: "Пароль не должен превышать 100 символов" },
  },
};

const newPasswordValidation = {
  type: "password",
  name: "newPassword",
  label: "Новый пароль",
  placeholder: "Минимум 8 символов",
  autoComplete: "new-password",
  validation: {
    required: { value: true, message: "Введите новый пароль" },
    minLength: { value: 8, message: "Пароль должен содержать минимум 8 символов" },
    maxLength: { value: 100, message: "Пароль не должен превышать 100 символов" },
  },
};

const confirmNewPasswordValidation = {
  type: "password",
  name: "newPasswordConfirm",
  label: "Повторите новый пароль",
  placeholder: "Повторите новый пароль",
  autoComplete: "new-password",
  validation: {
    required: { value: true, message: "Повторите новый пароль" },
    validate: (value, formValues) =>
      value === formValues.newPassword || "Пароли не совпадают",
  },
};

function PasswordSection() {
  const { currentUser } = useAuth();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    if (!currentUser?.id) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await usersApi.changePassword(currentUser.id, {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess("Пароль успешно изменён");
      methods.reset();
    } catch (err) {
      setError(err.message || "Не удалось изменить пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="settings-section">
      <h2 className="settings-section-title">Безопасность</h2>
      <p className="settings-section-desc">Изменение пароля аккаунта.</p>
      <FormProvider {...methods}>
        <form className="account-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          <Input {...currentPasswordValidation} />
          <div className="form-row">
            <Input {...newPasswordValidation} />
            <Input {...confirmNewPasswordValidation} />
          </div>
          <div className="account-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение…" : "Сменить пароль"}
            </button>
          </div>
          {error && <div className="settings-feedback settings-feedback-error">{error}</div>}
          {success && <div className="settings-feedback settings-feedback-success">{success}</div>}
        </form>
      </FormProvider>
    </section>
  );
}

export default PasswordSection;