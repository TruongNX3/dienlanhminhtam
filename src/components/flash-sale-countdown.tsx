'use client';

import React, { useState, useEffect } from 'react';

const FlashSaleCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          if (minutes > 0) {
            minutes--;
            seconds = 59;
          } else {
            if (hours > 0) {
              hours--;
              minutes = 59;
              seconds = 59;
            } else {
              // Reset to 3 hours if timer hits zero for demo purposes
              hours = 3;
              minutes = 0;
              seconds = 0;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 font-mono text-xl">
      <span className="bg-black/30 text-white px-3 py-1 rounded-lg tabular-nums shadow-inner border border-white/10">
        {formatNumber(timeLeft.hours)}
      </span>
      <span className="text-white font-bold animate-pulse">:</span>
      <span className="bg-black/30 text-white px-3 py-1 rounded-lg tabular-nums shadow-inner border border-white/10">
        {formatNumber(timeLeft.minutes)}
      </span>
      <span className="text-white font-bold animate-pulse">:</span>
      <span className="bg-black/30 text-white px-3 py-1 rounded-lg tabular-nums shadow-inner border border-white/10">
        {formatNumber(timeLeft.seconds)}
      </span>
    </div>
  );
};

export default FlashSaleCountdown;
