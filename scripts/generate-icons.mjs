// Generate PWA icons without external deps. Solid brand-colored square with a centered "P" glyph.
// Uses a tiny pure-Node PNG encoder.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
mkdirSync(publicDir, { recursive: true });

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// 7x7 bitmap for a stylized "P" — drawn at scale to keep it pixel-clean
const P_GLYPH = [
  '111110.',
  '1....1.',
  '1....1.',
  '111110.',
  '1......',
  '1......',
  '1......',
];

function makePng(size, bg, fg) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const glyphCols = P_GLYPH[0].length;
  const glyphRows = P_GLYPH.length;
  const cell = Math.floor((size * 0.55) / Math.max(glyphCols, glyphRows));
  const glyphW = cell * glyphCols;
  const glyphH = cell * glyphRows;
  const offX = Math.floor((size - glyphW) / 2);
  const offY = Math.floor((size - glyphH) / 2);

  function isFg(x, y) {
    if (x < offX || y < offY) return false;
    const gx = Math.floor((x - offX) / cell);
    const gy = Math.floor((y - offY) / cell);
    if (gy >= glyphRows || gx >= glyphCols) return false;
    return P_GLYPH[gy][gx] === '1';
  }

  const rowSize = size * 3 + 1;
  const raw = Buffer.alloc(rowSize * size);
  for (let y = 0; y < size; y++) {
    const off = y * rowSize;
    raw[off] = 0;
    for (let x = 0; x < size; x++) {
      const c = isFg(x, y) ? fg : bg;
      raw[off + 1 + x * 3] = c[0];
      raw[off + 2 + x * 3] = c[1];
      raw[off + 3 + x * 3] = c[2];
    }
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const bg = [37, 99, 235]; // brand-600
const fg = [255, 255, 255];
writeFileSync(resolve(publicDir, 'icon-192.png'), makePng(192, bg, fg));
writeFileSync(resolve(publicDir, 'icon-512.png'), makePng(512, bg, fg));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#2563eb"/>
  <text x="50" y="68" font-family="system-ui,sans-serif" font-size="60" font-weight="800" text-anchor="middle" fill="white">P</text>
</svg>
`;
writeFileSync(resolve(publicDir, 'favicon.svg'), svg);

console.log('Generated icon-192.png, icon-512.png, favicon.svg');
