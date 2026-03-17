import LandingPage from './pages/LandingPage';
import { DecisionProvider } from './contexts/DecisionContext';

export default function App() {
  return (
    <DecisionProvider>
      <LandingPage />
    </DecisionProvider>
  );
}
