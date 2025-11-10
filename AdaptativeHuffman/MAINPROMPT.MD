# PROMPT MAESTRO PARA COPILOT - Proyecto AHCS (Adaptive Huffman Suite)

## CONTEXTO GENERAL DEL PROYECTO

Estoy desarrollando **Adaptive Huffman Compression Suite (AHCS)**, un sistema educativo de compresión de datos basado en el **Algoritmo de Vitter (Adaptive Huffman Coding)**.

**Tecnología Stack:**
- Backend: Node.js + Express.js (ES6 modules)
- Frontend: HTML5 + CSS3 + Vanilla JavaScript + D3.js
- Propósito: Proyecto académico (entrega 9 Nov, presentación 10 Nov)

**Mi situación actual:**
- ✅ Core implementado: `VitterTree.js`, `VitterEncoder.js`, `VitterDecoder.js`, `SourceAnalyzer.js`
- ✅ Todos los modelos testeados y validados
- 🔄 AHORA: Construyendo capas de aplicación (Backend API → Frontend → Experimentos)

---

## INSTRUCCIONES GENERALES PARA CUALQUIER CÓDIGO QUE GENERES

### 1. ESTILO Y CONVENCIONES
- **Formato:** ES6 modules (`import`/`export`)
- **Indentación:** 2 espacios
- **Naming:** 
  - Clases: PascalCase (`VitterEncoder`, `CompressionController`)
  - Funciones/métodos: camelCase (`encodeSymbol`, `handleCompress`)
  - Constantes: UPPER_SNAKE_CASE (`MAX_PAYLOAD_SIZE`, `ALPHABET_SIZE`)
  - Privados: Prefijo `_` (ej: `_updateNode()`)
- **Punto y coma:** Siempre incluir
- **Comillas:** Simples (`'`) para strings cortos, template literals (`` ` ``) para interpolación

### 2. COMENTARIOS Y DOCUMENTACIÓN
- **JSDoc para funciones públicas:** Incluir descripción, parámetros, retorno
- **Comentarios inline:** Solo para lógica compleja (algoritmo Vitter, cálculos)
- **No comentar:** Código obvio o nombres autoexplicativos
- **Referencias académicas:** Si usas fórmulas matemáticas, cita: `// Shannon entropy: H(X) = -Σ P(x)*log2(P(x))`

### 3. MANEJO DE ERRORES
- **Try-catch:** Solo para errores inesperados (I/O, parsing)
- **Validación de input:** Al inicio de cada función
- **Errores descriptivos:** Incluir contexto (ej: "Cannot encode: input exceeds 1MB limit")
- **Logging:** Usar `logger` para debugging, no `console.log`

### 4. RENDIMIENTO
- **NO optimizar prematuramente**
- **Sí validar:** Que métodos no hagan loops innecesarios
- **Strings vs Buffers:** Usa strings para bits ("010101"), buffers solo si necesitas comprimirlos realmente
- **Memory:** No guarda todas las instancias de VitterTree, reutiliza en sesiones

### 5. TESTING IMPLÍCITO
- Asume que el código será testeado inmediatamente
- Incluye valores por defecto sensatos
- Si hay múltiples caminos, haz ambos válidos
- Retorna objetos estructurados (no undefined sorpresas)

### 6. INTEGRACIÓN CON MODELOS EXISTENTES
Tu código **SIEMPRE** debe reutilizar estos módulos ya implementados:

```javascript
import VitterEncoder from '../models/VitterEncoder.js';
import VitterDecoder from '../models/VitterDecoder.js';
import SourceAnalyzer from '../models/SourceAnalyzer.js';
import logger from '../utils/logger.js';
```

**NO reimplementes:**
- Cálculos de entropía
- Manejo de buffers
- Construcción del árbol Vitter

---

## PATRÓN DE RESPUESTA PARA CADA ARCHIVO

Cuando pidas código para un archivo específico, adjunta este contexto:

```
ARCHIVO: [ruta/nombre.js]

PROPÓSITO: [descripción de qué hace]

DEPENDENCIAS:
- Import: [módulos que necesita]
- Expone: [funciones/clases que exporta]

REQUISITOS FUNCIONALES:
- [Requisito 1]
- [Requisito 2]

EJEMPLO DE USO:
[Código que muestra cómo se usa]

PARÁMETROS/TIPOS:
- input: [tipo/formato]
- output: [tipo/formato]

NOTAS ESPECIALES:
[Restricciones, casos edge, decisiones de diseño]
```

---

## REGLAS ESPECÍFICAS POR TIPO DE ARCHIVO

### PARA CONTROLLERS
```
- Método por endpoint (ej: compress(), decompress())
- Estructura: validar input → llamar modelo → preparar respuesta
- Siempre retornar JSON con: { success: bool, data: {...}, error: string }
- Usar try-catch solo para errores inesperados
- Logging: log input (no sensible), output (solo tamaño/tipo)
```

### PARA RUTAS (Routes)
```
- Una ruta por endpoint lógico
- Usar express.Router()
- Agregar validación de Content-Type
- Límite de body size: 5MB
- Todas las rutas deben estar documentadas con su propósito
```

### PARA VISTAS (HTML)
```
- Estructura semántica (HTML5)
- Clases CSS descriptivas (no genéricas como "container1")
- IDs solo para JavaScript targeting
- Responsive: mobile-first, breakpoint en 768px
- Sin inline styles (todo en CSS)
- Accesibilidad: aria-labels donde sea necesario
```

### PARA JAVASCRIPT DEL CLIENTE
```
- Separar lógica de UI
- Usar fetch() para API calls
- Manejar errores de red (timeout, 500, etc.)
- Events: usar addEventListener (no onclick inline)
- DOM: usar document.querySelector/querySelectorAll
- No jQuery, solo vanilla JS
```

### PARA CSS
```
- Variables CSS para colores/tamaños (:root { --primary: ... })
- Mobile-first media queries
- Flexbox/Grid, no floats
- Animaciones: usar @keyframes, no JavaScript
- Comentarios: secciones principales /* === Header === */
- OOCSS: clases reutilizables (utility classes)
```

---

## TEMPLATE DE PROMPT PARA COPILOT (Copia y adapta)

```
CONTEXTO: Estoy desarrollando Adaptive Huffman Compression Suite (AHCS), 
un proyecto Node.js de compresión adaptativa basada en Vitter.

ARCHIVO A CREAR: [ruta/nombre.js]

PROPÓSITO: [explicar qué debe hacer]

CONVENCIONES DEL PROYECTO:
- ES6 modules (import/export)
- JSDoc para funciones públicas
- Indentación: 2 espacios
- Usar logger para debugging
- Reutilizar: VitterEncoder, SourceAnalyzer, etc.

ESTRUCTURA REQUERIDA:
[Método 1: descripción + parámetros + retorno]
[Método 2: descripción + parámetros + retorno]

EJEMPLO DE ENTRADA:
[Ejemplo]

EJEMPLO DE SALIDA ESPERADA:
[Ejemplo]

DEPENDENCIAS EXTERNAS:
- Importar: [módulos existentes]
- Exponer: [qué debe exportar]

NOTAS:
- [Consideración importante 1]
- [Consideración importante 2]

Genera solo código, sin explicaciones adicionales.
```

---

## EJEMPLOS DE PROMPTS ESPECÍFICOS

### Para Controlador de Compresión:

```
CONTEXTO: Proyecto AHCS - Algoritmo Vitter implementado y testeado.

ARCHIVO: controllers/compressionController.js

PROPÓSITO: Controlador que orquesta requests HTTP de compresión/descompresión.

MÉTODOS REQUERIDOS:
1. compress(req, res): 
   - Input: { text: string }
   - Valida que text no vacío
   - Llama VitterEncoder.encode(text)
   - Llama SourceAnalyzer.calculateEntropy() y calculateFrequencies()
   - Retorna JSON con: compressed, ratio, entropy, avgCodeLength, codes, frequencies
   
2. decompress(req, res):
   - Input: { compressed: string, treeData: object }
   - Llama VitterDecoder.decode()
   - Retorna JSON con: original

REUTILIZAR:
```javascript
import VitterEncoder from '../models/VitterEncoder.js';
import VitterDecoder from '../models/VitterDecoder.js';
import SourceAnalyzer from '../models/SourceAnalyzer.js';
import logger from '../utils/logger.js';
```

FORMATO DE RESPUESTA EXITOSA:
```json
{
  "success": true,
  "data": {
    "compressed": "010101...",
    "metrics": {
      "originalSize": 88,
      "compressedSize": 26,
      "ratio": 3.38,
      "entropy": 2.18,
      "avgCodeLength": 2.36
    },
    "codes": {"A": "0", "B": "110", ...},
    "frequencies": {"A": 5, "B": 2, ...}
  }
}
```

MANEJO DE ERRORES:
- Si text.length > 1MB: return 413 + "Payload too large"
- Si VitterEncoder falla: return 400 + error message
- Log: input size, output size, tiempo

Genera solo código funcional.
```

### Para Ruta de Compresión:

```
CONTEXTO: Backend Express.js para AHCS.

ARCHIVO: routes/compressionRoutes.js

PROPÓSITO: Definir endpoints REST para compresión/descompresión.

ENDPOINTS REQUERIDOS:
1. POST /api/compress
   - Body: { text: string }
   - Respuesta: { success, data }
   - Limitar a 5MB

2. POST /api/decompress
   - Body: { compressed: string, treeData: object }
   - Respuesta: { success, data }

IMPORTAR Y USAR:
- express.Router()
- compressionController (métodos compress(), decompress())
- Middleware: express.json({ limit: '5mb' })

RESPUESTAS:
- 200: OK
- 400: Bad Request (validación)
- 413: Payload Too Large
- 500: Server Error

Genera solo código, sin comentarios largos.
```

### Para Frontend HTML:

```
CONTEXTO: AHCS - aplicación de compresión Vitter.

ARCHIVO: views/index.html

PROPÓSITO: Página principal con interfaz de compresión interactiva.

SECCIONES REQUERIDAS:
1. Header: Título + descripción breve
2. Input Section: 
   - Textarea id="inputText" para entrada
   - Botón id="compressBtn" para comprimir
3. Results (inicialmente hidden):
   - Metrics grid: originalSize, compressedSize, ratio, entropy, avgLength, shannon
   - Codes table: símbolo, frecuencia, código, longitud
   - Tree visualization: div id="treeVisualization"
   
REQUISITOS:
- Semantic HTML5
- Responsive (mobile-first)
- IDs para elementos que JS manipulará
- CSS classes descriptivas (no inline styles)
- Accesibilidad: labels, alt text

INTEGRACIÓN:
- Cargar D3.js desde CDN
- Script src="/js/main.js" (defer)

Estructura simple, una página, sin frameworks.
```

### Para JavaScript Cliente:

```
CONTEXTO: AHCS frontend - conectar con backend Vitter.

ARCHIVO: public/js/main.js

PROPÓSITO: Lógica principal de interacción usuario → API.

FUNCIONALIDADES:
1. Event: Click compressBtn → validar → fetch POST /api/compress
2. Parsear respuesta JSON
3. Actualizar DOM: metrics, tabla códigos, árbol
4. Manejo de errores: mostrar alert si falla

FUNCIONES REQUERIDAS:
- handleCompress(): Evento click, valida input, llama API
- updateMetrics(data): Rellena div de métricas
- updateCodesTable(codes, frequencies): Rellena tabla
- handleError(error): Muestra error en UI

PARÁMETROS API:
- POST /api/compress: { text: string }
- Respuesta: { success, data: { metrics, codes, frequencies, compressed } }

VALIDACIONES:
- Text no vacío
- Max 1MB

Usa vanilla JS, sin jQuery.
```

### Para CSS:

```
CONTEXTO: AHCS - estilos profesionales y responsivos.

ARCHIVO: public/css/styles.css

PROPÓSITO: Diseño completo de interfaz.

SECCIONES A ESTILIZAR:
1. Body/General: fuente, colores base, background
2. Header: título, descripción
3. Input Section: textarea, botón
4. Metrics Grid: 6 cards, colores diferenciados (highlight ratio)
5. Codes Table: border-collapse, striped rows
6. Tree Container: altura 600px, scroll si necesario
7. Responsive: mobile (<768px) stack vertical

VARIABLES CSS:
--primary: #4dabf7 (azul)
--success: #51cf66 (verde)
--error: #ff6b6b (rojo)
--text: #222
--bg: #f8f9fa

ANIMACIONES:
- Button hover: scale 1.02
- Results aparecer: fade-in 0.3s

Mobile-first, sin Bootstrap.
```

---

## PROMPT FINAL PARA TODA UNA FASE

Si quieres generar múltiples archivos de una fase:

```
FASE: Backend API (compressionController + compressionRoutes + appConfig)

CONTEXTO: AHCS - Algoritmo Vitter listo, necesito exponer vía HTTP REST.

MODELOS DISPONIBLES:
- VitterEncoder: .encode(text) → { compressed, tree, originalSize, compressedSize, ratio }
- VitterDecoder: .decode(compressed, treeData) → string
- SourceAnalyzer: .calculateEntropy(frequencies), .calculateFrequencies(text)

ARCHIVOS A GENERAR:

1. config/appConfig.js
   - Export: puerto (3000), maxBodySize (5MB), corsOrigin ('*')

2. controllers/compressionController.js
   - Métodos: compress(req, res), decompress(req, res)
   - Ver detalles en template anterior

3. routes/compressionRoutes.js
   - POST /api/compress
   - POST /api/decompress
   - Ver template anterior

INTEGRACIÓN:
- app.js luego importará: compressionRoutes, appConfig
- Frontend luego llamará: POST /api/compress

Genera en orden, código limpio, sin explicaciones.
```

---

## CHECKLIST ANTES DE PEDIR CÓDIGO A COPILOT

✅ ¿Tengo claro el propósito del archivo?
✅ ¿Conozco sus dependencias con otros módulos?
✅ ¿Sé qué debe exportar?
✅ ¿Tengo ejemplos de input/output?
✅ ¿Usaré modules ES6?
✅ ¿Reutilizaré código existente (no reimplementar)?
✅ ¿Seguiré convenciones del proyecto?

Si respondiste "no" a algo → **Define eso primero en el prompt**

---

## CIERRE: INSTRUCCIÓN FINAL PARA COPILOT

Incluye esto al final de CUALQUIER prompt:

```
INSTRUCCIONES FINALES:
1. Código limpio, profesional, production-ready
2. Sin explicaciones: solo código + comentarios técnicos
3. Completo: no dejes TODOs ni placeholders
4. Testeado mentalmente: aunque sea, valida lógica
5. Sigue EXACTAMENTE las convenciones mencionadas
6. Si hay ambigüedad: elige la opción más simple
7. NO agregues features extras no pedidas
8. Formato: código puro, no markdown code blocks si es posible
```

---

## TEMPLATE RÁPIDO (Copiar y pegar)

```
PROYECTO: AHCS (Adaptive Huffman Compression Suite)
ARCHIVO: [RUTA/ARCHIVO.js]
PROPÓSITO: [QUÉ DEBE HACER]
CONVENCIONES: ES6 modules, 2 espacios indent, JSDoc, reutilizar modelos
MÉTODOS: [LISTA DE MÉTODOS CON PARÁMETROS Y RETORNO]
EJEMPLO DE SALIDA: [FORMATO JSON O ESTRUCTURA]
DEPENDENCIAS: [QUÉ IMPORTAR]
NOTAS: [CONSIDERACIONES ESPECIALES]
Genera solo código.
```

Cópialo, adapta los campos, y pasa a Copilot. ✅
