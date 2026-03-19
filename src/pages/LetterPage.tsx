import React, { useState } from 'react';
import { useDecision } from '../contexts/DecisionContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mail } from 'lucide-react';

export default function LetterPage() {
  const { reflection, decision, setStep } = useDecision();
  const [isOpen, setIsOpen] = useState(false);

  if (!reflection) {
    setStep('landing');
    return null;
  }

  const philosophicalClosing = reflection.closing || '愿你在尚未明朗时，也依然温柔而坚定地向前。';

  const futureSelf = `亲爱的：

我知道，你正在反复思索这个问题：

“${decision}”

站在未来回望，我想告诉你，真正推动你靠近答案的，不是某一个瞬间的绝对确定，而是你一次次诚实地面对自己。

此刻你已经看见了一些重要的线索：

${Array.isArray(reflection.insights)
  ? reflection.insights.map((item, index) => `${index + 1}. ${item}`).join('\n')
  : ''}

接下来，你可以温柔但坚定地做几件事：

${Array.isArray(reflection.suggestions)
  ? reflection.suggestions.map((item, index) => `${index + 1}. ${item}`).join('\n')
  : ''}

也请记住：
${reflection.summary || ''}

你不需要在今天就成为一个完全不犹豫的人。
你只需要做那个愿意继续理解自己、并向前迈出一步的人。

当你终于回头看，会发现这个阶段的迷茫，并不是阻碍，而是你走向更清晰人生的一部分。

未来的你
`;

  return (
    <div className="min-h-screen py-20 px-6 flex flex-col items-center justify-center bg-stone-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full space-y-20 flex flex-col items-center"
      >
        <div className="text-center space-y-6 max-w-2xl">
          <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-serif italic">
            "{philosophicalClosing}"
          </p>
        </div>

        <div className="relative w-full flex justify-center items-center min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="envelope"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
                onClick={() => setIsOpen(true)}
                className="cursor-pointer group flex flex-col items-center space-y-8"
              >
                <div className="relative w-72 h-48 bg-stone-200 rounded-lg shadow-md overflow-hidden flex items-center justify-center border border-stone-300 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-xl">
                  <div className="absolute top-0 left-0 w-full h-full">
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="w-full h-full text-stone-300 stroke-current"
                      strokeWidth="1"
                      fill="none"
                    >
                      <path d="M0,0 L50,50 L100,0" />
                      <path d="M0,0 L50,50 L0,100" />
                      <path d="M100,0 L50,50 L100,100" />
                    </svg>
                  </div>

                  <div className="z-10 bg-stone-800 text-stone-50 rounded-full p-4 shadow-lg flex items-center justify-center transform transition-transform group-hover:scale-110">
                    <Mail className="w-6 h-6" />
                  </div>
                </div>

                <p className="text-stone-500 font-serif tracking-widest uppercase text-sm group-hover:text-stone-800 transition-colors">
                  点击开启未来的信
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="letter"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="w-full bg-[#fdfbf7] p-10 md:p-16 rounded-sm shadow-2xl border border-stone-200/60 relative"
              >
                <div className="font-serif text-lg md:text-xl text-stone-800 whitespace-pre-wrap leading-loose">
                  {futureSelf}
                </div>

                <div className="mt-20 flex justify-center">
                  <button
                    onClick={() => setStep('landing')}
                    className="px-8 py-3 text-sm font-medium text-stone-500 border border-stone-300 rounded-full hover:bg-stone-200 hover:text-stone-800 transition-colors"
                  >
                    思索另一个决定
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
