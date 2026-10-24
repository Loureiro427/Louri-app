import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./WelcomeScreen.css";

const orbitItems = [
  { name: "apple", emoji: "🍎" },
  { name: "orange", emoji: "🍊" },
  { name: "shoe", emoji: "👟" },
  { name: "fire", emoji: "🔥" },
  { name: "salad", emoji: "🥗" },
  { name: "strength", emoji: "💪" },
];

export function WelcomeScreen({ dark }: { dark: boolean }) {
  const navigate = useNavigate();
  return (
    <section
      className={`louri-intro ${dark ? "" : "louri-intro--light"}`}
      aria-label="Bem-vindo ao Louri"
    >
      <div className="louri-intro-shell">
        <div className="louri-intro-hero">
          <div className="louri-intro-orbit">
            <div className="louri-intro-aura" aria-hidden="true" />
            <div
              className="louri-intro-ring louri-intro-ring--outer"
              aria-hidden="true"
            />
            <div
              className="louri-intro-ring louri-intro-ring--inner"
              aria-hidden="true"
            />
            {orbitItems.map((item, i) => (
              <span
                key={item.name}
                className={`louri-intro-item louri-intro-item--${item.name}`}
                style={{ animationDelay: `${i * -0.7}s` }}
                aria-hidden="true"
              >
                {item.emoji}
              </span>
            ))}
            <div className="louri-intro-brand">
              <div className="louri-intro-logo">
                <img src={logo} alt="Logo do Louri" />
              </div>
              <div className="louri-intro-wordmark">
                <h1>Louri</h1>
                <span className="louri-intro-beta">Beta</span>
              </div>
            </div>
          </div>
          <p className="louri-intro-kicker">
            <span /> Seu bem-estar, todos os dias
          </p>
          <p className="louri-intro-description">
            Alimentação, hidratação e evolução.
            <br />
            Tudo no seu ritmo.
          </p>
        </div>
        <footer className="louri-intro-footer">
          <button
            type="button"
            className="louri-intro-start"
            onClick={() => navigate("/onboarding")}
          >
            <span>Começar Agora</span>
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>
          <p>
            <span aria-hidden="true">✦</span> Um plano com a sua cara.
          </p>
        </footer>
      </div>
    </section>
  );
}
