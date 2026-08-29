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

function RegisterForm() {
  const navigate = useNavigate();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");

  const onSubmit = (data) => {
    setError("");
    console.log("Register data:", data);

    setTimeout(() => {
      if (Math.random() < 0.5) {
        setError("Пользователь с таким email уже существует");
        return;
      }
      methods.reset();
      navigate("/account");
    }, 600);
  };

  return (
    <FormProvider {...methods}>
      <form className="auth-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <div className="form-grid">
          <Input {...firstNameValidation} />
          <Input {...lastNameValidation} />
        </div>

        <Input {...emailValidation} placeholder="you@example.com" />
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

        <Button type="submit" variant="primary" className="btn-block">
          Зарегистрироваться
        </Button>
        {error && <div className="form-error">{error}</div>}
      </form>
    </FormProvider>
  );
}

export default RegisterForm;
