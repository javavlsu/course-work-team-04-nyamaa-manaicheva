import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Button from "../../components/ui/Button";
import "./ServerErrorPage.css";

export function ServerErrorPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="servererror">
          <h1>500</h1>
          <p>Внутренняя ошибка сервера</p>
          <Button to="/" variant="primary">На главную</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
