(function(){
  function $id(id){return document.getElementById(id)}
  const srcEl = $id('guideSource');
  const btn = $id('btnCalc');
  const btnClear = $id('btnClear');
  const steps = $id('steps');
  const fileInput = $id('fileInput');
  const btnCompressFile = $id('btnCompressFile');
  const btnDecompressFile = $id('btnDecompressFile');
  const btnUploadEntropy = $id('btnUploadEntropy');
  const fileStatus = $id('fileStatus');
  // removed btnCompressSource per user request (button removed from HTML)

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  async function calculateStepsServer(text){
    try {
      const r = await fetch('/entropy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: text }) });
      if (!r.ok) return null;
      const j = await r.json();
      // server returns processedText, processedLength, frequencies, entropyBitsPerSymbol
      return {
        cleaned: j.processedText || text,
        total: j.processedLength || (j.processedText ? j.processedText.length : text.length),
        freqs: j.frequencies || {},
        probs: null,
        contributions: null,
        entropy: j.entropyBitsPerSymbol || 0
      };
    } catch (e) { return null; }
  }

  // fallback client calculation (same as previous)
  function calculateStepsClient(text){
    const cleaned = text;
    const freqs = {};
    for(const ch of cleaned) freqs[ch]=(freqs[ch]||0)+1;
    const total = cleaned.length;
    const probs = {};
    for(const k of Object.keys(freqs)) probs[k]=freqs[k]/total;
    const contributions = {};
    let entropy = 0;
    for(const k of Object.keys(probs)){
      const p = probs[k];
      const c = - p * Math.log2(p);
      contributions[k]=c;
      entropy += c;
    }
    return { cleaned, total, freqs, probs, contributions, entropy };
  }

  function renderSteps(result){
    // Simpler renderer: show full source and full frequency table by default,
    // and add a Mostrar/Ocultar toggle button to the right of each section title.
    steps.innerHTML = '';
    const { cleaned = '', total = 0, freqs = {}, probs = null, contributions = null, entropy = 0 } = result || {};

    // Source section
    const srcSection = document.createElement('div');
    const srcHeader = document.createElement('div'); srcHeader.style.display = 'flex'; srcHeader.style.justifyContent = 'space-between'; srcHeader.style.alignItems = 'center';
    const srcTitle = document.createElement('h4'); srcTitle.textContent = 'Fuente (texto)';
    const srcToggle = document.createElement('button'); srcToggle.className = 'btn ghost'; srcToggle.textContent = 'Ocultar';
    srcHeader.appendChild(srcTitle); srcHeader.appendChild(srcToggle);
    const srcContent = document.createElement('pre'); srcContent.className = 'step-info'; srcContent.textContent = cleaned || '';
    srcSection.appendChild(srcHeader); srcSection.appendChild(srcContent);
    steps.appendChild(srcSection);

    // Entropy block (keep as before)
    const ent = document.createElement('div'); ent.className = 'entropy-result';
    ent.innerHTML = `<div class="entropy-label">Entropía media</div><div class="entropy-value">${(entropy||0).toFixed(6)}</div><div class="entropy-description">bits por símbolo</div>`;
    steps.appendChild(ent);

    // Frequencies section
    const freqSection = document.createElement('div');
    const freqHeader = document.createElement('div'); freqHeader.style.display = 'flex'; freqHeader.style.justifyContent = 'space-between'; freqHeader.style.alignItems = 'center';
    const freqTitle = document.createElement('h4'); freqTitle.textContent = 'Frecuencias';
    const freqToggle = document.createElement('button'); freqToggle.className = 'btn ghost'; freqToggle.textContent = 'Ocultar';
    freqHeader.appendChild(freqTitle); freqHeader.appendChild(freqToggle);
    const table = document.createElement('table');
    const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>Símbolo</th><th>Frecuencia</th><th>Probabilidad</th><th>Contribución</th><th>Acción</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    const keys = Object.keys(freqs).sort((a,b)=> (freqs[b]-freqs[a]));
    for(const k of keys){
      const tr = document.createElement('tr');
      // normalize key to displayable char
      let symbolChar = k;
      if (/^\d+$/.test(k)) symbolChar = String.fromCharCode(Number(k));
      else if (k === '\\n') symbolChar = '\n';
      else if (k === '[space]') symbolChar = ' ';
      const display = (symbolChar === '\n') ? '\\n' : (symbolChar === ' ') ? '[space]' : symbolChar;
      const pval = probs && probs[k] != null ? probs[k] : (total ? (freqs[k]/total) : 0);
      const cval = contributions && contributions[k] != null ? contributions[k] : (-pval * Math.log2(pval || 1));
      tr.innerHTML = `<td><code>${escapeHtml(String(display))}</code></td><td>${freqs[k]}</td><td>${pval.toFixed(6)}</td><td>${cval.toFixed(6)}</td>`;
      const tdAct = document.createElement('td');
      const btnC = document.createElement('button'); btnC.className='btn ghost'; btnC.style.fontSize='0.85rem'; btnC.textContent = '📦 Comprimir símbolo';
      btnC.addEventListener('click', async ()=>{
        fileStatus.textContent = 'Comprimiendo símbolo...';
        try{
          const ch = symbolChar;
          const r = await fetch('/compress', { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ data: ch }) });
          if(!r.ok){ const t = await r.text().catch(()=>r.statusText||String(r.status)); fileStatus.textContent='Error: '+t; return; }
          const j = await r.json(); if(!j || !j.compressedBase64){ fileStatus.textContent='Respuesta inválida'; return; }
          const bin = atob(j.compressedBase64); const len = bin.length; const bytes = new Uint8Array(len); for(let i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'application/octet-stream' }); const fname = `symbol_${encodeURIComponent(display)}.vitt`;
          const a = document.createElement('a'); const urlObj = URL.createObjectURL(blob); a.href=urlObj; a.download=fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(urlObj),4000);
          fileStatus.textContent = 'Descarga iniciada: '+fname;
        }catch(err){ fileStatus.textContent = 'Error: '+String(err && err.message?err.message:err); }
      });
      tdAct.appendChild(btnC); tr.appendChild(tdAct);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    freqSection.appendChild(freqHeader); freqSection.appendChild(table);
    steps.appendChild(freqSection);

    // Toggle handlers: hide/show content and flip button text
    srcToggle.addEventListener('click', ()=>{
      const hidden = srcContent.style.display === 'none';
      srcContent.style.display = hidden ? '' : 'none';
      srcToggle.textContent = hidden ? 'Ocultar' : 'Mostrar';
    });
    freqToggle.addEventListener('click', ()=>{
      const hidden = table.style.display === 'none';
      table.style.display = hidden ? '' : 'none';
      freqToggle.textContent = hidden ? 'Ocultar' : 'Mostrar';
    });
  }

  // Helper: POST a file to server and trigger download of response
  async function postFileAndDownload(url, file) {
    if(!file) return { ok:false, msg: 'No file' };
    const form = new FormData(); form.append('file', file, file.name);
    fileStatus.textContent = 'Subiendo...';
    const r = await fetch(url, { method: 'POST', body: form });
    if(!r.ok){ const txt = await r.text().catch(()=>r.statusText||String(r.status)); fileStatus.textContent = 'Error: '+txt; return { ok:false, msg:txt } }
    const blob = await r.blob();
    // try extract filename from Content-Disposition
    const cd = r.headers.get('Content-Disposition') || '';
    let filename = file.name;
    const m = /filename="?([^";]+)"?/.exec(cd);
    if(m && m[1]) filename = m[1];
    // trigger download
    const link = document.createElement('a');
    const urlObj = window.URL.createObjectURL(blob);
    link.href = urlObj; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(()=> window.URL.revokeObjectURL(urlObj), 4000);
    fileStatus.textContent = 'Descarga iniciada: '+filename;
    return { ok:true };
  }

  btn.addEventListener('click', async ()=>{
    const text = srcEl.value || '';
    if(text.length===0){ steps.innerHTML = '<div class="result-box error">Introducir texto para calcular</div>'; return }
    // try server-side calculation first
    steps.innerHTML = '<div class="small">Calculando en servidor...</div>';
    const serverRes = await calculateStepsServer(text);
    if(serverRes){
      // serverRes may lack probs/contributions; compute those locally if needed
      if(!serverRes.probs || !serverRes.contributions){
        const local = calculateStepsClient(serverRes.cleaned);
        serverRes.probs = local.probs;
        serverRes.contributions = local.contributions;
      }
      renderSteps(serverRes);
    } else {
      // fallback to client calculation
      const res = calculateStepsClient(text);
      renderSteps(res);
    }
  });

  btnClear.addEventListener('click', ()=>{ srcEl.value=''; steps.innerHTML=''; });

  // File upload buttons
  if (btnUploadEntropy && fileInput) btnUploadEntropy.addEventListener('click', async () => {
    if(!fileInput.files || fileInput.files.length === 0){ fileStatus.textContent = 'Selecciona un archivo primero'; return; }
    const file = fileInput.files[0];
    try {
      fileStatus.textContent = 'Subiendo y analizando...';
      const form = new FormData(); form.append('file', file, file.name);
      const r = await fetch('/entropy', { method: 'POST', body: form });
      if(!r.ok){ const t = await r.text().catch(()=>r.statusText||String(r.status)); fileStatus.textContent = 'Error: '+t; return; }
      const j = await r.json();
      // Build result for renderer
      const cleaned = (typeof j.processedText === 'string') ? j.processedText : (typeof j.processedText === 'undefined' ? String(j.processedText||'') : String(j.processedText));
      const freqs = j.frequencies || {};
      const total = j.processedLength || (cleaned ? cleaned.length : Object.values(freqs).reduce((a,b)=>a+b,0));
      const entropyVal = (typeof j.entropyBitsPerSymbol === 'number') ? j.entropyBitsPerSymbol : 0;
      // compute probs/contributions locally from freqs if needed
      const probs = {};
      const contributions = {};
      for(const k of Object.keys(freqs)){
        const p = total? (freqs[k]/total) : 0;
        probs[k]=p; contributions[k]= - p * Math.log2(p || 1);
      }
      const resObj = { cleaned: cleaned || '', total, freqs, probs, contributions, entropy: entropyVal };
      renderSteps(resObj);
      fileStatus.textContent = 'Análisis completado';
    } catch (err) {
      fileStatus.textContent = 'Error: '+String(err && err.message?err.message:err);
    }
  });
  if(btnCompressFile && fileInput) btnCompressFile.addEventListener('click', async ()=>{
    if(!fileInput.files || fileInput.files.length===0){ fileStatus.textContent='Selecciona un archivo primero'; return }
    const file = fileInput.files[0];
    await postFileAndDownload('/compress/upload', file);
  });
  if(btnDecompressFile && fileInput) btnDecompressFile.addEventListener('click', async ()=>{
    if(!fileInput.files || fileInput.files.length===0){ fileStatus.textContent='Selecciona un archivo primero'; return }
    const file = fileInput.files[0];
    await postFileAndDownload('/decompress/upload', file);
  });
  // (Compress-source button removed) no handler here.

})();
