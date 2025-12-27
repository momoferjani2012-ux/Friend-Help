
import React, { useMemo } from 'react';
import { DayEntry } from '../types';

interface HomeProps {
  entries: DayEntry[];
  theme: 'dark' | 'pink' | 'gray';
  onStartCheckIn: () => void;
}

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const Home: React.FC<HomeProps> = ({ entries, theme, onStartCheckIn }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = useMemo(() => entries.find(e => e.date.split('T')[0] === today), [entries, today]);

  const getCardClasses = () => {
    if (theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
    if (theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
    return 'bg-zinc-900 border-zinc-800 text-white';
  };

  const getButtonClasses = () => {
    if (theme === 'pink') return 'bg-pink-600 text-white';
    if (theme === 'gray') return 'bg-zinc-800 text-white';
    return 'bg-white text-black';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter leading-none">
          Welcome back.
        </h1>
        <p className="text-base opacity-50 font-medium">
          Your happiness is our priority.
        </p>
      </header>

      {/* Donation Banner */}
      <a 
        href="https://donate.unrwa.org/int/en/endofyear?utm_source=google&utm_medium=cpc&utm_content=gaza&utm_campaign=CR_UNRWA_TAC_PRO_GAZA_SEM_DE_EN_CONV_12102023&gad_source=1&gad_campaignid=20647164897&gclid=Cj0KCQiAgbnKBhDgARIsAGCDdlfRanH8mqRR4-F3rtRGLp9FsnOdjY2d7gTLqD7djigy_kmKuLjbQBkaAkM-EALw_wcB"
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className={`p-6 rounded-[2.2rem] border-2 border-dashed flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 ${theme === 'pink' ? 'border-pink-400/50 bg-pink-300/30' : theme === 'gray' ? 'border-zinc-400/50 bg-zinc-300/30' : 'border-zinc-700/50 bg-zinc-800/30'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Global Support</span>
            <span className="text-xs font-bold leading-tight underline decoration-2 underline-offset-4">Support Humanitarian Aid</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        </div>
      </a>

      {todayEntry ? (
        <div className="space-y-6">
          <div className={`p-8 rounded-[2.5rem] border space-y-6 shadow-sm transition-all duration-500 ${getCardClasses()}`}>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Daily Score</span>
              <span className="text-3xl font-bold">{todayEntry.analysis.happinessScore}%</span>
            </div>
            <p className="text-lg font-medium leading-snug">
              {todayEntry.analysis.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {todayEntry.analysis.detectedEmotions.map(emotion => (
                <span key={emotion} className={`border px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider opacity-60 ${theme === 'dark' ? 'border-zinc-700 bg-black' : 'border-black/10 bg-black/5'}`}>
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`p-10 rounded-[3rem] text-center space-y-6 border shadow-sm transition-all duration-500 ${getCardClasses()}`}>
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${theme === 'pink' ? 'bg-pink-600 text-white' : theme === 'gray' ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}>
            <HeartIcon />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Start your day</h3>
            <p className="opacity-50 text-xs font-medium">
              Share a moment with us to find balance.
            </p>
          </div>
          <button 
            onClick={onStartCheckIn}
            className={`w-full py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] transition-transform active:scale-95 shadow-md ${getButtonClasses()}`}
          >
            Check In
          </button>
        </div>
      )}

      <section className="space-y-4">
        <div className={`p-8 rounded-[2.5rem] border space-y-3 shadow-sm transition-all duration-500 ${getCardClasses()}`}>
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] opacity-40 ${theme === 'dark' ? 'border-zinc-700' : 'border-current'}`}>?</div>
          <p className="text-xs leading-relaxed font-medium opacity-70">
            Did you know that small acts of kindness can improve your sense of well-being? Think of one nice thing you did today.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
