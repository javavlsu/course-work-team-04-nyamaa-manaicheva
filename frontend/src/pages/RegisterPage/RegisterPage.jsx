import { Link } from "react-router-dom";

import AuthLayout from "../../components/layout/AuthLayout";
import Logo from "../../components/layout/Logo";

import NotesCardIcon from "./icons";
import RegisterForm from "./RegisterForm";
import "./RegisterPage.css";

export function RegisterPage() {
  return (
    <AuthLayout
      icon={<NotesCardIcon />}
      title="NotesBook"
      description="Присоединяйтесь к нам"
    >
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
    </AuthLayout>
  );
}
