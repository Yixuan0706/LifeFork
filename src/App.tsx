/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DecisionProvider } from './contexts/DecisionContext';
import LandingPage from './pages/LandingPage';
import QuestionsPage from './pages/QuestionsPage';
import ResultsPage from './pages/ResultsPage';
import LetterPage from './pages/LetterPage';

export default function App() {
  return (
    <DecisionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/letter" element={<LetterPage />} />
        </Routes>
      </Router>
    </DecisionProvider>
  );
}
