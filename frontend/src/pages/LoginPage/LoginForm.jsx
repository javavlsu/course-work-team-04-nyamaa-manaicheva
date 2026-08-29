import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { emailValidation, passwordValidation } from "../../lib/utils/inputValidations";

function LoginForm() {
  const navigate = useNavigate();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");

  const onSubmit = (data) => {
    setError("");
    console.log("Login data:", data);

    setTimeout(() => {
      if (Math.random() < 0.5) {
        setError("Неверный email или пароль");
        return;
      }
      methods.reset();
      navigate("/account");
    }, 600);
  };

  return (
    <FormProvider {...methods}>
      <form className="auth-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Input {...emailValidation} />
        <Input {...passwordValidation} />

        <div className="form-actions">
          <label className="checkbox">
            <input type="checkbox" {...methods.register("remember")} />
            Запомнить меня
          </label>
          <Link to="/recover" className="link-accent">Забыли пароль?</Link>
        </div>

        <Button type="submit" variant="primary" className="btn-block">Войти</Button>
        {error && <div className="form-error">{error}</div>}
      </form>
    </FormProvider>
  );
}

export default LoginForm;
