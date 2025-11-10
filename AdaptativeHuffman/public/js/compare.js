document.addEventListener('DOMContentLoaded', function(){
  const fileInput = document.getElementById('fileInput');
  const textInput = document.getElementById('textInput');
  const btnRun = document.getElementById('btnRun');
  const btnClear = document.getElementById('btnClear');
  const huffmanMetrics = document.getElementById('huffmanMetrics');
  const vitterMetrics = document.getElementById('vitterMetrics');
  const huffmanTree = document.getElementById('huffmanTree');
  const vitterTree = document.getElementById('vitterTree');
  const huffmanRoot = document.getElementById('huffmanRoot');
  const vitterRoot = document.getElementById('vitterRoot');

  // zoom controls
  const hufZoomIn = document.getElementById('hufZoomIn');
  const hufZoomOut = document.getElementById('hufZoomOut');
  const hufZoomReset = document.getElementById('hufZoomReset');
  const hufScaleLabel = document.getElementById('hufScale');
  const vitZoomIn = document.getElementById('vitZoomIn');
  const vitZoomOut = document.getElementById('vitZoomOut');
  const vitZoomReset = document.getElementById('vitZoomReset');
  const vitScaleLabel = document.getElementById('vitScale');

  let hufScale = 1; const HUF_MIN = 0.2, HUF_MAX = 3.0;
  let vitScale = 1; const VIT_MIN = 0.2, VIT_MAX = 3.0;

  function setHufScale(s){ hufScale = Math.max(HUF_MIN, Math.min(HUF_MAX, s)); if(huffmanRoot) huffmanRoot.style.transform = `scale(${hufScale})`; if(hufScaleLabel) hufScaleLabel.textContent = Math.round(hufScale*100)+"%"; }
  function setVitScale(s){ vitScale = Math.max(VIT_MIN, Math.min(VIT_MAX, s)); if(vitterRoot) vitterRoot.style.transform = `scale(${vitScale})`; if(vitScaleLabel) vitScaleLabel.textContent = Math.round(vitScale*100)+"%"; }

  function fitToFrame(rootEl, frameEl, setScaleFn, minScale=0.2){
    if(!rootEl || !frameEl) return;
    // Reset transform to measure real width
    rootEl.style.transform = 'scale(1)';
    const contentWidth = rootEl.scrollWidth || rootEl.getBoundingClientRect().width || 1;
    const frameWidth = frameEl.clientWidth || 1;
    const target = Math.min(1, Math.max(minScale, (frameWidth - 24) / contentWidth));
    setScaleFn(target);
  }

  function renderTreeToElem(node, container){
    container.innerHTML = '';
    // Prefer the shared renderer if available (keeps consistent look & behavior)
    try {
      if (typeof window !== 'undefined' && typeof window.createNodeElem === 'function') {
        // build a codes map for static Huffman if provided; for Vitter we'll derive codes from tree
        let codes = null;
        try { if (node && node.left !== undefined) { /* tree-like */ } } catch(e){}
        const dom = window.createNodeElem(node, codes, 0, '');
        dom.style.width = '100%';
        container.appendChild(dom);
      } else {
        // fallback: simple inline renderer
        function getNodeSymbol(n){ if(!n || typeof n !== 'object') return null; if (n.symbol != null) return n.symbol; if (n.value != null) return n.value; if (n.sym != null) return n.sym; if (n.char != null) return n.char; return null; }
        function displayableCharFor(sym){ if (sym == null) return ''; if (typeof sym === 'number' && Number.isInteger(sym) && sym >= 32 && sym <= 126) return String.fromCharCode(sym); if (typeof sym === 'string' && sym.length === 1) return sym; return String(sym); }
        function walk(n){ if(!n) { const d = document.createElement('div'); d.style.opacity='0.4'; d.textContent='(null)'; return d; } const el = document.createElement('div'); el.style.border='0'; el.style.padding='4px'; const nodeSym = getNodeSymbol(n); if(nodeSym != null){ const s = document.createElement('div'); s.textContent = displayableCharFor(nodeSym); s.style.fontWeight='700'; el.appendChild(s); const w = document.createElement('div'); w.textContent='w='+n.weight; w.style.color='#666'; el.appendChild(w); return el; } const root = document.createElement('div'); root.style.display='flex'; root.style.flexDirection='column'; root.style.alignItems='center'; const lbl = document.createElement('div'); lbl.textContent='•'; lbl.style.width='36px'; lbl.style.height='36px'; lbl.style.borderRadius='50%'; lbl.style.background='#111827'; lbl.style.color='#fff'; lbl.style.display='flex'; lbl.style.alignItems='center'; lbl.style.justifyContent='center'; lbl.style.fontWeight='700'; root.appendChild(lbl); const row = document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.width='100%'; row.style.marginTop='8px'; const left = document.createElement('div'); left.style.flex='1'; left.style.display='flex'; left.style.justifyContent='center'; left.appendChild(wrap(walk(n.left))); const right = document.createElement('div'); right.style.flex='1'; right.style.display='flex'; right.style.justifyContent='center'; right.appendChild(wrap(walk(n.right))); row.appendChild(left); row.appendChild(right); root.appendChild(row); return root; }
        function wrap(x){ const w = document.createElement('div'); w.style.padding='4px'; w.appendChild(x); return w; }
        container.appendChild(walk(node));
      }
    } catch (e) {
      container.textContent = JSON.stringify(node);
    }
     // After rendering, try to auto-fit into parent frame
     try {
       if (container === huffmanRoot) setTimeout(()=> fitToFrame(huffmanRoot, huffmanTree, setHufScale, HUF_MIN), 20);
       if (container === vitterRoot) setTimeout(()=> fitToFrame(vitterRoot, vitterTree, setVitScale, VIT_MIN), 20);
     } catch(e){}
  }

  // recompute fit on resize
  window.addEventListener('resize', ()=>{
    try{ fitToFrame(huffmanRoot, huffmanTree, setHufScale, HUF_MIN); }catch(e){}
    try{ fitToFrame(vitterRoot, vitterTree, setVitScale, VIT_MIN); }catch(e){}
  });

  async function doCompare(source, file) {
    const form = new FormData();
    if (file) form.append('file', file);
    else form.append('source', source);
    const res = await fetch('/api/compare', { method: 'POST', body: form });
    if (!res.ok) {
      const txt = await res.text(); alert('Error: '+res.status+' '+txt); return null;
    }
    return await res.json();
  }

  btnRun.addEventListener('click', async ()=>{
    btnRun.disabled = true; btnRun.textContent = 'Comparando...';
    huffmanMetrics.textContent = '(cargando)'; vitterMetrics.textContent='(cargando)'; huffmanRoot.textContent='(cargando)'; vitterRoot.textContent='(cargando)';
    try {
      const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      const source = textInput.value || '';
      const payload = await doCompare(source, file);
      if (!payload || !payload.success) { alert('Error en la petición'); return; }
      const data = payload.data;
      // Huffman
      huffmanMetrics.innerHTML = '';
      const h = data.huffman;
      huffmanMetrics.innerHTML = `<div>Original bytes: ${h.originalBytes}</div><div>Compressed bytes: ${h.compressedBytes}</div><div>Compressed bits: ${h.compressedBits}</div><div>Entropy (bits/symbol): ${Number(h.entropy).toFixed(4)}</div>`;
      // Vitter
      vitterMetrics.innerHTML = '';
      const v = data.vitter;
      vitterMetrics.innerHTML = `<div>Original bytes: ${v.originalBytes}</div><div>Compressed bytes: ${v.compressedBytes}</div><div>Compressed bits: ${v.compressedBits}</div><div>Entropy (bits/symbol): ${Number(v.entropy).toFixed(4)}</div>`;
      // Trees into the inner root containers
      try { renderTreeToElem(h.tree, huffmanRoot); } catch(e){ huffmanRoot.textContent = JSON.stringify(h.tree); }
      try { renderTreeToElem(v.tree, vitterRoot); } catch(e){ vitterRoot.textContent = JSON.stringify(v.tree); }
    } catch (err) {
      alert('Error: '+err.message);
    } finally {
      btnRun.disabled = false; btnRun.textContent = 'Comparar';
    }
  });

  btnClear.addEventListener('click', ()=>{
    textInput.value = ''; fileInput.value = null; huffmanMetrics.textContent='(sin datos)'; vitterMetrics.textContent='(sin datos)'; huffmanRoot.textContent='(árbol Huffman aquí)'; vitterRoot.textContent='(árbol Vitter aquí)';
  });

  // wire zoom buttons
  if(hufZoomIn) hufZoomIn.addEventListener('click', ()=> setHufScale(hufScale + 0.15));
  if(hufZoomOut) hufZoomOut.addEventListener('click', ()=> setHufScale(hufScale - 0.15));
  if(hufZoomReset) hufZoomReset.addEventListener('click', ()=> setHufScale(1));
  if(vitZoomIn) vitZoomIn.addEventListener('click', ()=> setVitScale(vitScale + 0.15));
  if(vitZoomOut) vitZoomOut.addEventListener('click', ()=> setVitScale(vitScale - 0.15));
  if(vitZoomReset) vitZoomReset.addEventListener('click', ()=> setVitScale(1));

  // initial scales show
  setHufScale(1); setVitScale(1);
});
