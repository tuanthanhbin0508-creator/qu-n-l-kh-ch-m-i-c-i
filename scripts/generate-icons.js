import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  buf.writeUInt32BE(crc32(crcBuf), 8 + len);
  return buf;
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines: width * 4 + 1 filter byte per line
  const rawBytes = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.44;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter: None
    const dy = y - cy;
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rose red gradient background (#E11D48 to #881337)
      const gradRatio = (x + y) / (width + height);
      let red = Math.round(225 - 89 * gradRatio);
      let green = Math.round(29 - 10 * gradRatio);
      let blue = Math.round(72 - 17 * gradRatio);
      let alpha = 255;

      // Rounded rect / circle border for non-maskable
      if (!isMaskable) {
        // Rounded corners
        const cornerR = width * 0.22;
        const inCornerX = Math.abs(dx) > (cx - cornerR);
        const inCornerY = Math.abs(dy) > (cy - cornerR);
        if (inCornerX && inCornerY) {
          const cornerDist = Math.sqrt(
            Math.pow(Math.abs(dx) - (cx - cornerR), 2) +
            Math.pow(Math.abs(dy) - (cy - cornerR), 2)
          );
          if (cornerDist > cornerR) {
            alpha = 0; // Outside rounded corner
          }
        }
      }

      // Draw stylized wedding book & rings emblem in center
      if (alpha > 0) {
        // Book page area
        const bx = Math.abs(dx);
        const by = dy + height * 0.05;
        if (bx < width * 0.32 && Math.abs(by) < height * 0.26) {
          // Inner page white
          red = 255;
          green = 245;
          blue = 247;

          // Book spine line
          if (bx < width * 0.015) {
            red = 226; green = 232; blue = 240;
          }

          // Gold rings
          const r1 = Math.sqrt(Math.pow(dx + width * 0.08, 2) + Math.pow(dy - height * 0.06, 2));
          const r2 = Math.sqrt(Math.pow(dx - width * 0.04, 2) + Math.pow(dy - height * 0.06, 2));
          const ringRad = width * 0.09;
          const ringThick = width * 0.022;

          if ((r1 >= ringRad - ringThick && r1 <= ringRad) || (r2 >= ringRad - ringThick && r2 <= ringRad)) {
            // Gold color
            red = 234; green = 179; blue = 8;
          }

          // Heart at top of book
          const hx = dx / (width * 0.12);
          const hy = (dy + height * 0.14) / (width * 0.12);
          if (Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * hy * hy * hy <= 0) {
            red = 225; green = 29; blue = 72; // Rose red heart
          }
        }
      }

      rawBytes[offset++] = red;
      rawBytes[offset++] = green;
      rawBytes[offset++] = blue;
      rawBytes[offset++] = alpha;
    }
  }

  const compressedData = zlib.deflateSync(rawBytes, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('Successfully generated all PWA PNG icons in public/ directory!');
