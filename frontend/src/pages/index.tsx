'use client';
import { useState, useEffect } from 'react';
import BotCard from '@/components/BotCard';
import LoadingBotCard from '@/components/LoadingBotCard';
import AddBotButton from '@/components/AddBotButton';

type BotInfo = {
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
};

export default function Home() {
  const [bots, setBots] = useState<BotInfo[]>([]);
  const [loadingBots, setLoadingBots] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const startBot = async () => {
    // Generate temporary ID for loading card
    const tempId = `loading-${Date.now()}`;
    setLoadingBots(prev => [...prev, tempId]);

    try {
      const res = await fetch(`http://localhost:3001/api/startNewBot`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Failed to start bot: ${errText}`);
        // Remove loading card on error
        setLoadingBots(prev => prev.filter(id => id !== tempId));
      }
    } catch (err) {
      console.error('Error starting bot:', err);
      // Remove loading card on error
      setLoadingBots(prev => prev.filter(id => id !== tempId));
    }
  };

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      setConnectionStatus('connected');
    };

    socket.onclose = () => {
      setConnectionStatus('disconnected');
    };

    socket.onerror = () => {
      setConnectionStatus('disconnected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'botList') {
        setBots(data.bots);
        // Clear all loading bots when real bot data arrives
        setLoadingBots([]);
      }
    };

    return () => socket.close();
  }, []);

  const activeBots = bots.filter(bot => bot.id).length;
  const totalBots = activeBots + loadingBots.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Professional Header */}
      <header className="glass-card mx-4 mt-4 mb-8 p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Headless Web Runner
            </h1>
            <p className="text-gray-400 mt-1">Professional Bot Management Dashboard</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-sm text-gray-300 capitalize">{connectionStatus}</span>
            </div>
            
            {/* Bot Statistics */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{activeBots}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{totalBots}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 pb-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 place-items-start p-6">
          {/* Existing Bots */}
          {bots.map((bot, index) => (
            <div key={`${bot.id}-${bot.username}-${bot.delay}-${bot.platform}`} 
                 className="animate-fade-in w-full max-w-2xl"
                 style={{ animationDelay: `${index * 0.1}s` }}>
              <BotCard {...bot} />
            </div>
          ))}
          
          {/* Loading Bots */}
          {loadingBots.map((loadingId, index) => (
            <div key={loadingId} 
                 className="animate-fade-in w-full max-w-2xl"
                 style={{ animationDelay: `${(bots.length + index) * 0.1}s` }}>
              <LoadingBotCard id={loadingId} />
            </div>
          ))}

          {/* Add Bot Button - only show if there are existing bots or loading bots */}
          {(bots.length > 0 || loadingBots.length > 0) && (
            <div className="animate-fade-in w-full max-w-md"
                 style={{ animationDelay: `${(bots.length + loadingBots.length) * 0.1}s` }}>
              <AddBotButton onClick={startBot} />
            </div>
          )}
        </div>

        {/* Empty State - Show as first grid item */}
        {bots.length === 0 && loadingBots.length === 0 && (
          <>
            <div className="animate-fade-in w-full max-w-md">
              <AddBotButton onClick={startBot} />
            </div>
            <div className="col-span-full flex justify-center py-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-400 mb-2">No other bots running</h2>
                <p className="text-gray-500">Create your first bot above to get started</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
