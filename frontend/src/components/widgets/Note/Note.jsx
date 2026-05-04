import { Button } from "@/components/ui/Button";
import { Star, Trash2 } from "lucide-react";

export const Note = () => {
  return (
    <div className="w-[430px] h-[430px] px-[25px] pt-[35px] pb-[15px] bg-white border border-light-gray rounded-[15px] shadow-block flex flex-col">
      <div className="flex justify-between items-center border-b-3 border-light-gray pb-3">
        <h3 className="font-semibold">Заметка</h3>
        <Star size={40} color="var(--color-orange)" />
      </div>

      <div className="flex-1 py-[25px]">
        <p className="text-[18px] leading-[25px]">
          Текст текст текст текст текст текст текст текст текст текст текст текст текст текст текст
          текст текст текст текст текст
        </p>
      </div>

      <div className="flex justify-between items-center gap-[25px]">
        <Button className="h-[60px] w-full text-[24px]">Редактировать</Button>
        <Button variant="iconOnly" icon={Trash2} className="border-0 h-[60px] w-[60px]" />
      </div>
    </div>
  );
};
