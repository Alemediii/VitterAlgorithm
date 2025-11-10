const VitterEncoder = require('../models/VitterEncoder');
const VitterDecoder = require('../models/VitterDecoder');
const Preprocessor = require('../models/Preprocessor');
const SourceAnalyzer = require('../models/SourceAnalyzer');
const logger = require('../utils/logger');

// Compress handler: accepts req.body.data (string) or req.file.buffer (Buffer)
async function compress(req, res) {
  try {
    // Input extraction
    let inputBuf = null;
    if (req && req.file && Buffer.isBuffer(req.file.buffer)) inputBuf = req.file.buffer;
    else if (req && req.body && typeof req.body.data === 'string') inputBuf = Buffer.from(req.body.data, 'utf8');
    else {
      if (res && res.status) return res.status(400).json({ error: 'No input provided' });
      throw new Error('No input provided');
    }

    logger.debug('compress: received %d bytes', inputBuf.length);

    // Preprocess (normalize)
    const text = Preprocessor.normalize(inputBuf);
    const cleaned = Preprocessor.stripControlChars(text);

    // Analyze source
    const freqs = SourceAnalyzer.calculateFrequencies(cleaned);
    const entropy = SourceAnalyzer.calculateEntropy(freqs);

    // Encode
    const encoder = new VitterEncoder();
    const bufferOut = encoder.encodeToBuffer(cleaned);
    const bitLength = bufferOut.readUInt32BE(0);
    const compressedBytes = bufferOut.length - 4; // exclude header

    // Prepare codes map (symbol -> code)
    const codes = {};
    try {
      for (const sym of encoder.tree.symbolMap.keys()) {
        const code = encoder.tree.getCodeForSymbol(sym);
        codes[String(sym)] = code;
      }
    } catch (e) {
      logger.debug('compress: could not build codes map - %s', e.message);
    }

    const payloadBase64 = bufferOut.toString('base64');

    const response = {
      compressedBase64: payloadBase64,
      metrics: {
        originalBytes: Buffer.byteLength(cleaned, 'utf8'),
        compressedBytes: compressedBytes,
        bitLength: bitLength,
        compressionRatio: compressedBytes > 0 ? (Buffer.byteLength(cleaned, 'utf8') / compressedBytes) : null,
        entropyBitsPerSymbol: entropy
      },
      tree: encoder.tree.toJSON(),
      codes: codes
    };

    logger.info('compress: finished compression (orig=%d bytes, comp=%d bytes)', response.metrics.originalBytes, compressedBytes);
    if (res && res.json) return res.json(response);
    return response;
  } catch (err) {
    logger.error('compress: error - %s', err && err.message);
    if (res && res.status) return res.status(500).json({ error: err.message });
    throw err;
  }
}

// Decompress handler: accepts req.body.compressedBase64 (string) or req.file.buffer
async function decompress(req, res) {
  try {
    let inBuf = null;
    if (req && req.file && Buffer.isBuffer(req.file.buffer)) inBuf = req.file.buffer;
    else if (req && req.body && typeof req.body.compressedBase64 === 'string') inBuf = Buffer.from(req.body.compressedBase64, 'base64');
    else {
      if (res && res.status) return res.status(400).json({ error: 'No compressed input provided' });
      throw new Error('No compressed input provided');
    }

    logger.debug('decompress: received buffer %d bytes', inBuf.length);

    const decoder = new VitterDecoder();
    const output = decoder.decodeFromBuffer(inBuf);

    logger.info('decompress: produced %d chars', output.length);
    if (res && res.json) return res.json({ data: output });
    return output;
  } catch (err) {
    logger.error('decompress: error - %s', err && err.message);
    if (res && res.status) return res.status(500).json({ error: err.message });
    throw err;
  }
}

// New: compress uploaded file and return binary attachment (originalname + .vitt)
async function compressFile(req, res) {
  try {
    if (!req || !req.file || !Buffer.isBuffer(req.file.buffer)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputBuf = req.file.buffer;
    const originalName = req.file.originalname || 'input.txt';

    logger.debug('compressFile: received file %s (%d bytes)', originalName, inputBuf.length);
    console.log('compressFile: input hex prefix=', inputBuf.slice(0,12).toString('hex'));

    // For file uploads, preserve raw bytes: do not normalize to UTF-8 nor strip control chars.
    // The encoder accepts a Buffer input and will encode raw bytes so roundtrip preserves original encoding.
    const encoder = new VitterEncoder();
    const bufferOut = encoder.encodeToBuffer(inputBuf); // Buffer containing header + compressed

    // Build filename to return: original + .vitt
    const outName = `${originalName}.vitt`;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    return res.send(bufferOut);
  } catch (err) {
    logger.error('compressFile: error - %s', err && err.message);
    return res.status(500).json({ error: err.message });
  }
}

// New: decompress uploaded compressed file and return original file as attachment
async function decompressFile(req, res) {
  try {
    if (!req || !req.file || !Buffer.isBuffer(req.file.buffer)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inBuf = req.file.buffer;
    const uploadedName = req.file.originalname || 'compressed.vitt';

    logger.debug('decompressFile: received file %s (%d bytes)', uploadedName, inBuf.length);

    const decoder = new VitterDecoder();
    // Use decodeToBuffer to obtain raw bytes and preserve original encoding (e.g., UTF-16LE)
    const bitLen = inBuf.readUInt32BE(0);
    // decodeFromBuffer internally already extracts bit string and uses decodeToBuffer->decode
    // but we'll reuse decodeFromBuffer's logic through decoding to Buffer by calling decodeFromBuffer then re-encoding would lose original bytes.
    // To avoid duplicating bit extraction logic, call decodeFromBuffer and if it returns a string, but we want raw bytes, use decoder.decodeToBuffer on extracted bits.
    // Simpler: replicate the buffer->bits extraction here and call decodeToBuffer.
    let bits = '';
    for (let idx = 4; idx < inBuf.length; idx++) {
      const b = inBuf[idx];
      for (let i = 7; i >= 0; i--) {
        if (bits.length >= bitLen) break;
        bits += ((b >> i) & 1) ? '1' : '0';
      }
    }
    const outBuf = decoder.decodeToBuffer(bits);

    // Ensure visible logging for debug during tests
    console.log('decompressFile: decoded', outBuf.length, 'bytes, hex prefix=', outBuf.slice(0,12).toString('hex'));
    logger.debug('decompressFile: decoded %d bytes, hex prefix=%s', outBuf.length, outBuf.slice(0,8).toString('hex'));

    // Attempt to restore original filename by removing .vitt suffix; otherwise append .decompressed
    let outName = uploadedName;
    if (outName.toLowerCase().endsWith('.vitt')) {
      outName = outName.slice(0, -5);
    } else if (outName.toLowerCase().endsWith('.enc')) {
      outName = outName.slice(0, -4);
    } else {
      outName = outName + '.decompressed';
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    return res.send(outBuf);
  } catch (err) {
    logger.error('decompressFile: error - %s', err && err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { compress, decompress, compressFile, decompressFile };
