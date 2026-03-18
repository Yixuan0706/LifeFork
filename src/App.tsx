import React from 'react';
import { DecisionProvider, useDecision } from './contexts/DecisionContext';
import LandingPage from './pages/LandingPage';
import LetterPage from './pages/LetterPage';
import QuestionsPage from './pages/QuestionsPage';
import ResultsPage from './pages/ResultsPage';

function AppContent() {
  const { step } = useDecision();

  console.log('[AppContent] current step:', step);

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
      <AppContent />
    </DecisionProvider>
  );
}
