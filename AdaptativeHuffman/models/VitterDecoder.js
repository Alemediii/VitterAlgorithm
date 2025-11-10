const VitterTree = require('./VitterTree');

class VitterDecoder {
  constructor() {
    this.tree = new VitterTree();
  }

  // Read n bits from string starting at pos, return {bits, nextPos}
  readBits(bitsStr, pos, n) {
    return {
      bits: bitsStr.slice(pos, pos + n),
      nextPos: pos + n
    };
  }

  // Convert 8-bit string to byte (0..255)
  bitsToByte(bits) {
    return parseInt(bits, 2) & 0xFF;
  }

  // Decode a bit string produced by our encoder; return byte array as Buffer
  decodeToBuffer(bitsStr) {
    if (typeof bitsStr !== 'string') throw new TypeError('bitsStr must be a string');
    let pos = 0;
    const bytes = [];
    while (pos < bitsStr.length) {
      // traverse tree from root until leaf
      let cur = this.tree.root;
      while (!cur.isLeaf() && pos < bitsStr.length) {
        const bit = bitsStr[pos++];
        cur = bit === '0' ? cur.left : cur.right;
        if (!cur) throw new Error('Decode error: traversed to null');
      }

      if (!cur) break;

      if (cur.isNYT()) {
        // need to read next 8 bits for new symbol
        if (pos + 8 > bitsStr.length) break; // truncated
        const res = this.readBits(bitsStr, pos, 8);
        pos = res.nextPos;
        const byte = this.bitsToByte(res.bits);
        bytes.push(byte);
        this.tree.updateWithSymbol(byte);
      } else {
        // leaf with symbol (symbol is stored as number 0..255)
        bytes.push(cur.symbol);
        this.tree.updateWithSymbol(cur.symbol);
      }
    }
    return Buffer.from(bytes);
  }

  // Decode a bit string produced by our encoder; return UTF-8 string
  decode(bitsStr) {
    const buf = this.decodeToBuffer(bitsStr);
    return buf.toString('utf8');
  }

  // Decode from Buffer where the first 4 bytes are a big-endian uint32 bitLength,
  // followed by packed bytes (MSB-first). Only the first `bitLength` bits are valid.
  decodeFromBuffer(buf) {
    if (!Buffer.isBuffer(buf) || buf.length < 4) return '';
    const bitLen = buf.readUInt32BE(0);
    let bits = '';
    for (let idx = 4; idx < buf.length; idx++) {
      const b = buf[idx];
      for (let i = 7; i >= 0; i--) {
        if (bits.length >= bitLen) break;
        bits += ((b >> i) & 1) ? '1' : '0';
      }
    }
    return this.decode(bits);
  }
}

module.exports = VitterDecoder;
