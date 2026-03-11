// Generate simple placeholder PNG icons
import fs from "fs";
import path from "path";

// Minimal 1x1 white PNG as placeholder (real icons should be designed later)
// This creates valid PNG files at 16x16, 48x48, 128x128
function createMinimalPNG(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let c = 0xffffffff;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let cc = n;
      for (let k = 0; k < 8; k++)
        cc = cc & 1 ? 0xedb88320 ^ (cc >>> 1) : cc >>> 1;
      table[n] = cc;
    }
    for (let i = 0; i < buf.length; i++)
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeData));
    return Buffer.concat([len, typeData, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // IDAT - uncompressed raw data with zlib wrapper
  const rawRow = Buffer.alloc(1 + size * 3); // filter byte + RGB per pixel
  rawRow[0] = 0; // no filter
  // Fill with a nice blue-purple gradient color
  for (let x = 0; x < size; x++) {
    const t = x / size;
    rawRow[1 + x * 3] = Math.round(74 + t * 63); // R: 74-137
    rawRow[1 + x * 3 + 1] = Math.round(105 + t * 50); // G: 105-155
    rawRow[1 + x * 3 + 2] = Math.round(189 + t * 40); // B: 189-229
  }

  // Build uncompressed deflate blocks
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.from(rawRow);
    const ty = y / size;
    for (let x = 0; x < size; x++) {
      const tx = x / size;
      const cx = Math.abs(tx - 0.5) * 2;
      const cy = Math.abs(ty - 0.5) * 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      if (dist < 0.6) {
        // Inner area - lighter (camera/image icon suggestion)
        row[1 + x * 3] = Math.min(255, Math.round(120 + (1 - dist) * 100));
        row[1 + x * 3 + 1] = Math.min(255, Math.round(160 + (1 - dist) * 80));
        row[1 + x * 3 + 2] = Math.min(255, Math.round(220 + (1 - dist) * 35));
      }
    }
    rows.push(row);
  }
  const rawData = Buffer.concat(rows);

  // Simple zlib wrapper (stored/uncompressed)
  const zlibData = [];
  zlibData.push(Buffer.from([0x78, 0x01])); // zlib header

  // Split into 65535-byte blocks
  let offset = 0;
  while (offset < rawData.length) {
    const remaining = rawData.length - offset;
    const blockSize = Math.min(65535, remaining);
    const isLast = offset + blockSize >= rawData.length;
    const header = Buffer.alloc(5);
    header[0] = isLast ? 1 : 0;
    header.writeUInt16LE(blockSize, 1);
    header.writeUInt16LE(blockSize ^ 0xffff, 3);
    zlibData.push(header);
    zlibData.push(rawData.subarray(offset, offset + blockSize));
    offset += blockSize;
  }

  // Adler32
  let a = 1,
    b = 0;
  for (let i = 0; i < rawData.length; i++) {
    a = (a + rawData[i]) % 65521;
    b = (b + a) % 65521;
  }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(((b << 16) | a) >>> 0);
  zlibData.push(adler);

  const idatData = Buffer.concat(zlibData);

  // IEND
  const iend = chunk("IEND", Buffer.alloc(0));

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    iend,
  ]);
}

const iconsDir = "icons";
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = createMinimalPNG(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Created icon${size}.png (${png.length} bytes)`);
}
