import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

import Input from "@/components/ui/Input";

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
  const methods = useForm({ mode: "onSubmit" });
  const [notice, setNotice] = useState("");

  const onSubmit = () => {
    setNotice(
      "Смена пароля ещё недоступна: соответствующий endpoint появится на сервере позже.",
    );
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
            <button type="submit" className="btn btn-primary">
              Сменить пароль
            </button>
          </div>
          {notice && <div className="settings-feedback">{notice}</div>}
        </form>
      </FormProvider>
    </section>
  );
}

export default PasswordSection;