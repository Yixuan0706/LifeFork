import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecision } from '../contexts/DecisionContext';
import { motion } from 'motion/react';
import { ArrowLeft, Compass, AlertCircle, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';

export default function ResultsPage() {
  const { reflection, decision } = useDecision();
  const navigate = useNavigate();

  if (!reflection) {
    navigate('/');
    return null;
  }

  const { profile, coreConflict, paths, keyInsight } = reflection;

  return (
    <div className="min-h-screen py-20 px-6 flex justify-center bg-stone-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full space-y-16"
      >
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
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

        {/* Decision Profile Redesign */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <Compass className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">你的内心侧写</h2>
          </div>
          <div className="space-y-10 pl-4 md:pl-8 border-l border-stone-200">
            {[
              { label: '探索的渴望', value: profile.exploration },
              { label: '安稳的锚定', value: profile.anchoring },
              { label: '对未知的容纳', value: profile.uncertainty },
              { label: '时间的刻度', value: profile.timeHorizon },
            ].map((item, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm font-medium text-stone-400 tracking-widest uppercase">{item.label}</h3>
                <p className="text-xl text-stone-700 font-serif leading-relaxed">"{item.value}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Conflict */}
        <section className="space-y-6 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <AlertCircle className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">核心的张力</h2>
          </div>
          <div className="p-8 bg-stone-100 rounded-3xl border border-stone-200">
            <p className="text-xl text-stone-800 leading-relaxed font-serif">{coreConflict}</p>
          </div>
        </section>

        {/* Future Paths */}
        <section className="space-y-8 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <TrendingUp className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">可能展开的未来</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {paths.map((path, idx) => (
              <div key={idx} className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm space-y-6 flex flex-col h-full">
                <div className="space-y-2">
                  <h3 className="text-2xl font-medium text-stone-900 font-serif">{path.name}</h3>
                </div>

                <div className="space-y-4 flex-grow">
                  <h4 className="text-sm font-medium text-stone-400 uppercase tracking-widest">时间线</h4>
                  <ul className="space-y-3">
                    {path.milestones.map((milestone, mIdx) => (
                      <li key={mIdx} className="flex space-x-4">
                        <span className="text-stone-400 font-mono text-sm pt-1">{milestone.year}</span>
                        <span className="text-stone-700">{milestone.event}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-stone-100 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-1">情绪的轨迹</h4>
                    <p className="text-stone-700">{path.emotionalTrajectory}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-1">潜在的遗憾</h4>
                    <p className="text-stone-700">{path.possibleRegret}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Insight */}
        <section className="space-y-6 pt-8">
          <div className="flex items-center space-x-3 text-stone-800">
            <Lightbulb className="w-6 h-6 opacity-70" />
            <h2 className="text-2xl font-medium font-serif">关键洞察与建议</h2>
          </div>
          <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm">
            <p className="text-xl text-stone-800 leading-relaxed font-serif italic">"{keyInsight}"</p>
          </div>
        </section>
        
        <div className="pt-12 pb-20 flex justify-center">
          <button
            onClick={() => navigate('/letter')}
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
