'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

/**
 * Theme Provider Wrapper
 * - Uses next-themes for theme management
 * - Applies 'dark' class on <html> element
 * - Persists user preference to localStorage
 * - Default theme: dark (matching landing page aesthetic)
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
      storageKey="esg-portal-theme"
    >
      {children}
    </NextThemesProvider>
  )
}
