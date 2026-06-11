import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthSection } from "@/components/widgets/AuthSection";

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <main className="grid grid-cols-[2fr_1fr] min-h-screen">
      <div className="flex flex-col justify-center items-center">
        <div className="max-w-[700px] flex flex-col gap-[45px] w-full">
          <p className="logo text-[48px]">
            <Link to="/">
              NotesBook <span className="logo text-[24px] text-orange">v2</span>
            </Link>
          </p>

          <h2 className="font-semibold">Регистрация</h2>

          <div className="flex flex-col gap-6">
            {step === 1 && (
              <>
                <Input type="text" label="Имя" placeholder="Иван" required />
                <Input type="text" label="Фамилия" placeholder="Иванов" required />
                <Input type="date" label="Дата рождения" />
              </>
            )}

            {step === 2 && (
              <>
                <Input type="email" label="Email" placeholder="example@yandex.ru" required />
                <Input type="password" label="Пароль" placeholder="password123" required />
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {step === 1 ? (
              <Button className="h-[75px] w-full" onClick={() => setStep(2)}>
                Далее
              </Button>
            ) : (
              <>
                <Button className="h-[70px] w-full" onClick={() => navigate("/account")}>
                  Зарегистрироваться
                </Button>

                <Button
                  variant="outlineOrange"
                  className="h-[70px] w-full"
                  onClick={() => setStep(1)}
                >
                  Назад
                </Button>
              </>
            )}
          </div>

          <p className="text-center -mt-[15px]">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-orange">
              Войдите!
            </Link>
          </p>
        </div>
      </div>

      <AuthSection image="/img/main-img-3.png" />
    </main>
  );
};
