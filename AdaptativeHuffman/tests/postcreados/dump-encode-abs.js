const fs = require('fs');
const path = require('path');
const VitterEncoder = require('../../models/VitterEncoder');
const enc = new VitterEncoder();
const s = 'A';
const bits = enc.encode(s);
const buf = enc.encodeToBuffer(s);
const out = {
  cwd: process.cwd(),
  input: s,
  bits: bits,
  bufBytes: Array.from(buf),
  bufHex: buf.toString('hex')
};
const outPath = path.join(process.cwd(), 'tests', 'debug-output-abs.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.error('wrote', outPath);

