import { useLayoutEffect } from "react";
import { useOutletContext } from "react-router-dom";

import Logo from "@/components/layout/Logo";
import { ShieldCheck } from "lucide-react";

import RecoverForm from "./RecoverForm";
import "./RecoverPage.css";

export function RecoverPage() {
  const setPanel = useOutletContext();

  useLayoutEffect(() => {
    setPanel({
      glow: true,
      icon: <ShieldCheck strokeWidth={1.5} aria-hidden="true" />,
      title: "NotesBook",
      description: "Безопасность — наш приоритет",
    });
  }, [setPanel]);

  return (
    <div className="recover-box">
      <Logo />
      <h1 className="auth-title">Восстановление пароля</h1>
      <p className="auth-subtitle">
        Введите email для получения ссылки для восстановления
      </p>

      <RecoverForm />
    </div>
  );
}