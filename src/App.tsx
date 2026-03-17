import { useContext } from "react";
import { DecisionProvider, DecisionContext } from "./contexts/DecisionContext";

import LandingPage from "./pages/LandingPage";
import LetterPage from "./pages/LetterPage";
import QuestionsPage from "./pages/QuestionsPage";
import ResultsPage from "./pages/ResultsPage";

function Router() {
  const ctx = useContext(DecisionContext);
  if (!ctx) return null;

  const { step } = ctx;

  // 👉 如果 step 是字符串（最常见）
  if (step === "landing") return <LandingPage />;
  if (step === "letter") return <LetterPage />;
  if (step === "questions") return <QuestionsPage />;
  if (step === "results") return <ResultsPage />;

  // 👉 如果 step 是数字（备用）
  if (step === 0) return <LandingPage />;
  if (step === 1) return <LetterPage />;
  if (step === 2) return <QuestionsPage />;
  if (step === 3) return <ResultsPage />;

  return <LandingPage />;
}

export default function App() {
  return (
    <DecisionProvider>
      <Router />
    </DecisionProvider>
  );
}
