const SourceAnalyzer = require('../models/SourceAnalyzer');
const VitterEncoder = require('../models/VitterEncoder');
const Huffman = require('../models/HuffmanEncoder');
const logger = require('../utils/logger');

// Benchmark controller: generate random sources of increasing size, measure compression times
// Exposes: async function getTimes(req,res)

async function getTimes(req, res) {
  try {
    // Sizes to test (can be overridden via ?sizes=100,500,1000)
    const sizesParam = req.query.sizes;
    const defaultSizes = [100, 500, 1000, 5000];
    let sizes = defaultSizes;
    if (sizesParam && typeof sizesParam === 'string') {
      const parsed = sizesParam.split(',').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n) && n>0);
      if (parsed.length>0) sizes = parsed;
    }

    const runsPerSize = 5; // measure each size multiple times
    const warmupRuns = 2; // warmup iterations (not measured) to let JIT settle
    const results = [];

    for (const N of sizes) {
      // Use alphabet size 26 for uniform source
      const timesV = [];
      const timesH = [];

      // Warmup (best-effort, not measured)
      for (let w=0; w<warmupRuns; w++) {
        const warmSrc = SourceAnalyzer.generateUniformSource(26, N);
        try { const warmV = new VitterEncoder(); warmV.encodeToBuffer(warmSrc); } catch(e) {}
        try { Huffman.buildFromString(warmSrc); } catch(e) {}
      }

      for (let run=0; run<runsPerSize; run++) {
        // generate source string of length N
        const src = SourceAnalyzer.generateUniformSource(26, N);

        // Measure Vitter compression (encodeToBuffer)
        const vitterStart = process.hrtime.bigint();
        try {
          const vitterEnc = new VitterEncoder();
          // encodeToBuffer expects a string; ensure it's a string
          const buf = vitterEnc.encodeToBuffer(src);
          // explicitly null large objects to help GC
          // eslint-disable-next-line no-unused-vars
          void buf;
        } finally {
          const vitterEnd = process.hrtime.bigint();
          const vitterNs = Number(vitterEnd - vitterStart);
          const vitterMs = vitterNs / 1e6;
          timesV.push(vitterMs);
        }

        // Measure Huffman compression (encodeToBuffer) — comparable work to Vitter
        const huffmanStart = process.hrtime.bigint();
        try {
          const hb = Huffman.encodeToBuffer(src);
          void hb;
        } finally {
          const huffmanEnd = process.hrtime.bigint();
          const huffmanNs = Number(huffmanEnd - huffmanStart);
          const huffmanMs = huffmanNs / 1e6;
          timesH.push(huffmanMs);
        }

        // Do not force GC here; it perturbs timings and is not available in all runtimes
      }

      // compute averages
      const avg = arr => arr.reduce((s,v)=>s+v,0)/arr.length;
      results.push({ N, vitterMs: Number(avg(timesV).toFixed(4)), huffmanMs: Number(avg(timesH).toFixed(4)) });
    }

    return res.json(results);
  } catch (err) {
    logger.error('benchmark.getTimes error: %s', err && err.stack ? err.stack : String(err));
    return res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = { getTimes };
