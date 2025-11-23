export function diagLog(level: 'info' | 'warn' | 'error' | 'user_action' | 'navigation' | 'api', message: string, source = 'App', details?: any) {
  if (typeof window === 'undefined') return;
  try {
    const detail = { level, message, source, details };
    window.dispatchEvent(new CustomEvent('GEMODIDA:diag', { detail }));
  } catch (e) {
    // fail silently
     
    console.log('diagLog error', e);
  }
}
