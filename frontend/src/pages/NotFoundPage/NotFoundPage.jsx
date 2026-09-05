import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Button from "../../components/ui/Button";
import "./NotFoundPage.css";

export function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="notfound">
          <h1>404</h1>
          <p>Такой страницы не существует</p>
          <Button to="/" variant="primary">На главную</Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
