import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  emailValidation,
  firstNameValidation,
  lastNameValidation,
  phoneValidation,
  registerPasswordValidation,
  confirmPasswordValidation,
} from "@/lib/utils/inputValidations";
import { register as apiRegister } from "@/api/auth.js";

function RegisterForm() {
  const navigate = useNavigate();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      await apiRegister({
        name: data.firstName,
        surname: data.lastName,
        email: data.email,
        birthdayDate: null,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      methods.reset();
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
          <Input {...firstNameValidation} requiredIndicator />
          <Input {...lastNameValidation} requiredIndicator />
        </div>

        <Input {...emailValidation} requiredIndicator placeholder="you@example.com" />
        <Input {...phoneValidation} />
        <Input {...registerPasswordValidation} requiredIndicator />
        <Input {...confirmPasswordValidation} requiredIndicator />

        <label className="checkbox">
          <input
            type="checkbox"
            {...methods.register("terms", {
              required: "Необходимо согласиться с условиями использования",
            })}
          />
          <span>
            Я соглашаюсь с{" "}
            <a href="#" className="link-accent">условиями использования</a>
          </span>
        </label>
        {methods.formState.errors.terms && (
          <span className="form-error form-error-left">
            {methods.formState.errors.terms.message}
          </span>
        )}

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
