import { useState, useEffect } from 'react';

interface TimerProps {
  startTime: string;
  endTime?: string | null;
  isAlive: boolean;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  isSpinning?: boolean;
  totalSpinTime?: number;
}

export default function Timer({ startTime, endTime, isAlive, scheduledStart, scheduledEnd, isSpinning, totalSpinTime = 0 }: TimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isAlive) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isAlive]);

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    const days = Math.floor(diffSeconds / (24 * 60 * 60));
    const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffSeconds % (60 * 60)) / 60);
    const seconds = diffSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format
    });
  };

  const formatSpinTime = (milliseconds: number) => {
    const diffSeconds = Math.floor(milliseconds / 1000);
    
    const days = Math.floor(diffSeconds / (24 * 60 * 60));
    const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffSeconds % (60 * 60)) / 60);
    const seconds = diffSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getDurationColor = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (!isAlive) return 'text-red-400';
    if (diffHours < 1) return 'text-green-400';
    if (diffHours < 6) return 'text-blue-400';
    if (diffHours < 24) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const startDate = new Date(startTime);
  const endDate = endTime ? new Date(endTime) : currentTime;
  const uptime = formatDuration(startDate, endDate);
  const uptimeColor = getDurationColor(startDate, endDate);
  
  // Calculate actual spin time (including current session if spinning)
  let currentSpinTime = totalSpinTime;
  if (isSpinning && isAlive) {
    // Add a small estimate for current spin session to show live updates
    currentSpinTime += 1000; // Add 1 second for live feel
  }
  
  const spinTime = formatSpinTime(currentSpinTime);
  const spinTimeColor = currentSpinTime > 0 ? 'text-green-400' : 'text-gray-400';

  const getScheduleStatus = () => {
    const now = currentTime;
    
    if (scheduledStart && scheduledEnd) {
      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);
      
      if (now < start) {
        const timeToStart = formatDuration(now, start);
        return { icon: '•', text: `Starts in: ${timeToStart}`, color: 'text-yellow-400' };
      } else if (now >= start && now < end) {
        const timeToEnd = formatDuration(now, end);
        return { icon: '•', text: `Stops in: ${timeToEnd}`, color: 'text-green-400' };
      } else {
        return { icon: '•', text: 'Schedule completed', color: 'text-gray-400' };
      }
    } else if (scheduledStart && !scheduledEnd) {
      const start = new Date(scheduledStart);
      if (now < start) {
        const timeToStart = formatDuration(now, start);
        return { icon: '•', text: `Starts in: ${timeToStart}`, color: 'text-yellow-400' };
      } else {
        return { icon: '•', text: 'Running indefinitely', color: 'text-green-400' };
      }
    } else if (!scheduledStart && scheduledEnd) {
      const end = new Date(scheduledEnd);
      if (now < end) {
        const timeToEnd = formatDuration(now, end);
        return { icon: '•', text: `Stops in: ${timeToEnd}`, color: 'text-blue-400' };
      } else {
        return { icon: '•', text: 'Schedule completed', color: 'text-gray-400' };
      }
    } else {
      return { icon: '•', text: isSpinning ? 'Running' : 'Ready', color: isSpinning ? 'text-green-400' : 'text-gray-400' };
    }
  };

  const scheduleStatus = getScheduleStatus();

  return (
    <div className="text-xs space-y-1">
      {/* Bot Status */}
      <div className="flex items-center gap-1 text-gray-400">
        <span>•</span>
        <span>
          {isAlive ? 'Started:' : 'Ran:'} {formatTime(startTime)}
          {!isAlive && endTime && ` - ${formatTime(endTime)}`}
        </span>
      </div>
      
      {/* Schedule Status */}
      <div className="flex items-center gap-1">
        <span>{scheduleStatus.icon}</span>
        <span className={scheduleStatus.color}>
          {scheduleStatus.text}
        </span>
      </div>
      
      {/* Uptime */}
      <div className="flex items-center gap-1">
        <span>•</span>
        <span className={uptimeColor}>
          {isAlive ? 'Uptime:' : 'Total:'} {uptime}
        </span>
      </div>
      
      {/* Spin Time */}
      <div className="flex items-center gap-1">
        <span>•</span>
        <span className={spinTimeColor}>
          Spin time: {spinTime}
        </span>
      </div>
    </div>
  );
}