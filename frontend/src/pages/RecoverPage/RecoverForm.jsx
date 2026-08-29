import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { MailCheckIcon } from "./icons";
import { emailValidation } from "../../lib/utils/inputValidations";

function RecoverForm() {
  const navigate = useNavigate();
  const methods = useForm({ mode: "onSubmit" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (data) => {
    setError("");
    console.log("Recover data:", data);

    setTimeout(() => {
      if (Math.random() < 0.5) {
        setError("Не удалось отправить письмо. Попробуйте ещё раз");
        return;
      }
      setSent(true);
      setTimeout(() => navigate("/login"), 2000);
    }, 600);
  };

  if (sent) {
    return (
      <div className="recover-success">
        <MailCheckIcon />
        <h2>Письмо отправлено</h2>
        <p>Ссылка для восстановления отправлена на указанный email</p>
        <Link to="/login" className="back-link">← Вернуться к входу</Link>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form className="auth-form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <Input {...emailValidation} />
        <Button type="submit" variant="primary" className="btn-block">
          Отправить ссылку
        </Button>
        {error && <div className="form-error">{error}</div>}
        <Link to="/login" className="back-link">← Вернуться к входу</Link>
      </form>
    </FormProvider>
  );
}

export default RecoverForm;
