const fs = require('fs');
const VitterEncoder = require('../../models/VitterEncoder');
const enc = new VitterEncoder();
const s = 'A';
const bits = enc.encode(s);
const buf = enc.encodeToBuffer(s);
const obj = { input: s, bits: bits, bufBytes: Array.from(buf), bufHex: buf.toString('hex') };
fs.writeFileSync('tests/debug-output.json', JSON.stringify(obj, null, 2));
console.log('wrote tests/debug-output.json');

