
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { checkProfanity } from '../utils';

interface AuthProps {
  onAuthComplete: (prefs: Partial<UserPreferences>) => void;
}

type AuthStep = 'welcome' | 'credentials' | 'profile' | 'terms';

const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('bg-indigo-500');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
    'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 
    'bg-emerald-500', 'bg-teal-500'
  ];

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // In this local-first version, Sign In simply restores the session
      // App.tsx already loads existing localStorage data, so we just flip the bit
      onAuthComplete({ isLoggedIn: true, email }); 
    } else {
      setStep('profile');
    }
  };

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkProfanity(name) || checkProfanity(bio)) {
      setError('Please use appropriate language. Profanity is restricted.');
      return;
    }
    setError('');
    setStep('terms');
  };

  const handleFinalize = () => {
    if (agreed) {
      onAuthComplete({
        isLoggedIn: true,
        agreedToTerms: true,
        email,
        name,
        bio,
        avatarColor,
        notificationsEnabled: true
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="max-w-xs w-full space-y-12">
        {step === 'welcome' && (
          <div className="text-center space-y-10 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 mx-auto shadow-2xl shadow-indigo-500/40 flex items-center justify-center text-white">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-white">Friend&Help</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Universal Emotional Sync</p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => { setIsLogin(false); setStep('credentials'); }}
                className="w-full py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all"
              >
                Create Account
              </button>
              <button 
                onClick={() => { setIsLogin(true); setStep('credentials'); }}
                className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {(step === 'credentials') && (
          <form onSubmit={handleCredentials} className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter text-white">{isLogin ? 'Welcome Back.' : 'New Identity.'}</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Securing your sync stream</p>
            </div>
            <div className="space-y-4">
              <input 
                required
                type="email" 
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-[11px] font-bold tracking-widest focus:outline-none focus:border-white/30 placeholder-white/20"
              />
              <input 
                required
                type="password" 
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-[11px] font-bold tracking-widest focus:outline-none focus:border-white/30 placeholder-white/20"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
            >
              {isLogin ? 'Authorize' : 'Continue'}
            </button>
            <button type="button" onClick={() => setStep('welcome')} className="w-full text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Go Back</button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfile} className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter text-white">Personalize.</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">How should we address you?</p>
            </div>
            
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-[2rem] ${avatarColor} flex items-center justify-center text-3xl font-black text-white shadow-2xl transition-all`}>
                {name.charAt(0) || '?'}
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {colors.map(c => (
                <button 
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-6 h-6 rounded-lg ${c} ${avatarColor === c ? 'ring-2 ring-white ring-offset-4 ring-offset-black' : 'opacity-40'}`}
                />
              ))}
            </div>

            <div className="space-y-4">
              <input 
                required
                placeholder="PUBLIC NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-white/5 border rounded-2xl p-5 text-white text-[11px] font-bold tracking-widest focus:outline-none placeholder-white/20 ${error ? 'border-red-500' : 'border-white/10 focus:border-white/30'}`}
              />
              <textarea 
                required
                placeholder="SHORT BIO"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-[11px] font-bold tracking-widest focus:outline-none focus:border-white/30 placeholder-white/20 resize-none ${error ? 'border-red-500' : 'border-white/10'}`}
              />
              {error && <p className="text-[9px] text-red-500 font-bold px-2 text-center">{error}</p>}
            </div>
            <button 
              type="submit"
              className="w-full py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
            >
              Sync Profile
            </button>
          </form>
        )}

        {step === 'terms' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter text-white">Guidelines.</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Harmonious community standards</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-64 overflow-y-auto custom-scroll space-y-4">
              <p className="text-[10px] text-white/60 leading-relaxed">
                By entering Friend&Help, you agree to contribute to a positive and safe environment.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                   <div className="w-5 h-5 rounded bg-red-500/20 text-red-500 flex items-center justify-center text-[10px] font-black shrink-0">!</div>
                   <p className="text-[9px] text-white/80 font-bold leading-relaxed uppercase tracking-tighter">NO PROFANITY OR SWEAR WORDS ALLOWED.</p>
                </div>
                <div className="flex gap-4">
                   <div className="w-5 h-5 rounded bg-red-500/20 text-red-500 flex items-center justify-center text-[10px] font-black shrink-0">!</div>
                   <p className="text-[9px] text-white/80 font-bold leading-relaxed uppercase tracking-tighter">NO HARASSMENT OR BULLYING.</p>
                </div>
                <div className="flex gap-4">
                   <div className="w-5 h-5 rounded bg-green-500/20 text-green-500 flex items-center justify-center text-[10px] font-black shrink-0">✓</div>
                   <p className="text-[9px] text-white/80 font-bold leading-relaxed uppercase tracking-tighter">USE KINDNESS AS YOUR PRIMARY PROTOCOL.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setAgreed(!agreed)}>
               <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreed ? 'bg-white border-white' : 'border-white/20'}`}>
                 {agreed && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">I agree to the guidelines</span>
            </div>

            <button 
              disabled={!agreed}
              onClick={handleFinalize}
              className="w-full py-5 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all disabled:opacity-10"
            >
              Enter Sanctuary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
