// Tipos para next-themes
declare module 'next-themes' {
  export interface ThemeProviderProps {
    children: React.ReactNode;
    /** Disable all CSS transitions when switching themes */
    disableTransitionOnChange?: boolean;
    /** Whether to indicate to browsers which color scheme is used (dark or light) for built-in UI like inputs and buttons */
    enableColorScheme?: boolean;
    /** Whether to switch between dark and light themes based on prefers-color-scheme */
    enableSystem?: boolean;
    /** Whether to use the light/dark mode (for media query) */
    forcedTheme?: string;
    /** Nonce string to pass to the inline script for CSP headers */
    nonce?: string;
    /** Storage key used to store theme setting */
    storageKey?: string;
    /** Default theme */
    defaultTheme?: string;
    /** HTML attribute modified based on the active theme. Accepts `class` or `data-*` (meaning any data attribute, `data-mode`, `data-color`, etc.) */
    attribute?: string | 'class';
    /** Mapping of theme name to HTML attribute value. Object where key is the theme name and value is the attribute value */
    value?: { [themeName: string]: string };
    /** List of theme names */
    themes?: string[];
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    themes: string[];
  };
}
