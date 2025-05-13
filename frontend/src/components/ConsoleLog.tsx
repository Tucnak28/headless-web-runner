import { useLayoutEffect, useRef } from 'react';

interface ConsoleLogProps {
  lines: string[];
}

export default function FancyConsoleLog({ lines }: ConsoleLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHeightRef = useRef<number>(0);   // remember previous scrollHeight

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Are we already looking at the newest logs (≈ top 5 px)?
    const isAtTop = el.scrollTop < 5;

    // How much taller did the content become?
    const heightDiff = el.scrollHeight - (prevHeightRef.current ?? 0);

    if (isAtTop) {
      // User is at the top → keep showing newest logs.
      el.scrollTop = 0;
    } else {
      // User is reading older logs → shift viewport down by the growth amount.
      el.scrollTop += heightDiff;
    }

    // Update for next render
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
