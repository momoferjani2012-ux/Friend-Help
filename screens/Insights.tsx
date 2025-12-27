import React, { useMemo } from 'react';
import { DayEntry } from '../types';

interface InsightsProps {
  entries: DayEntry[];
  theme: 'dark' | 'pink' | 'gray';
}

const Insights: React.FC<InsightsProps> = ({ entries, theme }) => {
  const sortedEntries = useMemo(() => [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [entries]);
  const last7 = sortedEntries.slice(-7);

  const getCardClasses = () => {
    if (theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
    if (theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
    return 'bg-zinc-900 border-zinc-800 text-white';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Your Flow.</h1>
      </header>

      {entries.length === 0 ? (
        <div className={`p-16 text-center rounded-[2.5rem] border text-xs opacity-40 font-bold uppercase tracking-widest italic ${getCardClasses()}`}>
          No data recorded.
        </div>
      ) : (
        <>
          <section className={`p-8 rounded-[2.5rem] space-y-8 border shadow-sm transition-all duration-500 ${getCardClasses()}`}>
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-[9px] font-bold uppercase tracking-widest opacity-40">Consistency</h3>
                 <p className="text-xs font-bold mt-1">7 Day Cycle</p>
               </div>
               <div className="text-right">
                 <p className="text-3xl font-bold">{Math.round(last7.reduce((a, b) => a + b.analysis.happinessScore, 0) / (last7.length || 1))}%</p>
                 <p className="text-[8px] font-bold opacity-30 tracking-widest uppercase">Mean</p>
               </div>
             </div>

             <div className="flex items-end justify-between h-32 gap-3">
               {last7.map((entry) => (
                 <div key={entry.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                   <div className={`w-full rounded-full h-full relative overflow-hidden flex flex-col justify-end border ${theme === 'dark' ? 'bg-zinc-800 border-transparent' : 'bg-white/30 border-black/5'}`}>
                     <div 
                       className={`w-full transition-all duration-1000 ease-out ${theme === 'pink' ? 'bg-pink-600' : theme === 'gray' ? 'bg-zinc-800' : 'bg-white'}`}
                       style={{ height: `${entry.analysis.happinessScore}%` }}
                     />
                   </div>
                   <span className="text-[8px] font-bold opacity-40 uppercase">
                     {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short' })}
                   </span>
                 </div>
               ))}
               {Array.from({ length: 7 - last7.length }).map((_, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                   <div className={`w-full h-full rounded-full border border-dashed opacity-20 ${theme === 'dark' ? 'bg-zinc-800 border-zinc-600' : 'bg-white/10 border-black'}`} />
                   <span className="text-[8px] font-bold opacity-10">—</span>
                 </div>
               ))}
             </div>
          </section>

          <div className={`p-8 rounded-[2rem] border space-y-3 shadow-sm transition-all duration-500 ${getCardClasses()}`}>
              <h4 className="text-[9px] font-bold uppercase tracking-widest opacity-40">Observations</h4>
              <p className="text-sm font-medium leading-relaxed italic opacity-80">
                {entries[0]?.analysis.patternInsight || "Synchronizing with your patterns..."}
              </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Insights;