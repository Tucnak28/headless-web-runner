import { useLayoutEffect, useRef } from 'react';

interface ConsoleLogProps {
  lines: string[];
}

export default function FancyConsoleLog({ lines }: ConsoleLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isAtTop = el.scrollTop < 5;

    const heightDiff = el.scrollHeight - (prevHeightRef.current ?? 0);

    if (isAtTop) {

      el.scrollTop = 0;
    } else {

      el.scrollTop += heightDiff;
    }

    prevHeightRef.current = el.scrollHeight;
  }, [lines]);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h4 className="text-sm font-medium text-gray-300">Activity Log</h4>
      </div>
      
      <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
        <div
          ref={containerRef}
          className="h-48 overflow-y-auto px-4 py-3 space-y-2 font-mono text-sm"
        >
          {lines.length === 0 ? (
            <div className="text-gray-500 italic flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              [No logs yet]
            </div>
          ) : (
            [...lines].reverse().map((line, idx) => {
              const match = line.match(/^\[(.*?)\]\s(.*)$/);
              const timestamp = match?.[1] ?? '';
              const message = match?.[2] ?? line;
              
              // Determine log type based on content
              const isError = message.includes('❌') || message.includes('Failed') || message.includes('Error');
              const isSuccess = message.includes('✅') || message.includes('success') || message.includes('started');
              const isWarning = message.includes('⚠️') || message.includes('warning') || message.includes('Warning');
              const isDead = message.includes('💀') || message.includes('terminated') || message.includes('DEAD');

              return (
                <div
                  key={idx}
                  className={`rounded-md px-3 py-2 border-l-2 transition-all duration-200 ${
                    isDead 
                      ? 'bg-red-500/10 border-red-500 text-red-300' 
                      : isError 
                      ? 'bg-red-500/10 border-red-500 text-red-300'
                      : isSuccess 
                      ? 'bg-green-500/10 border-green-500 text-green-300'
                      : isWarning 
                      ? 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
                      : 'bg-white/5 border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {timestamp && (
                      <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
                        {timestamp}
                      </span>
                    )}
                    <span className="flex-1 leading-relaxed">{message}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
