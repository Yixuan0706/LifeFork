import React, { useState } from 'react';
import { useDecision } from '../contexts/DecisionContext';

export default function LandingPage() {
  const [input, setInput] = useState('');
  const { setDecision, setStep } = useDecision();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setDecision(input);
    setStep('questions');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px', background: '#fff', color: '#000' }}>
      <h1>LandingPage 正常</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题"
          style={{ border: '1px solid #ccc', padding: '8px', width: '300px' }}
        />
        <button type="submit" style={{ marginLeft: '12px', padding: '8px 16px' }}>
          下一步
        </button>
      </form>
    </div>
  );
}
