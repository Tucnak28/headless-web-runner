interface BotCardProps {
  id: string;
  log: string[];
}

export default function BotCard({ id, log }: BotCardProps) {
  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 w-full max-w-3xl space-y-4">
      {/* ID Input */}
      <input
        type="text"
        placeholder="[ID]"
        value={id}
        readOnly
        className="w-full border rounded px-4 py-2 text-center font-mono"
      />

      {/* Top Row Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button className="btn">Toggle spin</button>
        <button className="btn">Out of Bounds</button>
        <button className="btn">Eco mode</button>
      </div>

      {/* Placeholder Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button className="btn">[Placeholder]</button>
        <button className="btn">[Placeholder]</button>
        <button className="btn">[Placeholder]</button>
      </div>

      {/* Log Output */}
      <div className="bg-gray-100 h-48 overflow-auto border rounded p-2 text-sm font-mono whitespace-pre-wrap">
        {log.length ? log.join('\n') : '[No logs yet]'}
      </div>
    </div>
  );
}
