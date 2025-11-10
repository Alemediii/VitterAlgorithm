const { expect } = require('chai');
const VitterEncoder = require('../../models/VitterEncoder');
const VitterDecoder = require('../../models/VitterDecoder');

describe('Vitter encoder/decoder roundtrip', () => {
  it('roundtrips a short ASCII string', () => {
    const src = 'ABRACADABRA';
    const enc = new VitterEncoder();
    const dec = new VitterDecoder();

    const buf = enc.encodeToBuffer(src);
    const out = dec.decodeFromBuffer(buf);
    expect(out).to.equal(src);
  });

  it('roundtrips empty string', () => {
    const src = '';
    const enc = new VitterEncoder();
    const dec = new VitterDecoder();

    const buf = enc.encodeToBuffer(src);
    const out = dec.decodeFromBuffer(buf);
    expect(out).to.equal(src);
  });
});

