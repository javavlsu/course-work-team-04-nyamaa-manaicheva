import { ChartLine, ClipboardList, SquareKanban } from "lucide-react";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Заметки и шаблоны",
    text: "Создавайте заметки по готовым шаблонам или с нуля. Markdown-редактор с полным форматированием.",
  },
  {
    icon: SquareKanban,
    title: "Канбан и календарь",
    text: "Управляйте задачами через доски статусов и визуальный календарь с дедлайнами.",
  },
  {
    icon: ChartLine,
    title: "Аналитика прогресса",
    text: "Отслеживайте эффективность через графики, диаграммы и статистику по задачам.",
  },
];

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Features() {
  return (
    <section className="features">
      <div className="features-grid">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}

export default Features;
