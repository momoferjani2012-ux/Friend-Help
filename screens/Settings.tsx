
import React, { useState } from 'react';
import { UserPreferences, DayEntry } from '../types';
import { clearAllData, getEntries } from '../storage';
import { checkProfanity, requestNotificationPermission, showCheckInReminder } from '../utils';

interface SettingsProps {
  prefs: UserPreferences;
  onUpdatePrefs: (prefs: UserPreferences) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ prefs, onUpdatePrefs, onClearData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(prefs.name);
  const [editBio, setEditBio] = useState(prefs.bio);
  const [activeColor, setActiveColor] = useState(prefs.avatarColor || 'bg-blue-500');
  const [error, setError] = useState('');

  const handleClear = () => {
    if (confirm("Delete all your local data? This action is permanent.")) {
      clearAllData();
      onClearData();
      window.location.reload();
    }
  };

  const saveProfile = () => {
    if (checkProfanity(editName) || checkProfanity(editBio)) {
      setError('Please use appropriate language for your profile.');
      return;
    }
    setError('');
    onUpdatePrefs({ ...prefs, name: editName, bio: editBio, avatarColor: activeColor });
    setIsEditing(false);
  };

  const toggleNotifications = async () => {
    if (!prefs.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Notification permissions denied. Please enable them in your browser settings.");
        return;
      }
    }
    onUpdatePrefs({ ...prefs, notificationsEnabled: !prefs.notificationsEnabled });
  };

  const testNotification = () => {
    showCheckInReminder();
  };

  const colors = [
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 
    'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 
    'bg-amber-500', 'bg-emerald-500', 'bg-teal-500'
  ];

  const getCardClasses = () => {
    if (prefs.theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
    if (prefs.theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
    return 'bg-zinc-900 border-zinc-800 text-white';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tighter">Profile.</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </header>

      <div className={`p-10 rounded-[3rem] border shadow-2xl transition-all duration-500 flex flex-col items-center gap-8 ${getCardClasses()}`}>
        {/* Avatar Section */}
        <div className="relative group">
          <div className={`w-32 h-32 rounded-[2.5rem] ${activeColor} shadow-2xl flex items-center justify-center text-4xl font-black text-white transition-all transform group-hover:scale-105`}>
            {editName.charAt(0) || prefs.name.charAt(0) || '?'}
          </div>
          {isEditing && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-black cursor-pointer animate-bounce">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full text-center space-y-2">
          {isEditing ? (
            <div className="space-y-6 w-full px-4">
              <div className="space-y-2 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 px-2">Identity Name</p>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full p-4 rounded-2xl bg-black/5 border focus:outline-none focus:border-current text-center font-bold text-lg ${error ? 'border-red-500' : 'border-black/10'}`}
                />
              </div>
              <div className="space-y-2 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 px-2">Biographic Sync</p>
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className={`w-full p-4 rounded-2xl bg-black/5 border border-black/10 focus:outline-none focus:border-current text-center text-xs font-medium italic ${error ? 'border-red-500' : ''}`}
                />
                {error && <p className="text-[9px] text-red-500 font-bold px-2 text-center">{error}</p>}
              </div>
              <div className="space-y-3 text-left">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-30 px-2 text-center">Core Energy Color</p>
                 <div className="flex flex-wrap justify-center gap-2">
                   {colors.map(c => (
                     <button 
                       key={c} 
                       onClick={() => setActiveColor(c)}
                       className={`w-8 h-8 rounded-lg ${c} ${activeColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'opacity-40'}`} 
                     />
                   ))}
                 </div>
              </div>
              <button 
                onClick={saveProfile}
                className={`w-full py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-xl`}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-black tracking-tighter">{prefs.name}</h2>
                <p className="text-xs font-medium opacity-50 px-8 italic">{prefs.bio}</p>
              </div>
              <div className="flex justify-center gap-2">
                 <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest">Lv. 04 Ally</span>
                 <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/5 text-[9px] font-black uppercase tracking-widest">Early Adopter</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 px-6">Reminders</h3>
        <div className={`p-6 rounded-[2.5rem] border flex flex-col gap-4 ${getCardClasses()}`}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-sm font-bold">Daily Sync Notifications</span>
              <span className="text-[10px] opacity-50">Remind me to check in once a day</span>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full relative transition-all ${prefs.notificationsEnabled ? 'bg-green-500' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs.notificationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          {prefs.notificationsEnabled && (
            <button 
              onClick={testNotification}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Test Notification
            </button>
          )}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 px-6">Environment</h3>
        <div className={`p-4 rounded-[2.5rem] border flex gap-2 ${getCardClasses()}`}>
          {(['dark', 'pink', 'gray'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onUpdatePrefs({ ...prefs, theme: t })}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${prefs.theme === t ? 'bg-current bg-opacity-10 border-2 border-current' : 'opacity-40 border-2 border-transparent'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8 text-center">
         <p className="text-[10px] font-bold opacity-30 italic mb-4">Your information is securely stored locally.</p>
        <button 
          onClick={handleClear}
          className="w-full text-[9px] font-black uppercase tracking-[0.4em] opacity-20 hover:opacity-100 text-red-500 transition-all p-4"
        >
          Purge All Local Memory
        </button>
      </div>
    </div>
  );
};

export default Settings;
