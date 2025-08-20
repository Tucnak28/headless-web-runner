import { useEffect, useState, useCallback } from 'react';
import ConsoleLog from './ConsoleLog';
import Timer from './Timer';

interface BotCardProps {
  id: string;
  username: string;
  delay: number;
  platform: string;
  startTime?: string;
  endTime?: string | null;
  isAlive?: boolean;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  isSpinning?: boolean;
  totalSpinTime?: number;
  onStart?: (id: string) => void;
}

export default function BotCard({ 
  id, 
  username: initialUsername, 
  delay: initialDelay, 
  platform: initialPlatform,
  startTime,
  endTime,
  isAlive = true,
  scheduledStart,
  scheduledEnd,
  isSpinning = false,
  totalSpinTime = 0
}: BotCardProps) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [delay, setDelay] = useState(initialDelay.toString());
  const [log, setLog] = useState<string[]>([]);
  const [platform, setPlatform] = useState(initialPlatform || "Fbet");
  const [isDead, setIsDead] = useState(false);
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');




  const killBot = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/kill_Bot/${id}`, { method: 'POST' });
      if (response.ok) {
        setIsDead(true);
        setLog((prev) => [`💀 Bot "${id}" has been terminated`, ...prev]);
      }
    } catch {
      setLog((prev) => [`[Failed to kill bot "${id}"]`, ...prev]);
    }
  };

  const fetchLog = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/retrieve_log/${id}`, { method: 'POST' });
      const data = await res.json();
      setLog(data.log ?? ['[No logs received]']);
    } catch {
      setLog(['[Failed to fetch log]']);
    }
  }, [id]);


  const toggleSpin = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_spin/${id}`, { method: 'POST' });
      console.log(`[${id}] 🔁 Toggled spin`);
    } catch (err) {
      console.error('❌ Failed to toggle spin:', err);
    }
  };

  // Temporarily disabled - keeping for future use
  // const toggleWindow = async () => {
  //   try {
  //     await fetch(`http://localhost:3001/api/toggle_window/${id}`, { method: 'POST' });
  //     console.log(`[${id}] 🪟 Toggled window`);
  //   } catch (err) {
  //     console.error('❌ Failed to toggle window:', err);
  //   }
  // };


  const applySettings = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/apply_settings/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, delay, platform }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      console.log(`[${id}] 🔐 Login sent`);
    } catch (err) {
      console.error(`❌ Failed to send login for ${id}:`, err);
    }
  };

  const setSchedule = async () => {
    try {
      // Convert time inputs to ISO strings
      const now = new Date();
      const startDateTime = fromTime ? new Date(`${now.toDateString()} ${fromTime}`) : null;
      const endDateTime = toTime ? new Date(`${now.toDateString()} ${toTime}`) : null;
      
      const res = await fetch(`http://localhost:3001/api/set_schedule/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          startTime: startDateTime?.toISOString() || null, 
          endTime: endDateTime?.toISOString() || null 
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      console.log(`[${id}] 📅 Schedule set`);
    } catch (err) {
      console.error(`❌ Failed to set schedule for ${id}:`, err);
    }
  };


  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 2500);
    return () => clearInterval(interval);
  }, [fetchLog]);

  useEffect(() => {
    setUsername(initialUsername);
    setDelay(initialDelay.toString());
  }, [initialUsername, initialDelay]);


  return (
    <div className="relative w-full">
      {/* Kill Button */}
      {!isDead && (
        <button
          onClick={killBot}
          title="Terminate Bot"
          className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center text-sm font-bold transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg hover:shadow-red-500/25"
        >
          ×
        </button>
      )}

      <div className={`glass-card p-8 w-full space-y-6 transition-all duration-500 ${
        isDead 
          ? 'opacity-60 grayscale border-red-500/50 bg-red-500/5' 
          : 'hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:shadow-black/20'
      }`}>

        {/* Header with Bot ID and Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
              {id.slice(-2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-xl text-white mb-1">{id}</h3>
              <p className="text-sm text-gray-300 font-medium">Bot Instance</p>
            </div>
          </div>
          
          {/* Status Badge and Timer */}
          <div className="flex flex-col items-end gap-2">
            <div className={`status-badge ${isDead ? 'status-dead' : 'status-active'}`}>
              {isDead ? '💀 DEAD' : '🟢 ACTIVE'}
            </div>
            {startTime && (
              <Timer 
                startTime={startTime} 
                endTime={endTime} 
                isAlive={isAlive && !isDead}
                scheduledStart={scheduledStart}
                scheduledEnd={scheduledEnd}
                isSpinning={isSpinning}
                totalSpinTime={totalSpinTime}
              />
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isDead}
                  className="w-full"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isDead}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="border-t border-gray-600 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Schedule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">From (start time)</label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  disabled={isDead}
                  className="w-full text-sm"
                  placeholder="Leave empty to start now"
                />
                <p className="text-xs text-gray-400">Empty = start now</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">To (stop time)</label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  disabled={isDead}
                  className="w-full text-sm"
                  placeholder="Leave empty for indefinite"
                />
                <p className="text-xs text-gray-400">Empty = indefinite</p>
              </div>
            </div>
            
            <button
              onClick={setSchedule}
              disabled={isDead}
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Set Schedule
            </button>
          </div>

          {/* Configuration Row */}
          <div className="border-t border-gray-600 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Spin Delay (seconds)</label>
                <input
                  type="number"
                  placeholder="14"
                  value={delay}
                  min={10}
                  onChange={(e) => setDelay(e.target.value)}
                  disabled={isDead}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum: 10 seconds</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  disabled={isDead}
                  className="w-full"
                >
                  <option value="Fbet">Fbet</option>
                  <option value="Forbes">Forbes</option>
                  <option value="Synottip">Synottip</option>
                  <option value="Gapa">Gapa</option>
                </select>
              </div>
            </div>
          </div>
        </div>





        {/* Control Buttons */}
        <div className="border-t border-gray-600 pt-6">
          <h4 className="text-lg font-semibold text-white mb-4">
            Controls
          </h4>
          <div className="space-y-4">
            {/* Primary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2" 
                onClick={applySettings} 
                disabled={isDead}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply Settings
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2" 
                onClick={toggleSpin} 
                disabled={isDead}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSpinning ? 'Stop Spin' : 'Start Spin'}
              </button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <ConsoleLog lines={log} />
      </div>
    </div>
  );
}
