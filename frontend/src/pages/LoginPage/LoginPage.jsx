import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthSection } from "@/components/widgets/AuthSection";

export const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <main className="grid grid-cols-[2fr_1fr] min-h-screen">
      <div className="flex flex-col justify-center items-center">
        <div className="max-w-[700px] flex flex-col gap-[45px]">
          <p className="logo text-[48px]">
            <Link to="/">
              NotesBook <span className="logo text-[24px] text-orange">v2</span>
            </Link>
          </p>

          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">Вход</h2>
            <p>Войдите в аккаунт, чтобы получить доступ ко всем функциям!</p>
          </div>

          <div className="flex flex-col gap-6">
            <Input type="email" label="Логин" placeholder="example@yandex.ru" required />
            <Input type="password" label="Пароль" placeholder="password123" required />
          </div>

          <Button className="h-[75px] w-full" onClick={() => navigate("/account")}>
            Войти
          </Button>

          <div className="flex flex-col gap-2">
            <p className="text-center -mt-[15px]">
              Ещё нет аккаунта?{" "}
              <Link to="/register" className="text-orange">
                Зарегистрируйтесь!
              </Link>
            </p>

            <p className="text-center">
              Забыли пароль? Обратитесь за помощью к{" "}
              <a href="mailto:notesbook-admin@test.ru">
                <u>нашей администрации</u>
              </a>
              !
            </p>
          </div>
        </div>
      </div>

      <AuthSection image="/img/main-img-2.png" />
    </main>
  );
};
