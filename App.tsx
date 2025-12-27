
import React, { useState, useEffect, useMemo } from 'react';
import { getPreferences, savePreferences, getEntries, saveEntries } from './storage';
import { UserPreferences, DayEntry } from './types';
import { requestNotificationPermission, showCheckInReminder } from './utils';

import Home from './screens/Home';
import CheckIn from './screens/CheckIn';
import Insights from './screens/Insights';
import Advice from './screens/Advice';
import Settings from './screens/Settings';
import Companion from './screens/Companion';
import Explore from './screens/Explore';
import Auth from './screens/Auth';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'companion' | 'explore' | 'insights' | 'advice' | 'settings' | 'checkin'>('home');
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());
  const [entries, setEntries] = useState<DayEntry[]>(getEntries());

  useEffect(() => {
    // Save preferences to local storage whenever they change
    savePreferences(prefs);
    
    // Manage class names on html for theme targeting
    document.documentElement.classList.remove('dark', 'pink-theme', 'gray-theme');
    if (prefs.theme === 'dark') document.documentElement.classList.add('dark');
    else if (prefs.theme === 'pink') document.documentElement.classList.add('pink-theme');
    else if (prefs.theme === 'gray') document.documentElement.classList.add('gray-theme');

    // Handle Notifications for logged in users
    if (prefs.isLoggedIn && prefs.notificationsEnabled) {
      requestNotificationPermission().then(granted => {
        if (granted) {
          const today = new Date().toISOString().split('T')[0];
          const hasCheckedInToday = entries.some(e => e.date.split('T')[0] === today);
          if (!hasCheckedInToday) {
            const timer = setTimeout(() => {
              showCheckInReminder();
            }, 5000);
            return () => clearTimeout(timer);
          }
        }
      });
    }
  }, [prefs, entries]);

  const updateEntries = (newEntries: DayEntry[]) => {
    setEntries(newEntries);
    saveEntries(newEntries);
  };

  const currentScreen = useMemo(() => {
    switch (activeTab) {
      case 'home': return <Home entries={entries} theme={prefs.theme} onStartCheckIn={() => setActiveTab('checkin')} />;
      case 'companion': return <Companion theme={prefs.theme} />;
      case 'explore': return <Explore theme={prefs.theme} />;
      case 'checkin': return <CheckIn entries={entries} theme={prefs.theme} onComplete={(entry) => {
        updateEntries([entry, ...entries]);
        setActiveTab('home');
      }} onCancel={() => setActiveTab('home')} />;
      case 'insights': return <Insights entries={entries} theme={prefs.theme} />;
      case 'advice': return <Advice entries={entries} theme={prefs.theme} />;
      case 'settings': return <Settings prefs={prefs} onUpdatePrefs={setPrefs} onClearData={() => {
        setEntries([]);
        setPrefs({ ...prefs, theme: 'dark', isLoggedIn: false, agreedToTerms: false });
      }} />;
      default: return <Home entries={entries} theme={prefs.theme} onStartCheckIn={() => setActiveTab('checkin')} />;
    }
  }, [activeTab, entries, prefs]);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'companion', label: 'Ally' },
    { id: 'explore', label: 'Explore' },
    { id: 'insights', label: 'Stats' },
    { id: 'advice', label: 'Advice' },
    { id: 'settings', label: 'Profile' },
  ] as const;

  const getBodyClasses = () => {
    if (prefs.theme === 'pink') return 'bg-pink-100 text-pink-950';
    if (prefs.theme === 'gray') return 'bg-zinc-200 text-zinc-900';
    return 'bg-black text-white';
  };

  const getNavClasses = () => {
    if (prefs.theme === 'pink') return 'bg-pink-200/90 border-pink-300 shadow-pink-200/50';
    if (prefs.theme === 'gray') return 'bg-zinc-300/90 border-zinc-400 shadow-zinc-300/50';
    return 'bg-zinc-900/90 border-zinc-800 shadow-black/50';
  };

  const getTabActiveClasses = () => {
    if (prefs.theme === 'pink') return 'bg-pink-600 text-white';
    if (prefs.theme === 'gray') return 'bg-zinc-800 text-white';
    return 'bg-white text-black';
  };

  const getTabInactiveClasses = () => {
    if (prefs.theme === 'pink') return 'text-pink-500 hover:text-pink-700';
    if (prefs.theme === 'gray') return 'text-zinc-500 hover:text-zinc-700';
    return 'text-zinc-500 hover:text-white';
  };

  // Skip auth if already logged in via localStorage
  if (!prefs.isLoggedIn) {
    return <Auth onAuthComplete={(newPrefs) => setPrefs({ ...prefs, ...newPrefs } as UserPreferences)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getBodyClasses()}`}>
      <div className="max-w-md mx-auto px-6 pt-8 flex justify-end">
        <div className="flex items-center gap-2 group">
           <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-40">Friend&Help</span>
           <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${prefs.theme === 'pink' ? 'bg-pink-600 text-white border-pink-700 shadow-sm' : prefs.theme === 'gray' ? 'bg-zinc-800 text-white border-zinc-900 shadow-sm' : 'bg-zinc-900 text-white border-zinc-800 shadow-sm'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
           </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 pt-8 pb-32">
        {currentScreen}
      </main>

      {activeTab !== 'checkin' && (
        <nav className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm border backdrop-blur-md px-1 py-1 flex justify-between items-center rounded-full z-50 shadow-2xl transition-all duration-300 ${getNavClasses()}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 text-[8px] font-bold uppercase tracking-wider ${activeTab === item.id 
                ? getTabActiveClasses()
                : getTabInactiveClasses()}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
