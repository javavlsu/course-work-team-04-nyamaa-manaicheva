import AuthLayout from "../../components/layout/AuthLayout";
import Logo from "../../components/layout/Logo";

import { ShieldCheckIcon } from "./icons";
import RecoverForm from "./RecoverForm";
import "./RecoverPage.css";

export function RecoverPage() {
  return (
    <AuthLayout
      glow
      icon={<ShieldCheckIcon />}
      title="NotesBook"
      description="Безопасность — наш приоритет"
    >
      <div className="recover-box">
        <Logo />
        <h1 className="auth-title">Восстановление пароля</h1>
        <p className="auth-subtitle">
          Введите email для получения ссылки для восстановления
        </p>

        <RecoverForm />
      </div>
    </AuthLayout>
  );
}
