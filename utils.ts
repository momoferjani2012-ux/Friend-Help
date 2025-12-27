
export const forbiddenWords = [
  'fuck', 'fucking', 'fucker', 'fucked', 'shitt', 'shit', 'bitch', 'asshole', 
  'dick', 'pussy', 'cunt', 'bastard', 'slut', 'whore', 'nigger', 'faggot', 
  'retard', 'cum', 'cock', 'tit', 'boob', 'penis', 'vagina', 'chink', 'kike', 
  'spic', 'wetback', 'coon', 'nazi', 'hitler', 'rape', 'pedophile', 'porn',
  'dumbass', 'dumb', 'idiot', 'moron', 'piss', 'motherfucker', 'jackass'
];

export const checkProfanity = (str: string): boolean => {
  if (!str) return false;
  const lower = str.toLowerCase();
  // We check for both partial matches within words and exact matches
  return forbiddenWords.some(word => {
    // Exact word match using word boundaries
    const exactRegex = new RegExp(`\\b${word}\\b`, 'i');
    // Substring match for more aggressive filtering
    return exactRegex.test(lower) || lower.includes(word);
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showCheckInReminder = () => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  new Notification('Friend&Help', {
    body: "Time for your daily sync! How are you feeling today?",
    icon: 'https://cdn-icons-png.flaticon.com/512/2589/2589175.png' // Heart icon placeholder
  });
};
