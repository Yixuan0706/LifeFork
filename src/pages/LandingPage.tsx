import React, { useState } from 'react';
import { useDecision } from '../contexts/DecisionContext';
import { generateClarificationAndQuestions } from '../services/geminiService';
import { motion } from 'motion/react';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [input, setInput] = useState('');
  const { setDecision, setStep } = useDecision();
  const [isLoading, setIsLoading] = useState(false);
  const { setDecision, setClarification, setStep } = useDecision();

  const handleSubmit = (e: React.FormEvent) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setDecision(input);
    setStep('questions');
    setIsLoading(true);
    try {
      const result = await generateClarificationAndQuestions(input);
      setDecision(input);
      setClarification(result);
      setStep('questions');
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleInputs = [
    '我应该去读博吗？',
    '我应该换个行业吗？',
    '我应该去另一个国家生活吗？'
  ];

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-2xl w-full space-y-12 text-center"
      >
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-stone-900 font-serif">
            小径分岔
          </h1>
          <p className="text-lg md:text-xl text-stone-500 font-light">
            探索选择可能通向的远方。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="你此刻正在思索什么决定？"
              className="w-full px-6 py-4 text-lg bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {exampleInputs.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(example)}
                className="px-4 py-2 text-sm text-stone-500 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-stone-800 rounded-full hover:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                沉思中...
              </>
            ) : (
              <>
                开启沉思
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
