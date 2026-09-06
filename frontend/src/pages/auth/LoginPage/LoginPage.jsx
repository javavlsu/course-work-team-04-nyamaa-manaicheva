import { useLayoutEffect } from "react";
import { BookText } from "lucide-react";
import { Link, useLocation, useOutletContext } from "react-router-dom";

import Logo from "../../../components/layout/Logo";

import LoginForm from "./LoginForm";
import "./LoginPage.css";

export function LoginPage() {
  const location = useLocation();
  const setPanel = useOutletContext();
  // Флаг, выставленный RegisterForm после успешной регистрации
  const justRegistered = location.state?.registered === true;

  useLayoutEffect(() => {
    setPanel({
      icon: <BookText strokeWidth={1.5} />,
      title: "NotesBook",
      description: "Храните. Структурируйте. Делитесь.",
    });
  }, [setPanel]);

  return (
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
  );
}