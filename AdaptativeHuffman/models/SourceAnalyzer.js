// Análisis del tipo de fuente y cálculo de entropía

class SourceAnalyzer {
  // Contar frecuencia de cada símbolo en un string de entrada.
  // Devuelve un objeto { symbol: count }
  calculateFrequencies(data) {
    if (typeof data !== 'string') {
      throw new TypeError('data must be a string')
    }
    const freqs = {}
    for (const ch of data) {
      freqs[ch] = (freqs[ch] || 0) + 1
    }
    return freqs
  }

  // Calcular entropía de Shannon dada una tabla de frecuencias.
  // Input: frequencies = { symbol: count }
  // Fórmula: H(X) = -Σ p(x) * log2(p(x))
  // donde p(x) = count(x) / N, y log2 es el logaritmo en base 2.
  // Devuelve la entropía en bits por símbolo.
  calculateEntropy(frequencies) {
    if (!frequencies || typeof frequencies !== 'object') {
      throw new TypeError('frequencies must be an object')
    }
    const counts = Object.values(frequencies)
    const total = counts.reduce((s, v) => s + v, 0)
    if (total === 0) return 0

    let entropy = 0
    for (const count of counts) {
      if (count <= 0) continue
      const p = count / total
      // log2(p) = Math.log(p) / Math.log(2)
      entropy -= p * (Math.log(p) / Math.log(2))
    }
    return entropy
  }

  // Generar texto aleatorio con distribución uniforme sobre un alfabeto de tamaño alphabetSize.
  // Devuelve un string de longitud `length` compuesto por símbolos 'A','B','C',... según tamaño.
  // Uniforme significa que cada símbolo tiene probabilidad p = 1/alphabetSize.
  generateUniformSource(alphabetSize, length) {
    if (!Number.isInteger(alphabetSize) || alphabetSize <= 0) {
      throw new TypeError('alphabetSize must be a positive integer')
    }
    if (!Number.isInteger(length) || length < 0) {
      throw new TypeError('length must be a non-negative integer')
    }

    // Generar alfabeto: A,B,C,...,Z,a,b,c... si es necesario
    const alphabet = []
    for (let i = 0; i < alphabetSize; i++) {
      if (i < 26) alphabet.push(String.fromCharCode(65 + i)) // A..Z
      else alphabet.push(String.fromCharCode(97 + (i - 26) % 26)) // a..z ciclar
    }

    let out = ''
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * alphabetSize)
      out += alphabet[idx]
    }
    return out
  }

  // Generar texto aleatorio con distribución desbalanceada fija: 70% 'A', 20% 'B', 10% 'C'.
  // Si se solicita otra longitud, se genera una cadena compuesta por esos símbolos según probabilidades.
  generateSkewedSource(length) {
    if (!Number.isInteger(length) || length < 0) {
      throw new TypeError('length must be a non-negative integer')
    }
    const symbols = ['A', 'B', 'C']
    const probs = [0.7, 0.2, 0.1]

    // Construir intervalos acumulados para muestreo por inverso
    const cum = []
    let acc = 0
    for (let i = 0; i < probs.length; i++) {
      acc += probs[i]
      cum.push(acc)
    }

    let out = ''
    for (let i = 0; i < length; i++) {
      const r = Math.random()
      // seleccionar símbolo según el intervalo donde cae r
      let j = 0
      while (r > cum[j]) j++
      out += symbols[j]
    }
    return out
  }

  // Calcular longitud promedio del código dado un objeto codes y frecuencias.
  // codes: { symbol: '010' }, frequencies: { symbol: count }
  // Longitud promedio L = Σ p(x) * l(x) donde l(x) es la longitud en bits del código de x.
  calculateAverageCodeLength(codes, frequencies) {
    if (!codes || typeof codes !== 'object') throw new TypeError('codes must be an object')
    if (!frequencies || typeof frequencies !== 'object') throw new TypeError('frequencies must be an object')

    const counts = Object.values(frequencies)
    const total = counts.reduce((s, v) => s + v, 0)
    if (total === 0) return 0

    let L = 0
    for (const [sym, count] of Object.entries(frequencies)) {
      const code = codes[sym]
      if (!code) continue // símbolo sin código -> ignorar
      const p = count / total
      const l = String(code).length
      L += p * l
    }
    return L
  }
}

module.exports = new SourceAnalyzer()
