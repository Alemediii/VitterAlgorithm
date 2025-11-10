const assert = require('assert');
const VitterEncoder = require('../models/VitterEncoder');
const VitterDecoder = require('../models/VitterDecoder');

function run() {
  const enc = new VitterEncoder();
  const dec = new VitterDecoder();

  const samples = [
    '',
    'A',
    'ABABABAB',
    'Hello, World!',
    '😀 Unicode test'
  ];

  for (const s of samples) {
    const normalized = typeof s === 'string' ? s : String(s);
    const bits = enc.encode(normalized);

    console.log('--- sample:', JSON.stringify(s));
    console.log('bits len:', bits.length);

    const fromBits = dec.decode(bits);

    console.log('decoded from bits:', JSON.stringify(fromBits));

    assert.strictEqual(fromBits, normalized, `decoded from bits mismatch for "${s}"`);
  }

  console.log('vitter-test: PASS');
}

try { run(); } catch (e) { console.error('vitter-test: FAIL', e); process.exit(1); }
