import { DecisionProvider, useDecision } from './contexts/DecisionContext';

function AppRouter() {
  const { step } = useDecision();

  return (
    <div style={{ padding: 40, color: '#000', background: '#fff' }}>
      <h1>App 正常运行</h1>
      <p>当前 step: {step}</p>
    </div>
  );
}

export default function App() {
  return (
    <DecisionProvider>
      <AppRouter />
    </DecisionProvider>
  );
}
