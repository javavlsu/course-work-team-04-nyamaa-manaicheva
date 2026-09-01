/**
 * RegisterForm
 *
 * Backend contract (AuthContracts.RegisterRequest):
 *   name, surname, email, birthdayDate?, password, passwordConfirm
 *
 * Маппинг полей формы → backend:
 *   firstName → name
 *   lastName  → surname
 *   phone     → НЕ отправляем (backend не принимает)
 *
 * После успешной регистрации (201 No Content) — redirect на /login.
 * Логин после регистрации пользователь делает сам (backend не возвращает сессию при register).
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  emailValidation,
  firstNameValidation,
  lastNameValidation,
  phoneValidation,
  registerPasswordValidation,
  confirmPasswordValidation,
} from "../../lib/utils/inputValidations";
import { register as apiRegister } from "../../api/auth.js";

function RegisterForm() {
  const navigate = useNavigate();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      // Маппим поля формы в backend contract.
      // phone не отправляем — backend его не принимает.
      await apiRegister({
        name: data.firstName,
        surname: data.lastName,
        email: data.email,
        birthdayDate: null, // поле не собирается в форме, backend принимает null
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      methods.reset();
      // После регистрации направляем на логин
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.message || "Ошибка регистрации. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form className="auth-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <div className="form-grid">
          <Input {...firstNameValidation} />
          <Input {...lastNameValidation} />
        </div>

        <Input {...emailValidation} placeholder="you@example.com" />
        {/* phone — UI-only поле, не отправляется на backend */}
        <Input {...phoneValidation} />
        <Input {...registerPasswordValidation} />
        <Input {...confirmPasswordValidation} />

        <label className="checkbox">
          <input type="checkbox" {...methods.register("terms")} />
          <span>
            Я соглашаюсь с{" "}
            <a href="#" className="link-accent">условиями использования</a>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          className="btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Регистрация…" : "Зарегистрироваться"}
        </Button>

        {error && <div className="form-error">{error}</div>}
      </form>
    </FormProvider>
  );
}

export default RegisterForm;
