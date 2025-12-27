import React from 'react';
import { DayEntry } from '../types';

interface AdviceProps {
  entries: DayEntry[];
  theme: 'dark' | 'pink' | 'gray';
}

const Advice: React.FC<AdviceProps> = ({ entries, theme }) => {
  const latestAdvice = entries[0]?.analysis.advice || [];

  const getCardClasses = () => {
    if (theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
    if (theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
    return 'bg-zinc-900 border-zinc-800 text-white';
  };

  const getAccentCardClasses = () => {
    if (theme === 'pink') return 'bg-pink-600 text-white';
    if (theme === 'gray') return 'bg-zinc-800 text-white';
    return 'bg-white text-black';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Support.</h1>
      </header>

      {latestAdvice.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-40 px-2">Pathways</h4>
          {latestAdvice.map((tip, idx) => (
            <div key={idx} className={`p-6 rounded-[2.2rem] border flex gap-5 items-center shadow-sm transition-all hover:scale-[1.01] ${getCardClasses()}`}>
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${theme === 'dark' ? 'border-zinc-700' : 'border-black/10'}`}>
                {idx + 1}
              </div>
              <p className="text-sm font-medium leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-16 text-center rounded-[2.5rem] border text-xs opacity-40 font-bold uppercase tracking-widest italic ${getCardClasses()}`}>
          Complete a sync for advice.
        </div>
      )}

      <div className={`p-10 rounded-[3rem] space-y-4 shadow-xl transition-all duration-500 ${getAccentCardClasses()}`}>
         <h3 className="text-xl font-bold tracking-tight">Clarity.</h3>
         <p className="text-xs font-medium leading-relaxed opacity-70">
           Small steps lead to great changes. We are here to support your journey every day. Focus on what you can control.
         </p>
         <div className="pt-4 border-t border-current opacity-20 w-full" />
         <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Operational Harmony</span>
      </div>
    </div>
  );
};

export default Advice;