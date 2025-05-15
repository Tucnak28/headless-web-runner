import { useEffect, useState, useRef } from 'react';
import ConsoleLog from './ConsoleLog';

interface BotCardProps {
  id: string; // Keep this internally (for identification, not user input)
  onKill?: (id: string) => void;
}

export default function BotCard({ id, onKill }: BotCardProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [delay, setDelay] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const hasStarted = useRef(false);



  const killBot = async () => {
    try {
      await fetch(`http://localhost:3001/api/kill_Bot/${id}`, { method: 'POST' });
      if (onKill) onKill(id);
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

  const startBot = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/start/${id}`, { method: 'POST' });
      const data = await res.text();
      setLog([`[Started bot "${id}"]`, data]);
    } catch {
      setLog([`[Failed to start bot "${id}"]`]);
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
        body: JSON.stringify({ username, password, delay }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      console.log(`[${id}] 🔐 Login sent`);
    } catch (err) {
      console.error(`❌ Failed to send login for ${id}:`, err);
    }
  };


  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    startBot().then(() => {
      fetchLog();
      const interval = setInterval(fetchLog, 5000);
      return () => clearInterval(interval);
    });
  }, [id]);

  return (
    <div className="relative w-full max-w-3xl">
      <div
        onClick={killBot}
        title="Kill bot"
        className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-l-[48px] border-t-red-700 border-l-transparent cursor-pointer z-10 hover:brightness-120 active:scale-105 transition-all"
      ></div>

      <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 pt-8 w-full space-y-4">

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
            defaultValue={30}
            min={10}
            onChange={(e) => setDelay(e.target.value)}
            className="border rounded px-3 py-2 w-24"
          />
        </div>
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
