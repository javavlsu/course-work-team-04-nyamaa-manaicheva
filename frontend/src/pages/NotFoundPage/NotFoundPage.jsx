import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center gap-[40px]">
      <img src="/img/not-found.png" alt="Иллюстрация 404" className="mb-[20px] -mt-[40px]" />
      <h1 className="uppercase">Страница не найдена</h1>

      <p className="text-center">
        Упс! Что-то пошло не так!
        <br />К сожалению, запрашиваемая вами страница не найдена, была удалена или перемещена.
        <br />
        Попробуйте вернуться на{" "}
        <u className="font-semibold">
          <Link to="/">главную страницу</Link>
        </u>{" "}
        страницу нашего сайта
      </p>
    </main>
  );
};
