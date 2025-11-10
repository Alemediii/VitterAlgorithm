const VitterNode = require('./VitterNode');

// Implementación básica del árbol adaptativo según Vitter (FGK/Vitter simplified)
class VitterTree {
  constructor() {
    // Root initially is a NYT node
    this.maxOrder = 512; // large enough order reservoir
    this.root = new VitterNode(null, 0, this.maxOrder);
    this.NYT = this.root;

    // Map from symbol -> leaf node
    this.symbolMap = new Map();

    // Nodes list indexed by order for quick swaps: order -> node
    this.orderMap = new Map();
    this.orderMap.set(this.root.order, this.root);
  }

  // Get code (bit string) for a node by walking up to root
  getCodeForNode(node) {
    if (!node) return '';
    let bits = '';
    let cur = node;
    while (cur.parent) {
      bits = (cur.parent.left === cur ? '0' : '1') + bits;
      cur = cur.parent;
    }
    return bits;
  }

  // Get code for symbol: if present return path to leaf, else path to NYT
  getCodeForSymbol(symbol) {
    const node = this.symbolMap.get(symbol);
    if (node) return this.getCodeForNode(node);
    return this.getCodeForNode(this.NYT);
  }

  // Insert a new symbol by splitting NYT: create internal node with new NYT and leaf
  insertSymbol(symbol) {
    if (this.symbolMap.has(symbol)) return this.symbolMap.get(symbol);

    // create new nodes. Order: parent gets NYT.order -1, new right leaf gets NYT.order -2, new NYT gets NYT.order -3
    const parentOrder = this.NYT.order - 1;
    const leafOrder = this.NYT.order - 2;
    const newNYTOrder = this.NYT.order - 3;

    const newLeaf = new VitterNode(symbol, 1, leafOrder);
    const newNYT = new VitterNode(null, 0, newNYTOrder);
    const internal = new VitterNode(null, 1, parentOrder);

    // link
    internal.left = newNYT;
    internal.right = newLeaf;
    newNYT.parent = internal;
    newLeaf.parent = internal;

    // replace old NYT in tree with internal
    const oldNYT = this.NYT;
    if (!oldNYT.parent) {
      // oldNYT was root
      this.root = internal;
      internal.parent = null;
    } else {
      if (oldNYT.parent.left === oldNYT) oldNYT.parent.left = internal;
      else oldNYT.parent.right = internal;
      internal.parent = oldNYT.parent;
    }

    // update maps
    this.orderMap.delete(oldNYT.order);
    this.orderMap.set(internal.order, internal);
    this.orderMap.set(newLeaf.order, newLeaf);
    this.orderMap.set(newNYT.order, newNYT);

    this.NYT = newNYT;
    this.symbolMap.set(symbol, newLeaf);

    // After insertion, we need to increment weights up from newLeaf.parent
    this.incrementWeight(internal);
    return newLeaf;
  }

  // Find highest-order node in same weight block (simplified linear search on orderMap)
  findNodeToSwap(node) {
    // Find any node with same weight and highest order greater than node.order
    let candidate = null;
    for (const other of this.orderMap.values()) {
      if (other === node) continue;
      if (other.weight === node.weight && other.order > node.order) {
        if (!candidate || other.order > candidate.order) candidate = other;
      }
    }
    return candidate;
  }

  // Swap two nodes in tree (maintaining parent links and updating orderMap)
  swapNodes(a, b) {
    if (!a || !b || a === b) return;
    // swap positions in parent children
    const aParent = a.parent;
    const bParent = b.parent;
    if (!aParent || !bParent) return; // don't swap root

    if (aParent.left === a) aParent.left = b; else aParent.right = b;
    if (bParent.left === b) bParent.left = a; else bParent.right = a;

    // swap parents
    const tmpParent = a.parent;
    a.parent = b.parent;
    b.parent = tmpParent;

    // swap orders
    const tmpOrder = a.order;
    a.order = b.order;
    b.order = tmpOrder;

    // update orderMap
    this.orderMap.set(a.order, a);
    this.orderMap.set(b.order, b);
  }

  // Increment weight of a node and perform swaps according to Vitter rules (simplified)
  incrementWeight(node) {
    let cur = node;
    while (cur) {
      // find node to swap with
      const toSwap = this.findNodeToSwap(cur);
      if (toSwap && toSwap !== cur.parent) {
        this.swapNodes(cur, toSwap);
      }
      cur.weight += 1;
      cur = cur.parent;
    }
  }

  // Update after observing symbol: if new, insert; otherwise increment from symbol node
  updateWithSymbol(symbol) {
    if (!this.symbolMap.has(symbol)) {
      this.insertSymbol(symbol);
    } else {
      const node = this.symbolMap.get(symbol);
      this.incrementWeight(node);
    }
  }

  // Helper: produce a JSON-serializable tree for visualization
  toJSON() {
    const nodeToObj = (n) => {
      if (!n) return null;
      const obj = { order: n.order, weight: n.weight };
      if (n.symbol !== null) obj.symbol = n.symbol;
      obj.left = nodeToObj(n.left);
      obj.right = nodeToObj(n.right);
      return obj;
    };
    return nodeToObj(this.root);
  }
}

module.exports = VitterTree;
