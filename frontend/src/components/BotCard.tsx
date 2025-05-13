import { useEffect, useState, useRef } from 'react';
import ConsoleLog from './ConsoleLog';

interface BotCardProps {
  id: string;
  log: string[];
  onKill?: (id: string) => void;
}

export default function BotCard({ id, onKill }: BotCardProps) {
  const [log, setLog] = useState<string[]>([]);
  const hasStarted = useRef(false);

  const killBot = async () => {
    try {
      await fetch(`http://localhost:3001/api/kill_Bot/${id}`, {
        method: 'POST',
      });
      console.log(`[${id}] 💀 Bot killed`);
      if (onKill) onKill(id);
    } catch (err) {
      console.error('Failed to kill bot:', err);
      setLog((prev) => [`[Failed to kill bot "${id}"]`, ...prev]);
    }
  };

  const fetchLog = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/retrieve_log/${id}`, {
        method: 'POST',
      });
      const data = await res.json();
      setLog(data.log ?? ['[No logs received]']);
    } catch (err) {
      setLog(['[Failed to fetch log]']);
    }
  };

  const startBot = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/start/${id}`, {
        method: 'POST',
      });
      const data = await res.text();
      setLog([`[Started bot "${id}"]`, data]);
    } catch (err) {
      setLog([`[Failed to start bot "${id}"]`]);
    }
  };

  const toggleSpin = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_spin/${id}`, { method: 'POST' });
      console.log(`[${id}] 🔁 Toggled spin`);
    } catch (err) {
      console.error('Failed to toggle spin:', err);
    }
  };

  const toggleWindow = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_window/${id}`, { method: 'POST' });
      console.log(`[${id}] 🪟 Toggled window`);
    } catch (err) {
      console.error('Failed to toggle window:', err);
    }
  };

  const toggleEco = async () => {
    try {
      await fetch(`http://localhost:3001/api/toggle_Eco/${id}`, { method: 'POST' });
      console.log(`[${id}] 🌿 Toggled eco mode`);
    } catch (err) {
      console.error('Failed to toggle eco mode:', err);
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



      {/* Card */}
      <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 pt-8 w-full space-y-4">

        {/* ID */}
        <input
          type="text"
          placeholder="[ID]"
          value={id}
          readOnly
          className="w-full border rounded px-4 py-2 text-center font-mono"
        />

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn" onClick={toggleSpin}>Toggle spin</button>
          <button className="btn" onClick={toggleWindow}>Out of Bounds</button>
          <button className="btn" onClick={toggleEco}>Eco mode</button>
        </div>

        {/* Placeholder buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn">[Placeholder]</button>
          <button className="btn">[Placeholder]</button>
          <button className="btn">[Placeholder]</button>
        </div>

        {/* Log */}
        <ConsoleLog lines={log} />

        
      </div>
    </div>
  );
}
