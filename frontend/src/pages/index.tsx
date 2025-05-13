'use client';
import { useState } from 'react';
import BotCard from '@/components/BotCard';
import AddBotButton from '@/components/AddBotButton';

export default function Home() {
  const [bots, setBots] = useState<string[]>(['bot1']);

  const addBot = () => {
    const nextId = `bot${bots.length + 1}`;
    setBots((prev) => [...prev, nextId]);
  };

  return (
    <main className="min-h-screen bg-gray-70 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
        {bots.map((id) => (
          <BotCard key={id} id={id} log={['[Test]']} />
        ))}
        <AddBotButton onClick={addBot} />
      </div>
    </main>
  );
}
