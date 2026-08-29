import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Button from "../../components/ui/Button";
import "./ForbiddenPage.css";

export function ForbiddenPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="forbidden">
          <h1>403</h1>
          <p>Доступ запрещён</p>
          <Button to="/" variant="primary">На главную</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
