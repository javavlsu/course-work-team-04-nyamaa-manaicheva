import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { CheckCircleIcon } from "./icons";
import { registerPasswordValidation, confirmPasswordValidation } from "../../lib/utils/inputValidations";
import { resetPassword } from "../../api/auth.js";

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        newPassword: data.password,
        newPasswordConfirm: data.passwordConfirm,
      });
      setDone(true);
    } catch (err) {
      // Backend возвращает понятное сообщение для недействительного/просроченного токена
      setError(err.message || "Не удалось сохранить новый пароль. Попробуйте ещё раз");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ссылка открыта без токена — форму показывать нет смысла
  if (!token) {
    return (
      <div className="reset-success">
        <p>Ссылка недействительна: в ней отсутствует токен восстановления.</p>
        <Link to="/recover" className="back-link">← Запросить новую ссылку</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="reset-success">
        <CheckCircleIcon />
        <h2>Пароль изменён</h2>
        <p>Теперь вы можете войти с новым паролем</p>
        <Link to="/login" className="back-link">← Перейти к входу</Link>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="auth-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Input {...registerPasswordValidation} />
        <Input {...confirmPasswordValidation} />
        <Button
          type="submit"
          variant="primary"
          className="btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Сохранение…" : "Сохранить пароль"}
        </Button>
        {error && <div className="form-error">{error}</div>}
        <Link to="/login" className="back-link">← Вернуться к входу</Link>
      </form>
    </FormProvider>
  );
}

export default ResetPasswordForm;
