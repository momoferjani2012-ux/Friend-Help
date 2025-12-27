
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { getCompanionResponse } from '../gemini';
import { getChatSessions, saveChatSessions } from '../storage';
import { ChatMessage, ChatSession } from '../types';

interface CompanionProps {
  theme: 'dark' | 'pink' | 'gray';
}

const Companion: React.FC<CompanionProps> = ({ theme }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(getChatSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize first session if empty
    if (sessions.length === 0) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "First Conversation",
        messages: [{ role: 'assistant', content: "I am Friend&Help. I am here to listen. How are things on your end?", timestamp: Date.now() }],
        updatedAt: Date.now()
      };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
      saveChatSessions([newSession]);
    } else if (!activeSessionId) {
      // Default to the most recent session
      setActiveSessionId(sessions[0].id);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (sessions.length > 0) saveChatSessions(sessions);
  }, [sessions, isTyping, activeSessionId]);

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || sessions[0], 
  [sessions, activeSessionId]);

  const handleSendAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !activeSessionId) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() };
    const currentInput = input;
    setInput("");
    
    const updatedSessions = sessions.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, userMsg], updatedAt: Date.now() } 
        : s
    );
    setSessions(updatedSessions);
    setIsTyping(true);

    try {
      const aiResponse = await getCompanionResponse(userMsg.content, activeSession.messages);
      const assistantMsg: ChatMessage = { role: 'assistant', content: aiResponse, timestamp: Date.now() };
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: [...s.messages, assistantMsg], 
              updatedAt: Date.now(), 
              title: s.messages.length < 3 ? currentInput.substring(0, 20) + '...' : s.title 
            } 
          : s
      ));
    } catch (err) {
      console.error("AI Sync Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const getBubbleClasses = (role: 'user' | 'assistant') => {
    if (role === 'user') return theme === 'pink' ? 'bg-pink-600 text-white border-transparent' : theme === 'gray' ? 'bg-zinc-800 text-white border-transparent' : 'bg-white text-black border-transparent shadow-md';
    return theme === 'pink' ? 'bg-pink-200 border-pink-300 text-pink-950' : theme === 'gray' ? 'bg-zinc-300 border-zinc-400 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-300';
  };

  const getCardClasses = () => {
    if (theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
    if (theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
    return 'bg-zinc-900 border-zinc-800 text-white';
  };

  return (
    <div className="flex flex-col h-[82vh] animate-in fade-in duration-700">
      <header className="mb-6 space-y-1">
        <h1 className="text-3xl font-black tracking-tighter">Companion.</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Universal Emotional Ally</p>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex flex-col">
          {activeSessionId ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4 px-1">
                <button 
                  onClick={() => setActiveSessionId(null)} 
                  className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all flex items-center gap-1"
                >
                  &larr; Archive
                </button>
                <span className="text-[10px] font-black tracking-tighter opacity-20 truncate max-w-[150px]">{activeSession.title}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 custom-scroll px-1 pb-4">
                {activeSession.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                     <div className={`max-w-[85%] px-4 py-3 rounded-[1.6rem] text-[11px] font-medium leading-relaxed border transition-all ${getBubbleClasses(msg.role)} ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                       {msg.content}
                     </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-3 rounded-[1.6rem] rounded-tl-none border flex gap-1 ${getBubbleClasses('assistant')}`}>
                      <div className="w-1.5 h-1.5 bg-current opacity-50 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-current opacity-50 rounded-full animate-bounce delay-75" />
                      <div className="w-1.5 h-1.5 bg-current opacity-50 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendAI} className="mt-4 relative">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Tell me about your thoughts..." 
                  className={`w-full border rounded-[2rem] py-5 px-8 text-[11px] font-medium focus:outline-none transition-all shadow-xl ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700' : 'bg-white border-black/5 text-black placeholder-zinc-400'}`} 
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold active:scale-90 transition-all disabled:opacity-20 ${theme === 'pink' ? 'bg-pink-600 text-white' : theme === 'gray' ? 'bg-zinc-800 text-white' : 'bg-white text-black shadow-lg'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-500">
              <button 
                onClick={() => { 
                  const s = { 
                    id: Date.now().toString(), 
                    title: "New Session", 
                    messages: [{ role: 'assistant', content: "Starting a fresh reflection. What's on your mind?", timestamp: Date.now() }], 
                    updatedAt: Date.now() 
                  }; 
                  setSessions([s, ...sessions]); 
                  setActiveSessionId(s.id); 
                }} 
                className={`w-full p-8 rounded-[2.5rem] border border-dashed text-[11px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 ${getCardClasses()} opacity-60 hover:opacity-100`}
              >
                + New Sync Session
              </button>
              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[50vh] custom-scroll">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-4">Archives</p>
                  {sessions.map(session => (
                      <button 
                        key={session.id} 
                        onClick={() => setActiveSessionId(session.id)} 
                        className={`p-6 rounded-[2.2rem] border flex justify-between items-center transition-all text-left ${getCardClasses()} hover:scale-[1.02] active:scale-95`}
                      >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight">{session.title}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{new Date(session.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xl opacity-20">&rarr;</span>
                      </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Companion;
