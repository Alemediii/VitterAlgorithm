const VitterTree = require('../models/VitterTree');
const SourceAnalyzer = require('../models/SourceAnalyzer');
const logger = require('../utils/logger');

// Controller for visualization-related endpoints
// Exports:
// - getTree(req, res): GET /api/visualization/tree?source=<string>
// - encodeRoundtrip(req, res): POST /api/visualization/encode-roundtrip { source: string }

async function getTree(req, res) {
  try {
    const source = (req.query.source || '').toString();
    if (!source) {
      return res.status(400).json({ success: false, error: 'query parameter "source" is required' });
    }

    // Build a VitterTree from source by feeding each byte
    const tree = new VitterTree();
    // If input is a string, feed its UTF-8 bytes
    const buf = Buffer.from(source, 'utf8');
    for (const b of buf) {
      tree.updateWithSymbol(b);
    }

    const treeJson = tree.toJSON();
    const freqs = SourceAnalyzer.calculateFrequencies(source);
    const entropy = SourceAnalyzer.calculateEntropy(freqs);

    return res.json({ success: true, data: { tree: treeJson, meta: { entropy, length: source.length } } });
  } catch (err) {
    logger.error('visualization.getTree error: %s', err && err.stack ? err.stack : String(err));
    return res.status(500).json({ success: false, error: 'internal server error' });
  }
}

// Helper: simple round-trip using VitterEncoder/VitterDecoder for smoke testing
const VitterEncoder = require('../models/VitterEncoder');
const VitterDecoder = require('../models/VitterDecoder');

async function encodeRoundtrip(req, res) {
  try {
    const source = (req.body && req.body.source) ? String(req.body.source) : '';
    if (!source) return res.status(400).json({ success: false, error: 'body.source is required' });

    const encoder = new VitterEncoder();
    const decoder = new VitterDecoder();

    const buf = encoder.encodeToBuffer(source);
    const decoded = decoder.decodeFromBuffer(buf);

    return res.json({ success: true, data: { original: source, decoded } });
  } catch (err) {
    logger.error('visualization.encodeRoundtrip error: %s', err && err.stack ? err.stack : String(err));
    return res.status(500).json({ success: false, error: 'internal server error' });
  }
}

module.exports = {
  getTree,
  encodeRoundtrip
};

