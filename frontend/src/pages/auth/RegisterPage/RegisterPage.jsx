import { useLayoutEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";

import Logo from "@/components/layout/Logo";
import { FileText } from "lucide-react";

import RegisterForm from "./RegisterForm";
import "./RegisterPage.css";

export function RegisterPage() {
  const setPanel = useOutletContext();

  useLayoutEffect(() => {
    setPanel({
      icon: <FileText strokeWidth={1.4} aria-hidden="true" />,
      title: "NotesBook",
      description: "Присоединяйтесь к нам",
    });
  }, [setPanel]);

  return (
    <div className="register-box">
      <Logo />
      <h1 className="auth-title">Регистрация</h1>
      <p className="auth-subtitle">Создайте аккаунт и начните работать</p>

      <RegisterForm />

      <p className="auth-footer">
        Уже есть аккаунт?{" "}
        <Link to="/login" className="link-accent">Войти</Link>
      </p>
    </div>
  );
}