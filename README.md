## **Definiciones y Estructura del Proyecto: "Adaptive Huffman Compression Suite"**

### **1. ¿Qué es un Algoritmo de Compresión?**

Un **algoritmo de compresión** es un procedimiento computacional que reduce el tamaño de datos digitales mientras preserva su información esencial. Funciona identificando y eliminando redundancias estadísticas en los datos, reemplazando patrones repetitivos con representaciones más cortas.[1][2][3]

**Componentes clave:**
- **Codificador (Encoder):** Transforma los datos originales en formato comprimido[2][3]
- **Decodificador (Decoder):** Reconstruye los datos originales desde el formato comprimido[3][2]
- **Arquitectura codec:** La combinación de codificador-decodificador que define el método de compresión[2]

**Clasificación:**
- **Lossless (sin pérdida):** Preserva toda la información original exactamente. Ejemplos: Huffman, LZW, DEFLATE[4]
- **Lossy (con pérdida):** Elimina información menos significativa para mayor compresión. Ejemplos: JPEG, MP3[2]

### **2. Huffman: Codificación de Entropía**

Huffman es un algoritmo de **codificación de entropía (entropy coding)**, que intenta aproximarse al límite inferior declarado por el **Teorema de Codificación de Fuente de Shannon**.[5][4]

**Teorema de Shannon:**[6][4][5]
El teorema establece que para cualquier fuente de datos, la longitud esperada del código debe satisfacer:

$$
H(X) \leq L(X) < H(X) + 1
$$

Donde:
- $$H(X)$$ = Entropía de la fuente (límite teórico de compresión)[7][5]
- $$L(X)$$ = Longitud promedio del código Huffman[4]

**Esto significa:** Ningún método de compresión sin pérdida puede comprimir datos por debajo de su entropía sin perder información. Huffman se acerca a este límite óptimo.[5][4]

### **3. Cómo Funciona Huffman (Versión Estática)**

**Pasos del algoritmo:**[8][9][10]

1. **Calcular frecuencias:** Analizar la fuente emisora y contar cuántas veces aparece cada símbolo
2. **Construir cola de prioridad:** Ordenar símbolos por frecuencia ascendente[9][10]
3. **Construir árbol binario:**[11][10]
   - Extraer los dos nodos de menor frecuencia
   - Crear nodo padre con frecuencia = suma de hijos
   - Repetir hasta tener un único árbol
4. **Generar códigos:** Asignar 0 a ramas izquierdas, 1 a derechas[12][9]
5. **Codificar datos:** Reemplazar cada símbolo por su código Huffman

**Propiedad clave - Código Prefijo:** Ningún código es prefijo de otro, lo que permite decodificación sin ambigüedad.[9]

### **4. Huffman Adaptativo (Tu Implementación)**

**Diferencia fundamental:**[13][14][15]
- **Estático:** Requiere dos pasadas (calcular frecuencias + codificar)[16]
- **Adaptativo:** Una sola pasada, el árbol se actualiza dinámicamente mientras se procesan los datos[14][13]

**Algoritmos principales:**

#### **FGK (Faller-Gallager-Knuth):**[15][14]
- Utiliza un nodo especial "0-node" (nodo CERO) para símbolos nunca vistos[15]
- Cuando aparece símbolo nuevo: envía código del 0-node + símbolo raw[15]
- Actualiza el árbol mediante intercambios (swaps) de nodos[14]
- Redundancia: aproximadamente $$2S + t$$ bits[17][15]

#### **Vitter (tu elección recomendada):**[18][13][17]
- Mejora de FGK con "implicit numbering" (numeración implícita)[13][17]
- Nodos numerados por nivel, de menor a mayor[18]
- Mantiene invariante: hojas de peso $$w$$ preceden a nodos internos de peso $$w$$[17][18]
- **Redundancia óptima:** aproximadamente $$S + t + n$$ bits (mejor que FGK)[17][18]
- Árbol más balanceado que FGK[13]

**Ventaja práctica:** Codificación en tiempo real sin conocimiento previo de la distribución de la fuente.[14][13]

### **5. Compresión Source-Aware (Consciente de la Fuente)**

**Concepto:** Aplicar preprocesamiento específico según el tipo de datos antes de comprimir, para mejorar el ratio de compresión.[19][20]

**Estrategias por tipo de fuente:**

**Texto plano:**
- Sin preprocesamiento (Huffman funciona óptimamente)[21][22]
- Alta entropía por variedad de caracteres

**Audio/Imágenes:**[20][23][19]
- **Diferenciación temporal/espacial:** Comprimir diferencias entre muestras consecutivas en lugar de valores absolutos[24]
- Reduce redundancia y aumenta efectividad de Huffman
- Ejemplo: En audio, comprimir $$sample[i] - sample[i-1]$$ en lugar de $$sample[i]$$

**Datos binarios estructurados:**
- **RLE (Run-Length Encoding)** como preprocesamiento[25]
- Comprime secuencias repetitivas antes de aplicar Huffman

### **6. Entropía y Máxima Entropía**

**Entropía de Shannon:**[26][27][7]
$$
H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)
$$

Mide la "sorpresa promedio" o incertidumbre de una fuente de información.[7][26]

**Casos extremos:**

**Entropía mínima (H = 0):**
- Fuente determinista (un solo símbolo con $$P=1$$)
- No hay incertidumbre, no se puede comprimir más

**Entropía máxima:**[26][7]
- Distribución uniforme: todos los símbolos tienen igual probabilidad
- Para alfabeto de tamaño $$n$$: $$H_{max} = \log_2(n)$$
- **Ejemplo:** Alfabeto de 256 símbolos equiprobables → $$H = 8$$ bits/símbolo
- **Implicación:** No hay redundancia, Huffman no puede mejorar la codificación (cada símbolo ya requiere $$\log_2(256) = 8$$ bits)

**Para tu proyecto:** Demostrarás empíricamente que Huffman alcanza mejor compresión con fuentes de baja entropía (desbalanceadas) y es inefectivo con fuentes de máxima entropía (uniformes).

***

## **7. Estructura del Proyecto Node.js**

### **Definición General de la Aplicación**

**Nombre:** Adaptive Huffman Compression Suite (AHCS)

**Descripción:** Sistema interactivo de compresión adaptativa basado en codificación Huffman con análisis de entropía en tiempo real y preprocesamiento consciente del tipo de fuente emisora. Incluye visualización dinámica del árbol Huffman y dashboard de métricas para demostración educativa y experimental del Teorema de Shannon.

### **Arquitectura MVC (Model-View-Controller)**[28][29][30]

**¿Por qué MVC?**[29][30]
- Separación de responsabilidades (concerns)[30][29]
- Código más mantenible y escalable[31][29]
- Desarrollo modular: frontend y backend independientes[29]
- Reutilización de código[30][31]

### **Estructura de Carpetas**[32][28][30]

```
adaptive-huffman-suite/
│
├── config/
│   └── appConfig.js           # Configuración general (puertos, límites)
│
├── models/                     # MODELO - Lógica de negocio
│   ├── VitterTree.js         # Clase árbol Huffman ✅
│   ├── VitterEncoder.js       # Implementación algoritmo Vitter ✅
│   ├── VitterDecoder.js       # Decodificador Vitter ✅
│   ├── SourceAnalyzer.js      # Análisis tipo de fuente + entropía ✅
│   └── Preprocessor.js        # Estrategias preprocesamiento ✅
│
├── controllers/                # CONTROLADOR - Intermediario
│   ├── compressionController.js    # Maneja requests de compresión
│   ├── analysisController.js       # Maneja cálculos de entropía
│   └── visualizationController.js  # Prepara datos para visualización
│
├── views/                      # VISTA - Frontend
│   ├── index.html             # Página principal
│   ├── dashboard.html         # Dashboard de métricas
│   └── templates/
│       └── tree-visualization.html  # Template visualización árbol
│
├── public/                     # Recursos estáticos
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── treeRenderer.js    # Renderizado visual del árbol
│   │   ├── chartManager.js    # Gráficas (entropía vs compresión)
│   │   └── interactionHandler.js  # Eventos UI
│   └── assets/
│       └── sample-sources/    # Datasets de prueba
│
├── routes/                     # Definición de endpoints API
│   ├── compressionRoutes.js   # POST /compress, POST /decompress
│   ├── analysisRoutes.js      # GET /entropy, GET /source-type
│   └── visualizationRoutes.js # GET /tree-state, WebSocket /live-updates
│
├── services/                   # Lógica de negocio auxiliar
│   ├── entropyCalculator.js   # Cálculos matemáticos de entropía
│   └── fileHandler.js         # Lectura/escritura archivos
│
├── utils/                      # Funciones utilitarias
│   ├── bitStream.js           # Manejo de bits para codificación
│   └── logger.js              # Sistema de logging
│
├── tests/                      # Tests unitarios
│   ├── huffman.test.js
│   ├── entropy.test.js
│   └── preprocessing.test.js
│
├── app.js                      # Punto de entrada aplicación
├── package.json
└── README.md
```

### **Flujo de Datos (Request-Response)**[31][29]

**Ejemplo: Comprimir archivo de texto**

1. **Usuario** sube archivo → Frontend (`index.html`)
2. **Vista** envía `POST /compress` → Rutas (`compressionRoutes.js`)
3. **Ruta** invoca → Controlador (`compressionController.js`)
4. **Controlador** llama:
   - `SourceAnalyzer.detectType(file)` → Identifica tipo (texto)
   - `Preprocessor.apply(file, 'text')` → Sin preprocesamiento para texto
   - `VitterEncoder.encode(data)` → Compresión adaptativa
   - `entropyCalculator.compute(data)` → Calcula entropía teórica
5. **Controlador** devuelve JSON con:
   - Archivo comprimido
   - Ratio de compresión
   - Entropía original vs longitud código
   - Estado actual del árbol (para visualización)
6. **Vista** recibe datos y actualiza:
   - Dashboard de métricas
   - Visualización animada del árbol
   - Gráfica entropía vs compresión

***

## **8. Módulos Principales del Proyecto**

### **A. Modelo: VitterEncoder.js**

**Responsabilidades:**
- Implementar algoritmo Vitter completo[13][17]
- Mantener árbol Huffman adaptativo con implicit numbering[18]
- Gestionar nodo CERO para símbolos nuevos[15]
- Actualizar árbol tras cada símbolo procesado

**Métodos clave:**
```javascript
class VitterEncoder {
  constructor() {
    this.tree = new VitterTree();
    this.zeroNode = this.tree.createZeroNode();
  }
  
  encode(inputData) {
    // Procesar símbolo por símbolo
    // Emitir código + actualizar árbol
    // Retornar stream comprimido + metadata
  }
  
  updateTree(symbol) {
    // Aplicar swaps según Vitter
    // Mantener implicit numbering
    // Preservar invariante
  }
}
```

### **B. Modelo: SourceAnalyzer.js**

**Responsabilidades:**
- Detectar tipo de fuente (texto, imagen, audio, binario)[19][20]
- Calcular entropía de Shannon[27][7]
- Generar distribución de probabilidades
- Sugerir estrategia de preprocesamiento óptima

**Métodos clave:**
```javascript
class SourceAnalyzer {
  detectType(data) {
    // Analizar extensión + magic numbers + estructura
    // Retornar: 'text' | 'image' | 'audio' | 'binary'
  }
  
  calculateEntropy(data) {
    // Aplicar fórmula Shannon: H(X) = -Σ P(x)*log2(P(x))
    // Retornar entropía en bits/símbolo
  }
  
  generateMaxEntropySource(alphabetSize) {
    // Para experimentos: crear fuente uniforme
    // Entropía = log2(alphabetSize)
  }
}
```

### **C. Modelo: Preprocessor.js**

**Responsabilidades:**
- Aplicar transformaciones específicas por tipo de fuente[20][19]
- Revertir preprocesamiento en descompresión

**Estrategias:**
```javascript
class Preprocessor {
  apply(data, sourceType) {
    switch(sourceType) {
      case 'text':
        return data; // Sin preprocesamiento
      
      case 'audio':
        return this.deltaEncoding(data); // Diferencias temporales
      
      case 'image':
        return this.spatialDifferencing(data); // Diferencias espaciales
      
      case 'binary':
        return this.RLE(data); // Run-Length Encoding
    }
  }
  
  deltaEncoding(samples) {
    // Transformar [a, b, c] → [a, b-a, c-b]
  }
}
```

### **D. Vista: treeRenderer.js**

**Responsabilidades:**
- Renderizar árbol Huffman visualmente usando D3.js o Canvas
- Animar cambios en el árbol (swaps, nuevos nodos)
- Resaltar caminos de codificación

**Visualización:**
- Nodos: círculos con peso/frecuencia
- Aristas: líneas etiquetadas con 0 (izq) / 1 (der)
- Animación: transiciones suaves cuando se actualiza árbol

### **E. Controlador: compressionController.js**

**Responsabilidades:**
- Orquestar flujo de compresión/descompresión
- Coordinar entre modelos (analyzer, preprocessor, encoder)
- Preparar respuestas para la vista

```javascript
async function compress(req, res) {
  const file = req.file;
  
  // 1. Analizar fuente
  const type = SourceAnalyzer.detectType(file);
  const entropy = SourceAnalyzer.calculateEntropy(file.data);
  
  // 2. Preprocesar
  const preprocessed = Preprocessor.apply(file.data, type);
  
  // 3. Comprimir con Vitter
  const compressed = VitterEncoder.encode(preprocessed);
  const treeState = VitterEncoder.getTreeState();
  
  // 4. Calcular métricas
  const compressionRatio = file.size / compressed.size;
  const avgCodeLength = compressed.totalBits / file.length;
  
  // 5. Responder
  res.json({
    compressedFile: compressed.buffer,
    metrics: {
      originalSize: file.size,
      compressedSize: compressed.size,
      ratio: compressionRatio,
      entropy: entropy,
      avgCodeLength: avgCodeLength,
      theoreticalLimit: entropy // Comparación con límite Shannon
    },
    treeVisualization: treeState
  });
}
```

***

## **9. Componente de Investigación: Estudio de Entropía**

### **Experimentos a Implementar**

**Experimento 1: Entropía Variable**
- Generar fuentes con entropías controladas: 1, 2, 4, 6, 8 bits/símbolo
- Comprimir cada fuente con Huffman
- Graficar: Entropía teórica vs Longitud promedio código vs Tamaño comprimido

**Experimento 2: Máxima Entropía**
- Crear fuente uniforme (todos símbolos equiprobables)
- Calcular $$H = \log_2(256) = 8$$ bits/símbolo
- Demostrar que Huffman no puede mejorar (cada código ≈ 8 bits)
- Comparar con fuente desbalanceada (ej: 'a'=50%, 'b'=25%, 'c'=12.5%, ...)

**Experimento 3: Límite de Shannon**
- Para múltiples fuentes, verificar empíricamente: $$H(X) \leq L(X) < H(X) + 1$$[4]
- Crear gráfica de dispersión: eje X = entropía, eje Y = longitud código
- Mostrar que todos los puntos caen en banda $$[H, H+1]$$

**Experimento 4: Comparación Estático vs Adaptativo**
- Mismo dataset comprimido con Huffman estático y Vitter
- Medir overhead del adaptativo (metadata del árbol)
- Demostrar convergencia: adaptativo → estático conforme aumenta tamaño datos

### **Visualizaciones Interactivas**

**Dashboard de Entropía:**
- Gráfica en tiempo real mostrando evolución de entropía mientras se procesa stream
- Comparador lado a lado: entropía teórica vs ratio de compresión alcanzado
- Heat map de distribución de probabilidades de símbolos

**Simulador de Fuentes:**
- Interfaz para que usuario cree fuentes personalizadas (ajustar probabilidades)
- Predicción instantánea: "Esta fuente tendrá entropía X, Huffman comprimirá a Y bits/símbolo"
- Botón "Generar fuente de máxima entropía" para demostración

---

## **Resumen de Apuntes Generales**

**Conceptos Clave:**

1. **Algoritmo de compresión** = Procedimiento que reduce tamaño de datos identificando redundancias[1][2]

2. **Huffman** = Codificación de entropía que asigna códigos cortos a símbolos frecuentes[10][4]

3. **Teorema de Shannon** = Límite teórico: ninguna compresión sin pérdida puede superar la entropía de la fuente[5][4]
   - Fórmula: $$H(X) \leq L(X) < H(X) + 1$$

4. **Huffman Adaptativo (Vitter)** = Versión de una sola pasada que actualiza árbol dinámicamente[14][13]
   - Ventaja: codificación en tiempo real sin conocer distribución previa
   - Técnica: implicit numbering + invariante de peso[18][13]

5. **Source-Aware Compression** = Preprocesar datos según tipo antes de comprimir[19][20]
   - Texto → sin preprocesamiento
   - Audio/Imagen → diferenciación temporal/espacial
   - Binario → RLE

6. **Entropía máxima** = Distribución uniforme donde Huffman no puede mejorar[7][26]
   - Demuestra límite fundamental de compresión sin pérdida

7. **Arquitectura MVC** = Separar aplicación en Modelo (lógica), Vista (UI), Controlador (intermediario)[29][30]

**Tu Proyecto Diferenciador:**
- ✅ Huffman Adaptativo (Vitter) implementado desde cero
- ✅ Análisis de fuente emisora con preprocesamiento inteligente
- ✅ Visualización interactiva del árbol en tiempo real
- ✅ Estudio experimental de entropía con casos de máxima entropía
- ✅ Presentación educativa en Node.js con dashboard de métricas
