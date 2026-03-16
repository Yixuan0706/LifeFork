import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecision } from '../contexts/DecisionContext';
import { generateReflection } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function QuestionsPage() {
  const { decision, clarification, answers, setAnswers, setReflection } = useDecision();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!clarification) {
    navigate('/');
    return null;
  }

  const questions = clarification.questions;
  const totalSteps = questions.length + 1; // +1 for clarification step

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/');
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await generateReflection(decision, answers);
      setReflection(result);
      navigate('/results');
    } catch (error) {
      console.error("Failed to generate reflection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderClarificationStep = () => (
    <motion.div
      key="clarification"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-3xl font-medium text-stone-900 font-serif">让我们理清你的思绪。</h2>
        <p className="text-lg text-stone-500">基于你的分享，这似乎是你正在考虑的几条道路：</p>
      </div>
      
      <div className="space-y-4">
        {clarification.options.map((option, idx) => (
          <div key={idx} className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-medium font-serif">
              {String.fromCharCode(65 + idx)}
            </div>
            <p className="text-lg text-stone-800 pt-1">{option}</p>
          </div>
        ))}
      </div>
      
      <div className="pt-8 flex justify-end">
        <button
          onClick={handleNext}
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-stone-800 rounded-full hover:bg-stone-900 transition-colors"
        >
          继续深入
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );

  const renderQuestionStep = (index: number) => {
    const question = questions[index];
    const currentAnswer = answers[question.id];

    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <span className="text-sm font-medium text-stone-400 uppercase tracking-wider">问题 {index + 1} / {questions.length}</span>
          <h2 className="text-3xl font-medium text-stone-900 leading-tight font-serif">{question.text}</h2>
        </div>

        <div className="space-y-3">
          {question.type === 'multiple_choice' || question.type === 'single_choice' ? (
            question.choices?.map((choice, idx) => {
              const isSelected = question.type === 'multiple_choice' 
                ? (currentAnswer || []).includes(choice)
                : currentAnswer === choice;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (question.type === 'multiple_choice') {
                      const current = currentAnswer || [];
                      const updated = isSelected 
                        ? current.filter((c: string) => c !== choice)
                        : [...current, choice];
                      handleAnswerChange(question.id, updated);
                    } else {
                      handleAnswerChange(question.id, choice);
                    }
                  }}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-stone-800 border-stone-800 text-white' 
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="text-lg">{choice}</span>
                  {isSelected && <Check className="w-5 h-5" />}
                </button>
              );
            })
          ) : (
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="在此写下你的思绪..."
              className="w-full p-6 text-lg bg-white border border-stone-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 min-h-[200px] resize-none"
            />
          )}
        </div>

        <div className="pt-8 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
          <button
            onClick={handleNext}
            disabled={
              (question.type === 'multiple_choice' && (!currentAnswer || currentAnswer.length === 0)) ||
              (question.type === 'single_choice' && !currentAnswer) ||
              (question.type === 'text' && (!currentAnswer || currentAnswer.trim() === ''))
            }
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-stone-800 rounded-full hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === totalSteps - 1 ? (
              isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  沉思中...
                </>
              ) : (
                '生成洞察'
              )
            ) : (
              <>
                下一步
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-20 px-6 flex justify-center">
      <div className="max-w-3xl w-full">
        <AnimatePresence mode="wait">
          {currentStep === 0 ? renderClarificationStep() : renderQuestionStep(currentStep - 1)}
        </AnimatePresence>
      </div>
    </div>
  );
}
