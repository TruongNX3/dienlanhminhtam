'use client';

import * as React from 'react';

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simplified provider that just renders children for now, 
  // avoiding script injection from next-themes in React 19
  return <>{children}</>;
}
