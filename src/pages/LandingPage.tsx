import React, { useState } from 'react';
import { useDecision } from '../contexts/DecisionContext';
import { generateClarificationAndQuestions } from '../services/geminiService';

export default function LandingPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { setDecision, setClarification, setStep } = useDecision();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await generateClarificationAndQuestions(input);
      console.log('clarification result:', result);

      setDecision(input);
      setClarification(result);
      setStep('questions');
    } catch (error: any) {
      console.error('Failed to generate questions:', error);
      setErrorMessage(error?.message || '请求失败，请检查 /api/chat 返回格式');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setDecision(input || '测试问题');
    setClarification({
      options: ['选项 A', '选项 B'],
      questions: [
        { id: 'q1', text: '你真正害怕失去的是什么？', type: 'text' },
        {
          id: 'q2',
          text: '你更看重哪一项？',
          type: 'single_choice',
          choices: ['稳定', '成长', '自由']
        }
      ]
    });
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
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{ marginLeft: '12px', padding: '8px 16px' }}
        >
          {isLoading ? '处理中...' : '开启沉思'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleSkip}
        style={{ marginTop: '16px', padding: '8px 16px' }}
      >
        跳过接口，直接进入下一页
      </button>

      {errorMessage && (
        <p style={{ marginTop: '16px', color: 'red' }}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
