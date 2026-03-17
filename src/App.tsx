import LandingPage from './pages/LandingPage';
import LetterPage from './pages/LetterPage';
import QuestionsPage from './pages/QuestionsPage';
import ResultsPage from './pages/ResultsPage';
import { DecisionProvider, useDecision } from './contexts/DecisionContext';

function AppRouter() {
  const { step } = useDecision();

  switch (step) {
    case 'landing':
      return <LandingPage />;
    case 'letter':
      return <LetterPage />;
    case 'questions':
      return <QuestionsPage />;
    case 'results':
      return <ResultsPage />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <DecisionProvider>
      <AppRouter />
    </DecisionProvider>
  );
}
