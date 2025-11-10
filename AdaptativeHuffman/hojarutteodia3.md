# Hoja de ruta (día de trabajo) — Traducción y formato en español

Resumen breve

Este documento ordena las recomendaciones del profesor por relevancia y complejidad, y propone una hoja de ruta paso a paso para implementar el mayor número posible de mejoras en una jornada de trabajo (~6–8 horas).

Checklist de lo que incluiré

- [ ] Mejorar visibilidad del árbol y ocultar nodos `null`.
- [ ] Resaltar el ratio de compresión en el output y añadir un toggle de debug.
- [ ] Añadir subida de archivos y generación de archivos comprimidos/descomprimidos descargables.
- [ ] Gráficas comparativas entre Huffman clásico y Vitter (métricas básicas).
- [ ] Preprocesamiento según el tipo de archivo (texto, vídeo, binario).
- [ ] Panel de debug con metadatos e información intermedia.
- [ ] Página principal (home) explicativa para la presentación.

Prioridad (relevancia | complejidad | tiempo estimado)

1. Mejorar visibilidad del árbol y ocultar nodos `null` | Alta | Baja | 1.0–1.5 h
2. Resaltar ratio de compresión + toggle de debug | Alta | Baja | 0.75–1.0 h
3. Subida de archivos y generación de archivos descargables | Alta | Media | 1.0–1.5 h
4. Gráficas comparativas Huffman vs Vitter (métricas básicas) | Alta | Media | 1.0–1.5 h
5. Preprocesamiento por tipo de archivo (vídeos, binarios) | Media | Media | 0.75–1.0 h
6. Panel debug con datos intermedios | Media | Baja | 0.5 h
7. Página principal explicativa | Media | Baja | 0.5–1.0 h

Hoja de ruta detallada (por pasos y bloques temporales)

Inicio (0:00–0:15)
- Preparación: abrir el repositorio, crear rama de trabajo (por ejemplo `feat/ui-debug-upload`), arrancar la app en modo desarrollo y ejecutar tests existentes rápidos.

Paso 1 — Mejorar visibilidad del árbol y ocultar `null` (0:15–1:30)
- UI: aumentar contraste, tamaño de nodos, fuentes y separación en `treeRenderer` (CSS/SVG). Ajustar colores para presentación.
- Lógica: filtrar nodos con `value == null` en el renderer o representarlos como hojas colapsadas sin etiqueta `null`.
- Pruebas rápidas con entradas de ejemplo y comprobación visual en `templates/tree-visualiization.html`.

Checkpoint: El árbol es más legible y no muestra valores `null` visibles.   

Paso 2 — Resaltar ratio de compresión y añadir toggle de debug (1:30–2:15)
- Backend/Front: actualizar la tarjeta resumen para mostrar claramente: tamaño original (bytes), tamaño comprimido (bytes), ratio de compresión (compressed / original) y porcentaje ahorrado.
- UI: colocar un botón o switch “Mostrar detalle / Debug” que despliegue una sección colapsable con: tabla de frecuencias, entropía, longitudes de códigos, texto/preprocesado usado, tiempos de ejecución.

Checkpoint: Resumen con ratios visible y toggle que muestra detalles adicionales.

Paso 3 — Subida de archivos y generación de archivos descargables (2:15–3:45)
- Backend: añadir una ruta de upload (ej: `POST /compress/upload`) usando el manejador de archivos del proyecto (`services/fileHandler.js`) o un middleware ligero (en Node, `multer` si se necesita).
- Reutilizar el preprocesado y el encoder (Vitter/Huffman) para producir un buffer comprimido y devolverlo como attachment con cabeceras apropiadas (`Content-Disposition: attachment; filename="archivo.ext.vitt"`).
- Añadir ruta de descompresión que reciba el archivo comprimido y devuelva el original.
- Frontend: formulario de subida con indicador de progreso y enlace de descarga al terminar.

Checkpoint: Subir un archivo y obtener un archivo comprimido descargable.

Pausa breve (3:45–4:00)

Paso 4 — Gráficas comparativas: Huffman vs Vitter (4:00–5:15)
- Backend: ejecutar ambos algoritmos sobre la misma entrada y recopilar métricas: tamaño comprimido, longitud media de código, tiempo de encoding, entropía y diferencia frente a la entropía.
- Frontend: usar una librería de gráficos ya incluida (si existe) o Chart.js para mostrar barras comparativas y, opcionalmente, una pequeña serie temporal o radar.
- Empieza con métricas agregadas para mantenerlo rápido (sin per-símbolo inicialmente).

Checkpoint: Gráfica con métricas comparativas visibles para la misma entrada.

Paso 5 — Preprocesamiento por tipo de archivo (5:15–6:00)
- Detección: usar extensión MIME o heurística por contenido para decidir el preprocesamiento.
- Reglas propuestas:
  - Vídeo/binario: tratar como bytes crudos (no normalizar texto), procesar en bloques (chunking) si el archivo es grande; considerar muestreo para métricas si supera un umbral.
  - Texto: normalizar saltos de línea, eliminar caracteres de control irrelevantes, opcionalmente tokenizar (palabras) para mejorar compresión en textos largos.
- Registrar el método de preprocesado elegido en la salida y en el panel de debug.

Checkpoint: Se aplica un preprocesado diferente y queda registrado en la salida.

Paso 6 — Pulir panel de debug y esqueleto de homepage (6:00–6:45)
- Panel de debug: listar tabla de frecuencias, entropía calculada, tabla de códigos, tiempos (encoding/decoding), y cualquier transformación de preprocesado.
- Homepage: crear una sección simple y directa que explique brevemente cómo funciona la app, diferencias entre Huffman y Vitter, y cómo interpretar resultados/gráficas. Prepararla para la exposición.

Final checks (6:45–7:00)
- Tests rápidos: probar con archivos pequeños de texto y binarios, verificar que no hay errores críticos.
- Commit y push a la rama creada.

Si sobra tiempo
- Añadir detalle por símbolo en las gráficas (longitudes de códigos por símbolo), mejoras de UI/UX, límites de tamaño de archivos y streaming para archivos grandes.

Entregables esperados al final del día

- Rama con mejoras visibles: árbol más legible y sin `null` visibles.
- Resumen que enfatiza ratio de compresión y toggle de debug funcional.
- Formulario de subida y descarga de archivos comprimidos/descomprimidos.
- Gráficas comparativas básicas Huffman vs Vitter.
- Preprocesado según tipo de archivo registrado en salida y debug.
- Panel de debug con metadatos e información intermedia.
- Borrador de la página principal explicativa para la presentación.

Matriz rápida de cobertura de requisitos (relevante para el profesor)

- Visibilidad árbol y `null`: Hecho/Planeado — Alta prioridad.
- Output con ratio y debug toggle: Hecho/Planeado — Alta prioridad.
- Upload/download de archivos: Hecho/Planeado — Alta prioridad.
- Gráficas comparativas: Hecho/Planeado — Alta prioridad.
- Preprocesado por tipo: Planeado — Media prioridad.
- Panel debug completo: Planeado — Media prioridad.
- Home explicativa: Planeado — Media prioridad.

Notas y supuestos mínimos

- Asumo que el proyecto es una aplicación Node/Express con frontend estático (por la estructura del workspace). Si prefieres otro enfoque o quieres que implemente ya cambios concretos en código (por ejemplo editar `treeRenderer` o añadir rutas), dime y los aplicaré en los archivos correspondientes.
- Si quieres que empiece ahora a implementar algunos pasos (p. ej. ocultar `null` en el renderer o cambiar la tarjeta resumen), indícame y haré los cambios en los archivos del repositorio.

---

Fecha de actualización: 2025-11-04
