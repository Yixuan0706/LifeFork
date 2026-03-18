import React from 'react';
import { useDecision } from '../contexts/DecisionContext';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Compass,
  Lightbulb,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function ResultsPage() {
  const { reflection, decision, setStep } = useDecision();

  if (!reflection) {
    setStep('landing');
    return null;
  }

  const { summary, insights, suggestions, closing } = reflection;

  return (
    <div className="min-h-screen py-20 px-6 flex justify-center bg-stone-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl w-full space-y-16"
      >
        <div className="space-y-4">
          <button
            onClick={() => setStep('landing')}
            className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            重新开始
          </button>

          <h1 className="text-4xl md:text-5xl font-medium text-stone-900 leading-tight font-serif">
            关于你决定的沉思
          </h1>

          <p className="text-xl text-stone-500 italic font-serif">"{decision}"</p>
        </div>

        <section className="space-y-8 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <Compass className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">整体总结</h2>
          </div>

          <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <p className="text-xl text-stone-800 leading-relaxed font-serif">
              {summary}
            </p>
          </div>
        </section>

        <section className="space-y-8 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <TrendingUp className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">你可以看见的几条线索</h2>
          </div>

          <div className="grid gap-4">
            {insights.map((item: string, idx: number) => (
              <div
                key={idx}
                className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm"
              >
                <p className="text-lg text-stone-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <Lightbulb className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">建议你接下来如何靠近答案</h2>
          </div>

          <div className="grid gap-4">
            {suggestions.map((item: string, idx: number) => (
              <div
                key={idx}
                className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm"
              >
                <p className="text-lg text-stone-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 pt-8">
          <div className="p-8 bg-stone-100 rounded-3xl border border-stone-200">
            <p className="text-xl text-stone-800 leading-relaxed font-serif italic">
              "{closing}"
            </p>
          </div>
        </section>

        <div className="pt-12 pb-20 flex justify-center">
          <button
            onClick={() => setStep('letter')}
            className="inline-flex items-center px-8 py-4 text-base font-medium text-white bg-stone-800 rounded-full hover:bg-stone-900 transition-colors"
          >
            查收未来的信
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
