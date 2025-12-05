#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const src = path.join(__dirname, '..', 'public', 'imgs', 'Logo_DIDA.png');
const outDir = path.join(__dirname, '..', 'public', 'icons');

const sizes = [16, 32, 48, 64, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512];

// Splash images (width x height) commonly used for iOS and Android startup screens
const splashSizes = [
  [640, 1136],
  [750, 1334],
  [828, 1792],
  [1125, 2436],
  [1242, 2208],
  [1242, 2688],
  [1536, 2048],
  [1668, 2224],
  [2048, 2732]
];

if (!fs.existsSync(src)) {
  console.error('Source logo was not found at', src);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function makeAll() {
  try {
    await Promise.all(sizes.map(async (s) => {
      const out = path.join(outDir, `icon-${s}x${s}.png`);
      await sharp(src).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(out);
      console.log('Generated', out);
    }));

    // create canonical 192 and 512 copies
    await sharp(src).resize(192, 192).png().toFile(path.join(outDir, 'icon-192x192.png'));
    await sharp(src).resize(512, 512).png().toFile(path.join(outDir, 'icon-512x512.png'));

    // create or update browserconfig.xml
    const browserConfig = `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="/icons/icon-192x192.png"/>\n      <TileColor>#000000</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>`;
    fs.writeFileSync(path.join(outDir, 'browserconfig.xml'), browserConfig);
    console.log('Created browserconfig.xml');

    // generate startup splash screens
    for (const [w, h] of splashSizes) {
      const splashOut = path.join(outDir, `splash-${w}x${h}.png`);
      await sharp(src).resize(w, h, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(splashOut);
      console.log('Generated splash', splashOut);
    }

    // ensure we have 64 and 256 px canonical icons
    await sharp(src).resize(64, 64).png().toFile(path.join(outDir, 'icon-64x64.png'));
    await sharp(src).resize(256, 256).png().toFile(path.join(outDir, 'icon-256x256.png'));

    // create a true multi-resolution ICO file
    await createIco([16, 32, 48, 64, 128, 256]);

    console.log('All icons generated in', outDir);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

makeAll();

async function createIco(sizesForIco) {
  const outIco = path.join(__dirname, '..', 'public', 'favicon.ico');
  const entries = [];

  for (const s of sizesForIco) {
    const p = path.join(outDir, `icon-${s}x${s}.png`);
    if (!fs.existsSync(p)) {
      console.warn('Missing png for ico size', s, 'expected at', p);
      continue;
    }
    const buf = fs.readFileSync(p);
    entries.push({ size: s, buf });
  }

  if (entries.length === 0) throw new Error('No images to pack into ICO');

  // ICO header: reserved (2 bytes), type (2 bytes, 1 for ico), count (2 bytes)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dirEntries = [];
  let offset = 6 + 16 * entries.length;

  for (const e of entries) {
    const sizeByte = e.size >= 256 ? 0 : e.size; // 0 used for 256
    const dir = Buffer.alloc(16);
    dir.writeUInt8(sizeByte, 0); // width
    dir.writeUInt8(sizeByte, 1); // height
    dir.writeUInt8(0, 2); // color count
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // planes
    dir.writeUInt16LE(32, 6); // bit count
    dir.writeUInt32LE(e.buf.length, 8); // size
    dir.writeUInt32LE(offset, 12); // offset
    dirEntries.push(dir);
    offset += e.buf.length;
  }

  const parts = [header, ...dirEntries, ...entries.map(x => x.buf)];
  fs.writeFileSync(outIco, Buffer.concat(parts));
  console.log('Wrote multi-resolution ICO at', outIco);
}
