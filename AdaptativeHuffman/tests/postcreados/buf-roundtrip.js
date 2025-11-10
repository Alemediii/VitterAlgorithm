const assert = require('assert');
const VitterEncoder = require('../../models/VitterEncoder');
const VitterDecoder = require('../../models/VitterDecoder');

function run() {
  const enc = new VitterEncoder();
  const dec = new VitterDecoder();
  const samples = ['A', 'ABAB', 'Hello, World!', '😀 Unicode test'];
  for (const s of samples) {
    const buf = enc.encodeToBuffer(s);
    const out = dec.decodeFromBuffer(buf);
    console.log('sample:', JSON.stringify(s), 'bufHex:', buf.toString('hex'), 'decoded:', JSON.stringify(out));
    assert.strictEqual(out, s);
  }
  console.log('buf-roundtrip: PASS');
}

try { run(); } catch (e) { console.error('buf-roundtrip: FAIL', e); process.exit(1); }

