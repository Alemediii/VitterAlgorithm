const VitterEncoder=require('../models/VitterEncoder');
const VitterDecoder=require('../models/VitterDecoder');
const enc=new VitterEncoder();
const dec=new VitterDecoder();
const s='abcd';
const bits=enc.encode(s);
console.log('bits length', bits.length);
console.log('bits:', bits);
const out=dec.decode(bits);
console.log('decoded:', out);
console.log('decoded equals input?', out === s);
console.log('Tree after encode:', JSON.stringify(enc.tree.toJSON(), null, 2));

