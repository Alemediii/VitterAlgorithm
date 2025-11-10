(function(){
  // Minimal, robust tree renderer for the visualization page
  function $id(id){ return document.getElementById(id); }

  const sourceInput = $id('sourceInput');
  const btnGenerate = $id('btnGenerate');
  const treeRoot = $id('treeRoot');
  // optional placeholder element (some templates use #treePlaceholder)
  const treePlaceholder = $id('treePlaceholder');
  const treeViewport = $id('treeViewport');
  const treeStatus = $id('treeStatus');
  const codesTable = $id('codesTable');
  const compressOutput = $id('compressOutput');
  const btnCoDeOut = $id('btnCoDeOut');
  const btnEntropyGuide = $id('btnEntropyGuide');
  const btnToggleDebug = $id('btnToggleDebug');
  const debugDetails = $id('debugDetails');
  const debugTimings = $id('debugTimings');
  const ratioValueEl = $id('ratioValue');
  const btnZoomIn = $id('btnZoomIn');
  const btnZoomOut = $id('btnZoomOut');
  const btnZoomReset = $id('btnZoomReset');
  const scaleValueEl = $id('scaleValue');

  let scale = 1; const MIN_SCALE = 0.25; const MAX_SCALE = 2.5;
  function setScale(s){ scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)); if(treeRoot) treeRoot.style.transform = `scale(${scale})`; if(scaleValueEl) scaleValueEl.textContent = Math.round(scale*100)+"%"; }
  if(btnZoomIn) btnZoomIn.addEventListener('click', ()=>setScale(scale+0.15));
  if(btnZoomOut) btnZoomOut.addEventListener('click', ()=>setScale(scale-0.15));
  if(btnZoomReset) btnZoomReset.addEventListener('click', ()=>setScale(1));

  function clearCodesTable(){ if(!codesTable) return; const tb = codesTable.querySelector('tbody'); if(!tb) return; tb.innerHTML = '<tr><td colspan="4">(sin datos)</td></tr>'; }
  function populateCodesTable(codes, freqs){
    if(!codesTable) return;
    const tb = codesTable.querySelector('tbody');
    if(!tb) return;
    tb.innerHTML = '';
    if(!codes || Object.keys(codes).length===0){ tb.innerHTML = '<tr><td colspan="4">(sin datos)</td></tr>'; return; }
    for(const sym of Object.keys(codes)){
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      // prefer printable representation
      const display = (typeof displayableCharFor === 'function') ? displayableCharFor(sym) : sym;
      td1.textContent = display;
      const td2 = document.createElement('td'); td2.textContent = codes[sym];
      const td3 = document.createElement('td'); td3.textContent = (freqs && freqs[sym])? freqs[sym] : '-';
      const td4 = document.createElement('td'); td4.textContent = codes[sym]? String(codes[sym].length) : '-';
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4);
      tb.appendChild(tr);
    }
  }

  function displayableCharFor(sym){ const n = Number(sym); if(!Number.isNaN(n) && Number.isInteger(n) && n>=32 && n<=126) return String.fromCharCode(n); if(typeof sym==='string' && sym.length===1) return sym; return sym; }

  // Robust symbol extractor: some backends use `symbol`, `value`, `sym` or `char`.
  function getNodeSymbol(node){
    if(!node || typeof node !== 'object') return null;
    if (node.symbol != null) return node.symbol;
    if (node.value != null) return node.value;
    if (node.sym != null) return node.sym;
    if (node.char != null) return node.char;
    return null;
  }

  function createNodeElem(node, codesMap, depth=0, path=''){
    const w = document.createElement('div'); w.className='node'; w.dataset.depth = String(depth); w.dataset.path = path; w.style.display='flex'; w.style.flexDirection='column'; w.style.alignItems='center';
    if(!node){ const empty = document.createElement('div'); empty.className='emptyNode'; empty.textContent = path || ''; empty.style.opacity='0.25'; empty.style.minWidth='48px'; empty.style.minHeight='28px'; return empty; }
    const nodeSym = getNodeSymbol(node);
    // If nodeSym is null and weight is 0, consider it an NYT/placeholder: render a compact empty node (don't show 'null')
    if(nodeSym == null && node.weight === 0){ const empty = document.createElement('div'); empty.className='emptyNode'; empty.style.minWidth='36px'; empty.style.minHeight='24px'; empty.style.opacity='0.25'; return empty; }
    if(nodeSym != null){
      const label = document.createElement('div'); label.className='leafLabel';
      const sym = displayableCharFor(String(nodeSym));
      const symDiv = document.createElement('div'); symDiv.className='leafSym'; symDiv.textContent = sym;
      const codeDiv = document.createElement('div'); codeDiv.className='leafCode'; codeDiv.textContent = (codesMap && codesMap[String(nodeSym)])? codesMap[String(nodeSym)] : '';
      label.appendChild(symDiv); label.appendChild(codeDiv);
      const meta = document.createElement('div'); meta.className='nodeMeta'; meta.textContent = `w=${node.weight}`; meta.style.fontSize='0.8rem'; meta.style.color='#555'; meta.style.marginTop='6px';
      w.appendChild(label); w.appendChild(meta); return w;
    }
     // internal
     const il = document.createElement('div'); il.className='internalLabel'; il.textContent = path || '•'; il.style.width='44px'; il.style.height='44px'; il.style.display='inline-flex'; il.style.alignItems='center'; il.style.justifyContent='center'; il.style.borderRadius='50%'; il.style.background='#111827'; il.style.color='#fff'; il.style.fontWeight='700'; w.appendChild(il);
    const meta = document.createElement('div'); meta.className='nodeMeta'; meta.textContent = `w=${node.weight}`; meta.style.fontSize='0.8rem'; meta.style.color='#555'; meta.style.marginTop='6px'; w.appendChild(meta);
    const childrenRow = document.createElement('div'); childrenRow.className='childrenRow'; childrenRow.style.display='flex'; childrenRow.style.justifyContent='center'; childrenRow.style.width='100%'; childrenRow.style.marginTop='10px'; const left = document.createElement('div'); left.className='childSlot'; left.style.flex='1'; left.style.display='flex'; left.style.justifyContent='center'; const right = document.createElement('div'); right.className='childSlot'; right.style.flex='1'; right.style.display='flex'; right.style.justifyContent='center'; left.appendChild(node.left? createNodeElem(node.left,codesMap,depth+1, (path||'')+'0') : createNodeElem(null,codesMap,depth+1,(path||'')+'0')); right.appendChild(node.right? createNodeElem(node.right,codesMap,depth+1,(path||'')+'1') : createNodeElem(null,codesMap,depth+1,(path||'')+'1')); childrenRow.appendChild(left); childrenRow.appendChild(right); w.appendChild(childrenRow); return w; }

  // Expose utilities for other pages (compare) to reuse the same renderer and styles
  try {
    if (typeof window !== 'undefined') {
      window.createNodeElem = createNodeElem;
      window.getNodeSymbol = getNodeSymbol;
      window.displayableCharFor = displayableCharFor;
    }
  } catch (e) { /* ignore in non-browser envs */ }

  function computeAndSetLevelHeight(){ try{ if(!treeRoot) return; const nodes = treeRoot.querySelectorAll('.node[data-depth]'); let max=0; nodes.forEach(n=>{ const d=Number(n.dataset.depth||0); if(!Number.isNaN(d) && d>max) max=d; }); const base=110; const levelHeight = Math.max(80, Math.min(220, Math.round(base - Math.max(0,(max-3))*10))); treeRoot.style.setProperty('--levelHeight', levelHeight+'px'); }catch(e){} }

  function fitTreeToViewport(){ if(!treeRoot || !treeViewport) return; treeRoot.style.transform='scale(1)'; treeRoot.style.transition=''; const contentWidth = treeRoot.scrollWidth || treeRoot.getBoundingClientRect().width || 0; const viewportWidth = treeViewport.clientWidth || 1; if(contentWidth<=0) return setScale(1); const target = Math.min(1, (viewportWidth-24)/contentWidth); setScale(target); }

  async function fetchAndRender(source){ if(!source){ if(treeRoot) { treeRoot.innerHTML=''; treeRoot.appendChild(createNodeElem({order:512,weight:0,symbol:null,left:null,right:null},{})); computeAndSetLevelHeight(); fitTreeToViewport(); } if(treeStatus) treeStatus.textContent='Árbol vacío (NYT)'; clearCodesTable(); return; }
    if(treeStatus) treeStatus.textContent='Cargando...';
    if(treeRoot) treeRoot.textContent='Cargando...';
    clearCodesTable();
    try{
      const url = '/api/visualization/tree?source='+encodeURIComponent(source);
      console.debug('[treeRenderer] fetch start', url);
      const r = await fetch(url);
      if(!r.ok){ const err = await r.json().catch(()=>null); const msg = 'Error: '+(err && err.error? err.error : r.statusText||r.status); if(treeStatus) { treeStatus.textContent=msg; treeStatus.style.color='#d9534f'; } if(treeRoot) treeRoot.textContent=msg; return; }
      const j = await r.json();
      console.debug('[treeRenderer] response JSON', j);
       // permissive: some API responses may not include a `success` flag; we'll derive the tree below
       const tree = j && j.data && j.data.tree ? j.data.tree : (j && j.tree ? j.tree : null);
      console.debug('[treeRenderer] derived tree object', tree);
       const meta = j.data && j.data.meta ? j.data.meta : (j.meta || {});
      if(!tree || typeof tree!=='object'){
         // Render a local NYT empty root as fallback
         if (treeRoot) {
           treeRoot.innerHTML = '';
           treeRoot.appendChild(createNodeElem({order:512, weight:0, symbol:null, left:null, right:null}, {}));
           computeAndSetLevelHeight();
           setTimeout(() => fitTreeToViewport(), 20);
         }
         clearCodesTable();
         if (treeStatus) { treeStatus.textContent = 'Árbol vacío (NYT)'; treeStatus.style.color = '#6c757d'; }
         return;
       }
      // collect codes
      const codes = {};
      function collect(n,p){ if(!n) return; const s = getNodeSymbol(n); if(s != null){ codes[String(s)] = p||''; return; } collect(n.left,(p||'')+'0'); collect(n.right,(p||'')+'1'); }
      collect(tree,'');
      console.debug('[treeRenderer] collected codes', codes);
       // render
      if(treeRoot){ treeRoot.innerHTML=''; const dom = createNodeElem(tree,codes,0,''); dom.style.width='100%'; treeRoot.appendChild(dom); }
      else if(treePlaceholder){ treePlaceholder.innerHTML=''; const dom = createNodeElem(tree,codes,0,''); treePlaceholder.appendChild(dom); }
       computeAndSetLevelHeight(); setTimeout(()=>{ fitTreeToViewport(); },30);
       // populate codes table if exists
       // The backend feeds UTF-8 bytes into the Vitter tree, so build freqs keyed by byte value
       const freqs = {};
       try {
         if (typeof TextEncoder !== 'undefined') {
           const bytes = new TextEncoder().encode(source || '');
           for (let i = 0; i < bytes.length; i++) {
             const b = String(bytes[i]);
             freqs[b] = (freqs[b] || 0) + 1;
           }
         } else {
           // fallback for older envs: use charCode (may not match multi-byte utf-8)
           for (let i = 0; i < (source || '').length; i++) {
             const b = String((source || '').charCodeAt(i));
             freqs[b] = (freqs[b] || 0) + 1;
           }
         }
       } catch (err) {
         // fallback to naive char counting
         for (const ch of source) freqs[ch] = (freqs[ch] || 0) + 1;
       }
       console.debug('[treeRenderer] freqs', freqs);
       try {
         populateCodesTable(codes,freqs);
       } catch (err) {
         console.error('[treeRenderer] populateCodesTable error', err, {codes, freqs});
       }
      // show debug metadata and ratio if provided
      try{
        const metrics = (meta && (meta.metrics || meta)) || null;
        if(metrics){
          // metrics may contain originalBytes, compressedBytes, bitLength, compressionRatio
          const orig = metrics.originalBytes || metrics.original_size || metrics.inputBytes || metrics.input_size || null;
          const comp = metrics.compressedBytes || metrics.compressed_size || metrics.outputBytes || metrics.output_size || null;
          let ratioTxt = '—';
          if(orig && comp){
            const r = (comp/ orig);
            const saved = (1 - r) * 100;
            ratioTxt = `${orig} / ${comp} (${r.toFixed(3)}x - ${saved.toFixed(1)}% ahorro)`;
          }
        if(ratioValueEl) ratioValueEl.textContent = ratioTxt;
        }
       if(debugTimings && meta){ debugTimings.textContent = JSON.stringify(meta, null, 2); }
      }catch(e){ console.debug('debug meta write error', e); }
       if(treeStatus){ treeStatus.textContent='Árbol renderizado'; treeStatus.style.color='#28a745'; }
    }catch(e){ const msg = 'Error fetch: '+String(e); if(treeStatus){ treeStatus.textContent=msg; treeStatus.style.color='#d9534f'; } if(treeRoot) treeRoot.textContent=msg; }
  }

  // wire buttons
  if(btnGenerate && sourceInput) btnGenerate.addEventListener('click', ()=>{ fetchAndRender(sourceInput.value||''); });
  // on load sample
  if(sourceInput) sourceInput.value = sourceInput.value || 'ABRACADABRA'; if(sourceInput && sourceInput.value) fetchAndRender(sourceInput.value);

  // Co/De/Out & Entropy simple handlers: open in same tab with ?source= as fallback
  if(btnCoDeOut) btnCoDeOut.addEventListener('click', ()=>{ const s = sourceInput? sourceInput.value : ''; window.location.href = '/decoout' + (s? ('?source='+encodeURIComponent(s)) : ''); });
  if(btnEntropyGuide) btnEntropyGuide.addEventListener('click', ()=>{ const s = sourceInput? sourceInput.value : ''; window.location.href = '/entropy/guide' + (s? ('?source='+encodeURIComponent(s)) : ''); });
  // Toggle debug details panel
  if(btnToggleDebug && debugDetails){
    btnToggleDebug.addEventListener('click', ()=>{
      const shown = debugDetails.style.display !== 'block';
      debugDetails.style.display = shown ? 'block' : 'none';
      btnToggleDebug.textContent = shown ? 'Ocultar debug' : 'Mostrar debug';
    });
  }

})();
