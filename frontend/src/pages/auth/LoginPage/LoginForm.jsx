import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { emailValidation, passwordValidation } from "@/lib/utils/inputValidations";
import { useAuth } from "@/context/AuthContext.jsx";
import { canVisitPath, homePathFor } from "@/lib/utils/roles.js";

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(data.email, data.password);
      methods.reset();
      navigate(canVisitPath(user, from) ? from : homePathFor(user), { replace: true });
    } catch (err) {
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
