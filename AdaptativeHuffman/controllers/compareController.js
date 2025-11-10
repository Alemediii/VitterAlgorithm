const Huffman = require('../models/HuffmanEncoder');
const VitterEncoder = require('../models/VitterEncoder');
const Preprocessor = require('../models/Preprocessor');
const SourceAnalyzer = require('../models/SourceAnalyzer');
const logger = require('../utils/logger');

// POST /api/compare { source } or multipart file -> returns both algorithms' metrics and tree structures
async function compare(req, res) {
  try {
    let input = '';
    if (req && req.file && Buffer.isBuffer(req.file.buffer)) {
      const norm = Preprocessor.normalize(req.file.buffer);
      input = Preprocessor.stripControlChars(norm);
    } else if (req && req.body && typeof req.body.source === 'string') {
      input = String(req.body.source);
    } else {
      return res.status(400).json({ error: 'No input provided (file or body.source)' });
    }

    // Huffman (static) - operate on the string of characters
    const h = Huffman.buildFromString(input);
    const hEntropy = SourceAnalyzer.calculateEntropy(h.freqs);

    // Vitter - feed bytes of UTF-8
    const encoder = new VitterEncoder();
    const bufOut = encoder.encodeToBuffer(input);
    const vBitLength = bufOut.readUInt32BE(0);
    const vCompressedBytes = bufOut.length - 4;

    const vTree = encoder.tree.toJSON();
    const freqs = SourceAnalyzer.calculateFrequencies(input);
    const entropy = SourceAnalyzer.calculateEntropy(freqs);

    const response = {
      huffman: {
        tree: h.tree,
        codes: h.codes,
        compressedBits: h.compressedBitLength,
        compressedBytes: h.compressedBytes,
        entropy: hEntropy,
        originalBytes: Buffer.byteLength(input, 'utf8')
      },
      vitter: {
        tree: vTree,
        compressedBits: vBitLength,
        compressedBytes: vCompressedBytes,
        entropy: entropy,
        originalBytes: Buffer.byteLength(input, 'utf8')
      }
    };

    return res.json({ success: true, data: response });
  } catch (err) {
    logger.error('compareController.compare error: %s', err && err.stack ? err.stack : String(err));
    return res.status(500).json({ success: false, error: 'internal server error' });
  }
}

module.exports = { compare };

