import { BookText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import AuthLayout from "../../components/layout/AuthLayout";
import Logo from "../../components/layout/Logo";

import LoginForm from "./LoginForm";
import "./LoginPage.css";

export function LoginPage() {
  const location = useLocation();
  // Флаг, выставленный RegisterForm после успешной регистрации
  const justRegistered = location.state?.registered === true;

  return (
    <AuthLayout
      icon={<BookText strokeWidth={1.5} />}
      title="NotesBook"
      description="Храните. Структурируйте. Делитесь."
    >
      <div className="login-box">
        <Logo />
        <h1 className="auth-title">Вход в аккаунт</h1>
        <p className="auth-subtitle">
          {justRegistered ? "Аккаунт создан — войдите, чтобы продолжить" : "Добро пожаловать обратно"}
        </p>

        {justRegistered && (
          <div className="form-success" style={{ marginBottom: "12px" }}>
            Регистрация прошла успешно!
          </div>
        )}

        <LoginForm />

        <p className="auth-footer">
          Нет аккаунта?{" "}
          <Link to="/register" className="link-accent">Зарегистрироваться</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
