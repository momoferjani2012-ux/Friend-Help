
import React, { useState, useEffect, useRef } from 'react';
import { getNearbyActivities } from '../gemini';

interface ExploreProps {
  theme: 'dark' | 'pink' | 'gray';
}

interface Activity {
  title: string;
  uri: string;
  lat?: number;
  lng?: number;
  distance?: number;
}

const Explore: React.FC<ExploreProps> = ({ theme }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discovery, setDiscovery] = useState<{ text: string; links: Activity[] } | null>(null);
  const [targetActivity, setTargetActivity] = useState<Activity | null>(null);
  const [isGettingCloser, setIsGettingCloser] = useState<boolean | null>(null);
  
  const prevDistanceRef = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  // Haversine formula to calculate distance between two points on Earth
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const formatDistance = (km: number | undefined) => {
    if (km === undefined) return null;
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  };

  const calculateTravelTime = (km: number | undefined) => {
    if (km === undefined) return null;
    // Estimated average speed: 4.5 km/h for a relaxed walk to a sanctuary
    const speedKmH = 4.5; 
    const totalMinutes = (km / speedKmH) * 60;
    
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);

    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  const requestLocation = () => {
    setError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(coords);
          handleDiscover(coords.lat, coords.lng);
        },
        (err) => {
          setError("GPS Signal Blocked. Please check location permissions.");
          console.error(err);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );

      // Start continuous tracking
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = navigator.geolocation.watchPosition((pos) => {
        const currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(currentCoords);

        if (targetActivity && targetActivity.lat && targetActivity.lng) {
          const newDist = calculateDistance(currentCoords.lat, currentCoords.lng, targetActivity.lat, targetActivity.lng);
          if (prevDistanceRef.current !== null) {
            setIsGettingCloser(newDist < prevDistanceRef.current);
          }
          prevDistanceRef.current = newDist;
          // Update the target activity with new distance for real-time UI updates
          setTargetActivity(prev => prev ? { ...prev, distance: newDist } : null);
        }
      }, (err) => {
        console.error("Tracking Error:", err);
      }, { enableHighAccuracy: true });
    }
  };

  useEffect(() => {
    requestLocation();
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const parseCoordinates = (text: string, links: Activity[]): Activity[] => {
    // Regex matches the [COORD: lat, lng] format defined in gemini.ts
    const coordRegex = /\[COORD:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/g;
    const matches = [...text.matchAll(coordRegex)];
    
    return links.map((link, idx) => {
      const match = matches[idx];
      if (match && location) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        const dist = calculateDistance(location.lat, location.lng, lat, lng);
        return { ...link, lat, lng, distance: dist };
      }
      return link;
    });
  };

  const handleDiscover = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNearbyActivities(lat, lng);
      const enrichedLinks = parseCoordinates(result.text, result.links);
      setDiscovery({ ...result, links: enrichedLinks });
    } catch (err) {
      setError("Synchronous connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCardClasses = () => {
    if (theme === 'pink') return 'bg-pink-200 border-pink-300 text-pink-950';
    if (theme === 'gray') return 'bg-zinc-300 border-zinc-400 text-zinc-900';
    return 'bg-zinc-900 border-zinc-800 text-white';
  };

  const handleSelectActivity = (act: Activity) => {
    setTargetActivity(act);
    prevDistanceRef.current = act.distance || null;
    setIsGettingCloser(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Explore.</h1>
        <p className="text-sm opacity-50 font-medium">Your destination is waiting.</p>
      </header>

      {/* Main Navigation Status Panel */}
      <div className={`relative w-full p-10 rounded-[3rem] border shadow-2xl transition-all duration-500 flex flex-col items-center justify-center text-center gap-8 overflow-hidden ${theme === 'dark' ? 'border-zinc-800 bg-zinc-950' : 'border-black/5 bg-white'}`}>
        {targetActivity ? (
          <div className="animate-in zoom-in-95 duration-500 space-y-8 w-full relative z-10">
             <div className="space-y-1">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Active Guidance</span>
               <h2 className="text-3xl font-black tracking-tighter leading-tight">{targetActivity.title}</h2>
             </div>

             <div className="grid grid-cols-2 gap-4 w-full">
               <div className={`p-6 rounded-[2rem] border flex flex-col items-center gap-1 ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-black/5 border-black/5'}`}>
                 <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Distance</span>
                 <span className="text-2xl font-black tracking-tighter">{formatDistance(targetActivity.distance)}</span>
               </div>
               <div className={`p-6 rounded-[2rem] border flex flex-col items-center gap-1 ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-black/5 border-black/5'}`}>
                 <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Travel Time</span>
                 <span className="text-2xl font-black tracking-tighter text-blue-500">{calculateTravelTime(targetActivity.distance)}</span>
               </div>
             </div>

             <div className="flex flex-col items-center gap-4">
                <div className={`inline-flex items-center gap-3 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isGettingCloser ? 'bg-green-500/10 text-green-500' : 'bg-current/5 opacity-50'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full bg-current ${isGettingCloser ? 'animate-pulse' : ''}`} />
                    {isGettingCloser ? 'Progressing • Getting Closer' : 'Awaiting Movement'}
                </div>

                <a 
                    href={targetActivity.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${theme === 'pink' ? 'bg-pink-600 text-white' : theme === 'gray' ? 'bg-zinc-800 text-white' : 'bg-white text-black'}`}
                >
                    Start Trip
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                </a>
             </div>
          </div>
        ) : (
          <div className="py-14 space-y-6 opacity-30 animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div className="space-y-1">
                <p className="text-[12px] font-black uppercase tracking-[0.4em]">Select Sanctuary</p>
                <p className="text-[9px] font-bold uppercase tracking-widest">Awaiting destination lock...</p>
            </div>
          </div>
        )}

        {/* Decorative Compass UI */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-current opacity-[0.03] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 p-8 opacity-[0.02] pointer-events-none font-black text-[120px] leading-none select-none">GPS</div>
      </div>

      {/* Discovery Feed */}
      <div className="space-y-4 pb-20">
        <div className="flex justify-between items-center px-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Detected Locations</h3>
          {location && (
            <button 
              onClick={() => handleDiscover(location.lat, location.lng)} 
              className="text-[9px] font-bold uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity"
            >
              Scan Perimeter
            </button>
          )}
        </div>

        {loading ? (
          <div className={`p-20 rounded-[3rem] border animate-pulse flex flex-col items-center gap-6 ${getCardClasses()}`}>
            <div className="w-1/2 h-2 bg-current opacity-10 rounded-full" />
            <div className="w-3/4 h-2 bg-current opacity-10 rounded-full" />
          </div>
        ) : discovery ? (
          <div className="grid grid-cols-1 gap-3">
            {discovery.links.map((link, idx) => (
              <button 
                key={idx} 
                onClick={() => handleSelectActivity(link)}
                className={`p-7 rounded-[2.8rem] border flex justify-between items-center transition-all cursor-pointer group text-left active:scale-[0.97] ${getCardClasses()} ${targetActivity?.title === link.title ? 'ring-4 ring-blue-500/30 border-blue-500/60 scale-[1.03] shadow-2xl' : 'hover:bg-current hover:bg-opacity-[0.02]'}`}
              >
                <div className="flex items-center gap-7">
                  <div className={`w-14 h-14 rounded-2xl border border-current/10 flex items-center justify-center text-sm font-black transition-all ${targetActivity?.title === link.title ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-current/5 opacity-50'}`}>
                    {targetActivity?.title === link.title ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg> : idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold tracking-tight mb-0.5">{link.title}</span>
                    <div className="flex gap-4 items-center">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${targetActivity?.title === link.title ? 'text-blue-500' : 'opacity-40'}`}>
                        {formatDistance(link.distance) || 'Detecting...'}
                      </span>
                      {link.distance && (
                        <span className="text-[11px] font-black uppercase tracking-wider opacity-20">
                           ~{calculateTravelTime(link.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-full transition-all ${targetActivity?.title === link.title ? 'bg-blue-600/10 text-blue-500' : 'opacity-10 group-hover:opacity-100'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                </div>
              </button>
            ))}
          </div>
        ) : location ? (
          <button 
            onClick={() => handleDiscover(location.lat, location.lng)}
            className={`w-full p-14 rounded-[3.5rem] border text-[12px] font-black uppercase tracking-[0.8em] transition-all active:scale-95 shadow-2xl ${getCardClasses()}`}
          >
            Locate Sanctuaries
          </button>
        ) : error ? (
           <div className="text-center p-14 space-y-6">
              <p className="text-sm font-black uppercase tracking-widest text-red-500 opacity-60 leading-relaxed">{error}</p>
              <button onClick={requestLocation} className="px-8 py-3 rounded-full border border-current text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Reset Signal</button>
           </div>
        ) : null}
      </div>

      <style>{`
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Explore;
