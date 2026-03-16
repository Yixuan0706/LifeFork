import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClarificationResponse, ReflectionResponse } from '../services/geminiService';

interface DecisionContextType {
  decision: string;
  setDecision: (decision: string) => void;
  clarification: ClarificationResponse | null;
  setClarification: (clarification: ClarificationResponse | null) => void;
  answers: Record<string, any>;
  setAnswers: (answers: Record<string, any>) => void;
  reflection: ReflectionResponse | null;
  setReflection: (reflection: ReflectionResponse | null) => void;
}

const DecisionContext = createContext<DecisionContextType | undefined>(undefined);

export function DecisionProvider({ children }: { children: ReactNode }) {
  const [decision, setDecision] = useState('');
  const [clarification, setClarification] = useState<ClarificationResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null);

  return (
    <DecisionContext.Provider value={{ decision, setDecision, clarification, setClarification, answers, setAnswers, reflection, setReflection }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecision() {
  const context = useContext(DecisionContext);
  if (context === undefined) {
    throw new Error('useDecision must be used within a DecisionProvider');
  }
  return context;
}
