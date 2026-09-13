import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import Logo from "@/components/layout/Logo";
import { KeyRound } from "lucide-react";

import ResetPasswordForm from "./ResetPasswordForm";
import "./ResetPasswordPage.css";

export function ResetPasswordPage() {
  const setPanel = useOutletContext();

  useLayoutEffect(() => {
    setPanel({
      glow: true,
      icon: <KeyRound strokeWidth={1.5} aria-hidden="true" />,
      title: "NotesBook",
      description: "Придумайте новый надёжный пароль",
    });
  }, [setPanel]);

  return (
    <div className="reset-box">
      <Logo />
      <h1 className="auth-title">Новый пароль</h1>
      <p className="auth-subtitle">Введите новый пароль для вашего аккаунта</p>

      <ResetPasswordForm />
    </div>
  );
}
