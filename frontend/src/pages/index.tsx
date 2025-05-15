'use client';
import { useState, useEffect } from 'react';
import BotCard from '@/components/BotCard';
import AddBotButton from '@/components/AddBotButton';

type BotInfo = {
  id: string;
  username: string;
  delay: number;
};


const startBot = async () => {
  try {
    const res = await fetch(`http://localhost:3001/api/startNewBot`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to start bot: ${errText}`);
    }
  } catch (err) {
    console.error('Error starting bot:', err);
  }
};



export default function Home() {
  const [bots, setBots] = useState<BotInfo[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'botList') {
        setBots(data.bots); // array of { id, username, delay }
      }
    };

    return () => socket.close();
  }, []);

  return (
    <main className="min-h-screen bg-gray-70 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
        {bots.map((bot) => (
          <BotCard key={`${bot.id}-${bot.username}-${bot.delay}`} {...bot} />
        ))}

        <AddBotButton onClick={startBot} />

      </div>
    </main>
  );
}
