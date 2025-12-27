import React, { useState, useRef, useEffect } from 'react';
import { getFollowUp, analyzeDay } from '../gemini';
import { DayEntry, ChatMessage } from '../types';

interface CheckInProps {
  entries: DayEntry[];
  theme: 'dark' | 'pink' | 'gray';
  onComplete: (entry: DayEntry) => void;
  onCancel: () => void;
}

const CheckIn: React.FC<CheckInProps> = ({ entries, theme, onComplete, onCancel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "I'm listening. How was your day?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isFinishing) return;

    const userText = input.trim();
    setInput("");
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userText, timestamp: Date.now() }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      if (followUpCount < 2) {
        const history = newMessages.map(m => m.content);
        const nextQuestion = await getFollowUp(userText, history);
        setMessages([...newMessages, { role: 'assistant', content: nextQuestion, timestamp: Date.now() }]);
        setFollowUpCount(prev => prev + 1);
      } else {
        await finalize(newMessages);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "There was a small error, but I am still here. Shall we finish?", timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const finalize = async (finalMessages: ChatMessage[]) => {
    setIsFinishing(true);
    setIsTyping(true);
    try {
      const mainEntry = finalMessages.find(m => m.role === 'user')?.content || "";
      const followUps = finalMessages.filter(m => m.role === 'user').slice(1).map(m => m.content);
      
      const analysis = await analyzeDay(mainEntry, followUps, entries);
      
      const newEntry: DayEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: mainEntry,
        followUps: followUps,
        analysis: analysis
      };
      
      onComplete(newEntry);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFinishing(false);
      setIsTyping(false);
    }
  };

  const getBubbleClasses = (role: 'user' | 'assistant') => {
    if (role === 'user') {
      if (theme === 'pink') return 'bg-pink-600 text-white';
      if (theme === 'gray') return 'bg-zinc-800 text-white';
      return 'bg-white text-black';
    } else {
      if (theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
      if (theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
      return 'bg-zinc-900 border-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-500 overflow-hidden ${theme === 'pink' ? 'bg-pink-100' : theme === 'gray' ? 'bg-zinc-200' : 'bg-black'}`}>
      <header className="px-8 pt-10 pb-4 flex items-center justify-between">
        <button onClick={onCancel} className={`w-10 h-10 rounded-full border flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity ${theme === 'pink' ? 'bg-pink-200 border-pink-300 text-pink-900' : theme === 'gray' ? 'bg-zinc-300 border-zinc-400 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-white'}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${followUpCount >= i ? (theme === 'pink' ? 'bg-pink-600' : theme === 'gray' ? 'bg-zinc-800' : 'bg-white') : 'bg-current opacity-20'}`} />
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scroll">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-[1.4rem] text-[11px] font-medium leading-relaxed shadow-sm border ${getBubbleClasses(msg.role)} ${msg.role === 'user' ? 'rounded-tr-none border-transparent' : 'rounded-tl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`px-4 py-2.5 rounded-[1.4rem] rounded-tl-none border flex gap-1 ${getBubbleClasses('assistant')}`}>
              <div className="w-1 h-1 bg-current opacity-50 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-current opacity-50 rounded-full animate-bounce delay-75" />
              <div className="w-1 h-1 bg-current opacity-50 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 pb-10">
        <form onSubmit={handleSubmit} className="relative">
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping || isFinishing}
            placeholder={isFinishing ? "Analyzing your day..." : "Talk to me..."}
            className={`w-full border rounded-full py-4 px-6 text-[11px] focus:outline-none transition-all shadow-inner ${theme === 'pink' ? 'bg-pink-200 border-pink-300 text-pink-950 placeholder-pink-400 focus:border-pink-600' : theme === 'gray' ? 'bg-zinc-300 border-zinc-400 text-zinc-900 placeholder-zinc-500 focus:border-zinc-800' : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-white'}`}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold active:scale-90 transition-all disabled:opacity-10 shadow-lg ${theme === 'pink' ? 'bg-pink-600 text-white' : theme === 'gray' ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
          </button>
        </form>
        {followUpCount >= 1 && !isFinishing && (
          <button 
            onClick={() => finalize(messages)}
            className="w-full mt-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
          >
            End Sync
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckIn;