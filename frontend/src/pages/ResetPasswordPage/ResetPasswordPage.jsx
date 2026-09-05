import AuthLayout from "../../components/layout/AuthLayout";
import Logo from "../../components/layout/Logo";

import { KeyIcon } from "./icons";
import ResetPasswordForm from "./ResetPasswordForm";
import "./ResetPasswordPage.css";

export function ResetPasswordPage() {
  return (
    <AuthLayout
      glow
      icon={<KeyIcon />}
      title="NotesBook"
      description="Придумайте новый надёжный пароль"
    >
      <div className="reset-box">
        <Logo />
        <h1 className="auth-title">Новый пароль</h1>
        <p className="auth-subtitle">
          Введите новый пароль для вашего аккаунта
        </p>

        <ResetPasswordForm />
      </div>
    </AuthLayout>
  );
}
