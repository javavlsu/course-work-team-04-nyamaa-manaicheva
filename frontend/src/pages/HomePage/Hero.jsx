import Button from "../../components/ui/Button";
import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <section className="hero">
      <h1 className="hero-title">NotesBook</h1>
      <p className="hero-subtitle">
        Платформа для хранения, структурирования и совместного использования
        заметок. Создавайте записи по готовым шаблонам, управляйте задачами
        через канбан-доски и календарь, отслеживайте прогресс через графики
        и повышайте эффективность без информационного шума!
      </p>
      <Button to="/login" variant="primary" className="btn-hero">
        Начать работу
        <ArrowRight size={18} />
      </Button>
    </section>
  );
}

export default Hero;
