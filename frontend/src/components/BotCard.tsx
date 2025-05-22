import { useEffect, useState } from 'react';
import ConsoleLog from './ConsoleLog';

interface BotCardProps {
  id: string;
  username: string;
  delay: number;
  platform: string;
  onStart?: (id: string) => void;
}

export default function BotCard({ id, username: initialUsername, delay: initialDelay, platform: initialPlatform }: BotCardProps) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [delay, setDelay] = useState(initialDelay.toString());
  const [log, setLog] = useState<string[]>([]);
  const [platform, setPlatform] = useState(initialPlatform);




  const killBot = async () => {
    try {
      await fetch(`http://localhost:3001/api/kill_Bot/${id}`, { method: 'POST' });


    } catch {
      setLog((prev) => [`[Failed to kill bot "${id}"]`, ...prev]);
    }
  };

  const fetchLog = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/retrieve_log/${id}`, { method: 'POST' });
      const data = await res.json();
      setLog(data.log ?? ['[No logs received]']);
    } catch {
      setLog(['[Failed to fetch log]']);
    }
  };


  const toggleSpin = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_spin/${id}`, { method: 'POST' });
      console.log(`[${id}] 🔁 Toggled spin`);
    } catch (err) {
      console.error('❌ Failed to toggle spin:', err);
    }
  };

  const toggleWindow = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_window/${id}`, { method: 'POST' });
      console.log(`[${id}] 🪟 Toggled window`);
    } catch (err) {
      console.error('❌ Failed to toggle window:', err);
    }
  };

  const toggleEco = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_Eco/${id}`, { method: 'POST' });
      console.log(`[${id}] 🌿 Toggled eco mode`);
    } catch (err) {
      console.error('❌ Failed to toggle eco mode:', err);
    }
  };

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


  useEffect(() => {
    fetchLog();
    const interval = setInterval(fetchLog, 2500);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    setUsername(initialUsername);
    setDelay(initialDelay.toString());
  }, [initialUsername, initialDelay]);


  return (
    <div className="relative w-full max-w-3xl">
      <div
        onClick={killBot}
        title="Kill bot"
        className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-l-[48px] border-t-red-700 border-l-transparent cursor-pointer z-10 hover:brightness-120 active:scale-105 transition-all"
      ></div>

      <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 pt-8 w-full space-y-4">

      <div className="flex justify-center text-gray-400">{id}</div>

      {/* Login fields */}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border rounded px-4 py-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-4 py-2"
      />

      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Spin time (seconds)</label>
          <input
            type="number"
            placeholder="e.g. 14"
            value={delay}
            min={10}
            onChange={(e) => setDelay(e.target.value)}
            className="border rounded px-3 py-2 w-24"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 items-center">
        <label className="text-sm text-gray-700">Platform</label>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="Fbet">Fbet</option>
          <option value="Forbes">Forbes</option>
          <option value="Synottip">Synottip</option>
          <option value="Gapa">Gapa</option>
        </select>
      </div>





        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn" onClick={applySettings}>Apply Settings</button>
          <button className="btn" onClick={toggleSpin}>Toggle spin</button>
          <button className="btn" onClick={toggleWindow}>Out of Bounds</button>
        </div>

        {/* Placeholder buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn" onClick={toggleEco}>Eco mode</button>
        </div>

        {/* Logs */}
        <ConsoleLog lines={log} />
      </div>
    </div>
  );
}
