// Minimal static Huffman encoder used for comparison experiments
// Exports: buildFromString(str) -> { tree, codes, compressedBitLength, compressedBytes }

class HuffmanNode {
  constructor(symbol=null, weight=0, left=null, right=null) {
    this.symbol = symbol;
    this.weight = weight;
    this.left = left;
    this.right = right;
  }
}

function buildFrequencyTable(str) {
  const freqs = {};
  for (const ch of str) freqs[ch] = (freqs[ch] || 0) + 1;
  return freqs;
}

function buildTree(freqs) {
  const nodes = [];
  for (const [sym, w] of Object.entries(freqs)) nodes.push(new HuffmanNode(sym, w));
  if (nodes.length === 0) return null;
  // edge case: single symbol -> give it a 1-bit code '0'
  if (nodes.length === 1) return new HuffmanNode(null, nodes[0].weight, nodes[0], null);

  // build via simple array-based priority queue (sort each iteration) - fine for small inputs
  while (nodes.length > 1) {
    nodes.sort((a,b) => a.weight - b.weight);
    const a = nodes.shift();
    const b = nodes.shift();
    const parent = new HuffmanNode(null, a.weight + b.weight, a, b);
    nodes.push(parent);
  }
  return nodes[0];
}

function generateCodes(root) {
  const codes = {};
  function walk(node, prefix) {
    if (!node) return;
    if (node.symbol != null) { codes[String(node.symbol)] = prefix || '0'; return; }
    walk(node.left, prefix + '0');
    walk(node.right, prefix + '1');
  }
  walk(root, '');
  return codes;
}

function computeCompressedLengthBits(codes, freqs) {
  let bits = 0;
  for (const [sym, count] of Object.entries(freqs)) {
    const code = codes[String(sym)];
    if (!code) continue;
    bits += code.length * count;
  }
  return bits;
}

function buildFromString(str) {
  const freqs = buildFrequencyTable(str);
  const tree = buildTree(freqs);
  const codes = tree ? generateCodes(tree) : {};
  const bits = computeCompressedLengthBits(codes, freqs);
  const bytes = Math.ceil(bits / 8);
  // Create a JSON-friendly representation of the tree
  function nodeToJson(node) {
    if (!node) return null;
    const obj = { weight: node.weight };
    if (node.symbol != null) obj.symbol = String(node.symbol);
    obj.left = nodeToJson(node.left);
    obj.right = nodeToJson(node.right);
    return obj;
  }
  return { tree: nodeToJson(tree), codes, compressedBitLength: bits, compressedBytes: bytes, freqs };
}

function encodeToBuffer(str) {
  const freqs = buildFrequencyTable(str);
  const tree = buildTree(freqs);
  const codes = tree ? generateCodes(tree) : {};
  // Bit packing
  const bytes = [];
  let current = 0;
  let filled = 0;
  let bitLen = 0;
  function writeBit(b) {
    current = (current << 1) | (b ? 1 : 0);
    filled++;
    bitLen++;
    if (filled === 8) {
      bytes.push(current & 0xFF);
      current = 0; filled = 0;
    }
  }
  function writeBitsFromString(s) {
    for (let i=0;i<s.length;i++) writeBit(s.charAt(i) === '1' ? 1 : 0);
  }
  for (const ch of str) {
    const code = codes[String(ch)] || '';
    writeBitsFromString(code);
  }
  if (filled > 0) {
    const pad = 8 - filled;
    current = current << pad;
    bytes.push(current & 0xFF);
    filled = 0;
  }
  const header = Buffer.alloc(4);
  header.writeUInt32BE(bitLen, 0);
  const payload = Buffer.from(bytes);
  return Buffer.concat([header, payload]);
}

module.exports = { buildFromString, encodeToBuffer };
