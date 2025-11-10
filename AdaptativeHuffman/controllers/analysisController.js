const SourceAnalyzer = require('../models/SourceAnalyzer');
const Preprocessor = require('../models/Preprocessor');
const logger = require('../utils/logger');

// analyzeEntropy: accepts req.body.data (string) or req.file.buffer
async function analyzeEntropy(req, res) {
  try {
    let text = null;
    if (req && req.file && Buffer.isBuffer(req.file.buffer)) text = Preprocessor.normalize(req.file.buffer);
    else if (req && req.body && typeof req.body.data === 'string') text = req.body.data;
    else return res.status ? res.status(400).json({ error: 'No input provided' }) : null;

    logger.debug('analyzeEntropy: input length %d', text.length);

    const cleaned = Preprocessor.stripControlChars(text);
    const freqs = SourceAnalyzer.calculateFrequencies(cleaned);
    const entropy = SourceAnalyzer.calculateEntropy(freqs);
    const codesSuggestion = null; // placeholder, could integrate static Huffman calculator

    // Include the cleaned (processed) text and its length so the guide can present server-side preprocessing/results
    const response = {
      entropyBitsPerSymbol: entropy,
      frequencies: freqs,
      suggestedCodes: codesSuggestion,
      processedText: cleaned,
      processedLength: cleaned.length
    };
    if (res && res.json) return res.json(response);
    return response;
  } catch (err) {
    logger.error('analyzeEntropy: error - %s', err && err.message);
    if (res && res.status) return res.status(500).json({ error: err.message });
    throw err;
  }
}

// generateSource: generate uniform or skewed source
async function generateSource(req, res) {
  try {
    const type = (req && req.body && req.body.type) || 'uniform';
    const length = (req && Number(req.body && req.body.length)) || 1024;

    if (!Number.isInteger(length) || length < 0) {
      if (res && res.status) return res.status(400).json({ error: 'length must be a non-negative integer' });
      throw new TypeError('length must be a non-negative integer');
    }

    let generated = '';
    if (type === 'uniform') {
      const alphabetSize = Number(req.body && req.body.alphabetSize) || 256;
      generated = SourceAnalyzer.generateUniformSource(alphabetSize, length);
    } else if (type === 'skewed') {
      generated = SourceAnalyzer.generateSkewedSource(length);
    } else {
      if (res && res.status) return res.status(400).json({ error: 'unknown source type' });
      throw new Error('unknown source type');
    }

    const freqs = SourceAnalyzer.calculateFrequencies(generated);
    const entropy = SourceAnalyzer.calculateEntropy(freqs);

    const response = { data: generated, entropyBitsPerSymbol: entropy, frequencies: freqs };
    if (res && res.json) return res.json(response);
    return response;
  } catch (err) {
    logger.error('generateSource: error - %s', err && err.message);
    if (res && res.status) return res.status(500).json({ error: err.message });
    throw err;
  }
}

module.exports = { analyzeEntropy, generateSource };
