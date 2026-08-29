import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import Hero from "./Hero";
import Features from "./Features";
import "./HomePage.css";

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </>
  );
}
