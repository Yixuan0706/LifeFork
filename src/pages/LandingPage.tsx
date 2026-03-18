import React, { useEffect, useState } from 'react';
import { useDecision } from '../contexts/DecisionContext';
import { motion } from 'motion/react';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { step, setDecision, setClarification, setStep } = useDecision();

  useEffect(() => {
    console.log('[LandingPage] 当前 step:', step);
  }, [step]);

  useEffect(() => {
    console.log('[LandingPage] 当前 isLoading:', isLoading);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    console.log('[LandingPage] 开始提交');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const result = await res.json();
      console.log('[LandingPage] /api/chat result:', result);

      if (!result.success) {
        console.error('[LandingPage] 接口返回失败:', result.error, result.raw);
        return;
      }

      console.log('[LandingPage] 准备 setDecision');
      setDecision(input);

      console.log('[LandingPage] 准备 setClarification');
      setClarification(result.data);

      console.log('[LandingPage] 准备 setStep(questions)');
      setStep('questions');

      console.log('[LandingPage] setStep(questions) 已调用');
    } catch (error) {
      console.error('[LandingPage] Failed to generate questions:', error);
    } finally {
      console.log('[LandingPage] finally -> setIsLoading(false)');
      setIsLoading(false);
    }
  };

  const exampleInputs = [
    '我应该去读博吗？',
    '我应该换个行业吗？',
    '我应该去另一个国家生活吗？',
  ];

  return (
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
