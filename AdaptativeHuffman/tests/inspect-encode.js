const VitterEncoder = require('../models/VitterEncoder');
const VitterDecoder = require('../models/VitterDecoder');

const enc = new VitterEncoder();
const dec = new VitterDecoder();
const s = 'A';
try{
  console.log('input:', JSON.stringify(s));
  const bits = enc.encode(s);
  console.log('bits raw:', bits);
  for(let i=0;i<bits.length;i+=8){
    const chunk = bits.slice(i,i+8);
    console.log('chunk', i/8, chunk, '->', parseInt(chunk,2));
  }
  const buf = enc.encodeToBuffer(s);
  console.log('buffer bytes:', Array.from(buf));
  console.log('buffer hex:', buf.toString('hex'));
  console.log('decoded from bits:', JSON.stringify(dec.decode(bits)));
  const dec2 = new VitterDecoder();
  console.log('decoded from buffer:', JSON.stringify(dec2.decodeFromBuffer(buf)));
}catch(e){console.error('ERR',e)}
process.exit(0);

