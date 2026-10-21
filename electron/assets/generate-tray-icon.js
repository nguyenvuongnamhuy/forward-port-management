// Generates the macOS menu bar (tray) template icons:
//   tray-icon-Template.png (16x16) and tray-icon-Template@2x.png (32x32)
// Run: node generate-tray-icon.js
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// 16x16 bitmap of two opposing arrows (forward/back port), '#' = filled
const GLYPH = [
  "................",
  "................",
  "...##...........",
  "..############..",
  ".##############.",
  "..############..",
  "...##...........",
  "................",
  "................",
  "...........##...",
  "..############..",
  "..#############.",
  "..############..",
  "...........##...",
  "................",
  "................",
];

// Minimal PNG writer: RGBA, 8-bit, no interlace
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function writePng(pixels, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter: none
    pixels.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function render(scale) {
  const size = 16 * scale;
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (GLYPH[Math.floor(y / scale)][Math.floor(x / scale)] === "#") {
        const i = (y * size + x) * 4;
        pixels[i] = 0; // R — black; macOS tints template images
        pixels[i + 1] = 0; // G
        pixels[i + 2] = 0; // B
        pixels[i + 3] = 255; // A
      }
    }
  }
  return writePng(pixels, size);
}

const dir = __dirname;
fs.writeFileSync(path.join(dir, "tray-icon-Template.png"), render(1));
fs.writeFileSync(path.join(dir, "tray-icon-Template@2x.png"), render(2));
console.log("Tray icons written to", dir);
