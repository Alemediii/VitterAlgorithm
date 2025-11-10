// Implementación de la clase VitterNode
class VitterNode {
  constructor(symbol = null, weight = 0, order = 0) {
    // symbol: carácter para hojas, o null para nodos internos / NYT
    this.symbol = symbol;
    // weight: contador/peso del nodo
    this.weight = typeof weight === 'number' && !Number.isNaN(weight) ? weight : 0;
    // order: número de orden usado por el algoritmo de Vitter para la jerarquía
    this.order = typeof order === 'number' ? order : 0;

    // enlaces del árbol
    this.parent = null;
    this.left = null;
    this.right = null;
  }

  // Indica si es hoja (tiene símbolo, o es NYT con símbolo === null y sin hijos)
  isLeaf() {
    return this.left === null && this.right === null;
  }

  // Indica si es el nodo NYT (Not Yet Transferred)
  isNYT() {
    return this.isLeaf() && this.symbol === null;
  }

  // Devuelve una representación para depuración
  toJSON() {
    const obj = { order: this.order, weight: this.weight };
    if (this.symbol !== null) obj.symbol = this.symbol;
    obj.left = this.left ? this.left.toJSON() : null;
    obj.right = this.right ? this.right.toJSON() : null;
    return obj;
  }
}

module.exports = VitterNode;
