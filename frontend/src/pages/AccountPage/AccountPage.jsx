import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Button from "../../components/ui/Button";

export function AccountPage() {
  return (
    <>
      <Header />
      <main className="page">
        <section className="page-card">
          <h1>Личный кабинет</h1>
          <p>Здесь появятся ваши заметки, задачи и статистика.</p>
          <Button to="/" variant="secondary">На главную</Button>
        </section>
      </main>
      <Footer />
    </>
  );
}
