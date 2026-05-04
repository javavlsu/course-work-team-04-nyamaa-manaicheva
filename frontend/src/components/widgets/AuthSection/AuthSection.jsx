import { Square } from "lucide-react";

export const AuthSection = ({ image }) => {
  return (
    <section className="relative w-full h-full bg-[var(--color-dark-blue)] flex flex-col">
      <h3 className="font-semibold leading-[50px] text-white text-[40px] self-center mt-[110px]">
        Ваше пространство
        <br />
        для заметок ждет вас!
        <span className="inline-flex items-center ml-2">
          <Square size={32} fill="var(--color-orange)" color="var(--color-orange)" />
        </span>
      </h3>

      <img src={image} alt="" className="absolute bottom-0 right-0 max-w-[95%] object-contain" />
    </section>
  );
};
