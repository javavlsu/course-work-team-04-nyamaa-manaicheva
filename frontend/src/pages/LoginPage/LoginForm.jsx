import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { emailValidation, passwordValidation } from "../../lib/utils/inputValidations";
import { useAuth } from "../../context/AuthContext.jsx";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // После логина возвращаем пользователя туда, откуда его редиректнул ProtectedRoute
  const from = location.state?.from?.pathname || "/notes";

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      await login(data.email, data.password);
      methods.reset();
      navigate(from, { replace: true });
    } catch (err) {
      // Показываем сообщение из backend (например, «Неверный email или пароль»)
      setError(err.message || "Ошибка входа. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
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

        <Button
          type="submit"
          variant="primary"
          className="btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Вход…" : "Войти"}
        </Button>

        {error && <div className="form-error">{error}</div>}
      </form>
    </FormProvider>
  );
}

export default LoginForm;
