import { useState, useEffect, useCallback } from "react";

interface UseCountdownProps {
  initialTime: number; // in seconds
  onComplete?: () => void;
}

interface UseCountdownReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
  formatTime: (seconds: number) => string;
}

export const useCountdown = ({
  initialTime,
  onComplete,
}: UseCountdownProps): UseCountdownReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(
    (newTime?: number) => {
      setIsRunning(false);
      setTimeLeft(newTime ?? initialTime);
    },
    [initialTime]
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  return {
    timeLeft,
    isRunning,
    start,
    stop,
    reset,
    formatTime,
  };
};
