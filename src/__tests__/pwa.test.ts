import { describe, it, expect } from 'vitest';

describe('PWA Configuration', () => {
  it('Debe tener un manifest.json válido', async () => {
    const manifest = require('../../public/manifest.json');
    expect(manifest.name).toBe('GEMODIDA');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons).toHaveLength(2);
  });

  it('Debe tener un service worker funcional', async () => {
    const sw = require('../../public/sw.js');
    expect(sw).toBeDefined();
  });
});