import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen px-[100px] py-[60px]">
      <header className="flex justify-between items-center">
        <p className="logo">
          <Link to="/">
            NotesBook <span className="logo text-[24px] text-orange">v2</span>
          </Link>
        </p>
        <Button className="h-[60px] w-[215px]" onClick={() => navigate("/login")}>
          Войти
        </Button>
      </header>

      <main className="grid grid-cols-3 flex-1 gap-[150px]">
        <div className="col-span-2 flex flex-col justify-between py-[150px]">
          <div className="flex flex-col gap-4">
            <h1>
              Организуйте заметки
              <br />и задачи в одном месте
            </h1>
            <p className="font-semibold leading-[30px]">
              NotesBook – платформа для хранения, структурирования и совместного использования
              заметок. Создавайте записи по готовым шаблонам, управляйте задачами через канбан-доски
              и календарь, отслеживайте прогресс через графики и повышайте эффективность без
              информационного шума!
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <Button className="h-[75px] w-[350px]" onClick={() => navigate("/login")}>
              Начать работу
            </Button>
            <span className="text-orange">Учебный проект, разработано A&V</span>
          </div>
        </div>

        <div className="col-span-1 flex items-center justify-end">
          <img src="/img/main-img-1.png" alt="" />
        </div>
      </main>
    </div>
  );
};
