import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { MailCheckIcon } from "./icons";
import { emailValidation } from "../../lib/utils/inputValidations";
import { forgotPassword } from "../../api/auth.js";

function RecoverForm() {
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(data.email);
      // Backend всегда отвечает одинаковым сообщением независимо от того, найден ли email —
      // поэтому просто показываем success-экран без раскрытия реального результата.
      setSent(true);
    } catch (err) {
      setError(err.message || "Не удалось отправить письмо. Попробуйте ещё раз");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="recover-success">
        <MailCheckIcon />
        <h2>Письмо отправлено</h2>
        <p>Если такой email зарегистрирован, на него отправлена ссылка для восстановления пароля</p>
        <Link to="/login" className="back-link">← Вернуться к входу</Link>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="auth-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Input {...emailValidation} />
        <Button
          type="submit"
          variant="primary"
          className="btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Отправка…" : "Отправить ссылку"}
        </Button>
        {error && <div className="form-error">{error}</div>}
        <Link to="/login" className="back-link">← Вернуться к входу</Link>
      </form>
    </FormProvider>
  );
}

export default RecoverForm;
