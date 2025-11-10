const VitterTree = require('./VitterTree');

class BitWriter {
  constructor() {
    this.bytes = [];
    this.current = 0; // accumulator
    this.filled = 0; // bits in current (0..7)
    this.bitLength = 0;
  }

  writeBit(bit) {
    this.current = (this.current << 1) | (bit ? 1 : 0);
    this.filled++;
    this.bitLength++;
    if (this.filled === 8) {
      this.bytes.push(this.current & 0xFF);
      this.current = 0;
      this.filled = 0;
    }
  }

  writeBitsFromString(bitsStr) {
    for (let i = 0; i < bitsStr.length; i++) {
      const b = bitsStr[i] === '1' ? 1 : 0;
      this.writeBit(b);
    }
  }

  writeByteAsBits(byte) {
    const b = byte & 0xFF;
    for (let i = 7; i >= 0; i--) {
      this.writeBit((b >> i) & 1);
    }
  }

  finish() {
    if (this.filled > 0) {
      // pad remaining bits with zeros on the right (LSB side)
      const pad = 8 - this.filled;
      this.current = this.current << pad;
      this.bytes.push(this.current & 0xFF);
      this.current = 0;
      this.filled = 0;
    }
    return { bitLength: this.bitLength, payload: Buffer.from(this.bytes) };
  }
}

class VitterEncoder {
  constructor() {
    this.tree = new VitterTree();
  }

  // Encode an input (string or Buffer) into a bit-packed Buffer using adaptive Vitter algorithm.
  // For unseen bytes: output NYT code + 8-bit literal of byte, then update tree.
  // For seen bytes: output code for byte and update.
  encodeToBuffer(input) {
    let buf;
    if (Buffer.isBuffer(input)) buf = input;
    else if (typeof input === 'string') buf = Buffer.from(input, 'utf8');
    else throw new TypeError('input must be a string or Buffer');

    const writer = new BitWriter();

    for (const byte of buf) {
      const symbol = byte; // number 0..255
      const codeForSymbol = this.tree.getCodeForSymbol(symbol);
      // write code bits
      writer.writeBitsFromString(codeForSymbol);
      if (!this.tree.symbolMap.has(symbol)) {
        // write literal 8-bit
        writer.writeByteAsBits(symbol);
        this.tree.updateWithSymbol(symbol);
      } else {
        this.tree.updateWithSymbol(symbol);
      }
    }

    const { bitLength, payload } = writer.finish();
    const header = Buffer.alloc(4);
    header.writeUInt32BE(bitLength, 0);
    return Buffer.concat([header, payload]);
  }
}

module.exports = VitterEncoder;
