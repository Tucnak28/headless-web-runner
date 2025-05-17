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
    <div className="text-sm text-white rounded-lg overflow-hidden border border-zinc-700 shadow-md">
      <div
        ref={containerRef}
        className="h-52 overflow-y-auto px-4 py-2 space-y-1"
      >
        {lines.length === 0 ? (
          <div className="text-zinc-500 italic">[No logs yet]</div>
        ) : (
          [...lines].reverse().map((line, idx) => {
            const match = line.match(/^\[(.*?)\]\s(.*)$/);
            const timestamp = match?.[1] ?? '';
            const message   = match?.[2] ?? line;

            return (
              <div
                key={idx}
                className="rounded px-3 py-1 flex items-center gap-2 shadow-sm"
              >
                <span className="text-xs text-zinc-800 whitespace-nowrap">
                  {timestamp}
                </span>
                <span className="text-zinc-800">{message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
