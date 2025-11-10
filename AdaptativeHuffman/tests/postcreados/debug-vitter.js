const VitterEncoder = require('../../models/VitterEncoder');
const VitterDecoder = require('../../models/VitterDecoder');

const enc = new VitterEncoder();
const dec = new VitterDecoder();
const s = 'A';
console.log('input:', JSON.stringify(s));
const bits = enc.encode(s);
console.log('bits:', bits);
const buf = enc.encodeToBuffer(s);
console.log('buffer bytes:', Array.from(buf));
console.log('buffer hex:', buf.toString('hex'));
console.log('decoded from bits:', JSON.stringify(dec.decode(bits)));
const dec2 = new VitterDecoder();
console.log('decoded from buffer:', JSON.stringify(dec2.decodeFromBuffer(buf)));

