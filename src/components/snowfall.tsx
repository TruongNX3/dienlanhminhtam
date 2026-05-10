'use client';

import React, { useEffect, useState } from 'react';

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);

  useEffect(() => {
    const count = 30;
    // Use a small timeout to avoid the synchronous setState warning in React 19
    const timer = setTimeout(() => {
      const items = Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${10 + Math.random() * 20}s`,
        size: `${0.5 + Math.random() * 1.5}rem`,
      }));
      setSnowflakes(items);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {snowflakes.map((s) => (
        <div
          key={s.id}
          className="snowflake"
          style={{
            left: s.left,
            animationDelay: s.delay,
            animationDuration: s.duration,
            fontSize: s.size,
            opacity: 0.4,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowfall;
