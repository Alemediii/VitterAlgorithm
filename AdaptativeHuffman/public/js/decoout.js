(function(){
  function $id(id){return document.getElementById(id)}
  const inCompress = $id('decoCompressInput');
  const btnCompress = $id('decoCompressBtn');
  const btnCopy = $id('decoCopyCompressed');
  const inDecompress = $id('decoDecompressInput');
  const btnDecompress = $id('decoDecompressBtn');
  const btnPaste = $id('decoPasteCompressed');
  const out = $id('decoOutput');
  const decoOriginalBytes = $id('decoOriginalBytes');
  const decoCompressedBytes = $id('decoCompressedBytes');
  const decoRatio = $id('decoRatio');
  const decoSavings = $id('decoSavings');
  const decoCompressedText = $id('decoCompressedText');

  // file upload elements
  const compressFileInput = $id('compressFileInput');
  const compressFileBtn = $id('compressFileBtn');
  const compressFileLink = $id('compressFileLink');
  const decompressFileInput = $id('decompressFileInput');
  const decompressFileBtn = $id('decompressFileBtn');
  const decompressFileLink = $id('decompressFileLink');

  let lastCompressed = null;

  async function postJson(url, body){
    const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j = await r.json().catch(()=>null);
    return { ok: r.ok, status: r.status, json: j };
  }

  async function postFileAndGetBlob(url, file){
    const fd = new FormData();
    fd.append('file', file, file.name);
    const r = await fetch(url, { method: 'POST', body: fd });
    if (!r.ok) {
      const txt = await r.text().catch(()=>null);
      throw new Error('Upload failed: ' + (txt || r.status));
    }
    const blob = await r.blob();
    const disp = r.headers.get('Content-Disposition') || '';
    let filename = 'download.bin';
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(disp);
    if (m) filename = decodeURIComponent(m[1] || m[2]);
    return { blob, filename };
  }

  btnCompress && btnCompress.addEventListener('click', async ()=>{
    const data = inCompress.value || '';
    out.textContent = 'compressing...';
    try{
      const res = await postJson('/compress',{data});
      if(!res.ok){ out.textContent = 'error: '+JSON.stringify(res.json); return }
      lastCompressed = res.json && (res.json.compressedBase64 || (res.json.data && res.json.data.compressedBase64)) ? (res.json.compressedBase64 || res.json.data.compressedBase64) : null;
      // populate metrics if available
      try{
        const metrics = (res.json && (res.json.metrics || res.json.data && res.json.data.metrics)) ? (res.json.metrics || (res.json.data && res.json.data.metrics)) : null;
        // original bytes
        if (decoOriginalBytes) {
          decoOriginalBytes.textContent = (metrics && metrics.originalBytes != null) ? metrics.originalBytes : (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(data).length : data.length);
        }
        // compressed bytes
        if (decoCompressedBytes) {
          let cb = null;
          if (metrics && metrics.compressedBytes != null) cb = metrics.compressedBytes;
          else if (lastCompressed) cb = atob(lastCompressed).length;
          decoCompressedBytes.textContent = cb != null ? cb : '-';
        }
        if (decoRatio && decoOriginalBytes && decoCompressedBytes) {
          const obn = Number(decoOriginalBytes.textContent) || null;
          const cbn = Number(decoCompressedBytes.textContent) || null;
          decoRatio.textContent = (obn && cbn) ? (Number((cbn/obn).toFixed(4))) : '-';
          decoSavings.textContent = (obn && cbn) ? (Number(((1 - (cbn/obn)) * 100).toFixed(2)) + '%') : '-';
        }
        if (decoCompressedText && lastCompressed) decoCompressedText.value = lastCompressed;
      }catch(e){ console.warn('populate deco metrics error', e) }

      out.textContent = JSON.stringify(res.json,null,2);
    }catch(e){ out.textContent = 'exception: '+String(e) }
  });

  btnCopy && btnCopy.addEventListener('click', ()=>{
    const toCopy = lastCompressed || (decoCompressedText && decoCompressedText.value) || '';
    if(!toCopy) return alert('No compressed payload available');
    navigator.clipboard.writeText(toCopy).then(()=>alert('Copied to clipboard')).catch(()=>{ alert('No se pudo copiar automáticamente; pega manualmente.') });
  });

  btnDecompress && btnDecompress.addEventListener('click', async ()=>{
    const compressed = inDecompress.value || '';
    if(!compressed){ out.textContent = '(no base64 provided)'; return }
    out.textContent = 'decompressing...';
    try{
      const res = await postJson('/decompress',{compressedBase64: compressed});
      if(!res.ok){ out.textContent = 'error: '+JSON.stringify(res.json); return }
      out.textContent = JSON.stringify(res.json,null,2);
    }catch(e){ out.textContent = 'exception: '+String(e) }
  });

  btnPaste && btnPaste.addEventListener('click', async ()=>{
    if(!lastCompressed) return alert('No compressed payload to paste');
    inDecompress.value = lastCompressed;
  });

  // Upload & Compress File
  compressFileBtn && compressFileBtn.addEventListener('click', async ()=>{
    const file = compressFileInput && compressFileInput.files && compressFileInput.files[0];
    if(!file) return alert('Selecciona un archivo para subir');
    out.textContent = 'uploading and compressing file...';
    try{
      const { blob, filename } = await postFileAndGetBlob('/compress/upload', file);
      // create object URL for download
      const url = URL.createObjectURL(blob);
      compressFileLink.href = url;
      compressFileLink.download = filename || (file.name + '.vitt');
      compressFileLink.style.display = 'inline-block';
      compressFileLink.textContent = 'Download ' + compressFileLink.download;
      out.textContent = 'File compressed: ' + compressFileLink.download;
      // store lastCompressed as base64 for convenience
      try{
        const arrBuf = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrBuf);
        let binary = '';
        for (let i=0;i<bytes.length;i++) binary += String.fromCharCode(bytes[i]);
        lastCompressed = btoa(binary);
        if (decoCompressedText) decoCompressedText.value = lastCompressed;
        if (decoCompressedBytes) decoCompressedBytes.textContent = bytes.length - 4; // heuristic to match controller
      }catch(e){ /* ignore */ }
    }catch(e){ out.textContent = 'exception: '+String(e) }
  });

  // Upload & Decompress File
  decompressFileBtn && decompressFileBtn.addEventListener('click', async ()=>{
    const file = decompressFileInput && decompressFileInput.files && decompressFileInput.files[0];
    if(!file) return alert('Selecciona un archivo comprimido para subir');
    out.textContent = 'uploading and decompressing file...';
    try{
      const { blob, filename } = await postFileAndGetBlob('/decompress/upload', file);
      const url = URL.createObjectURL(blob);
      decompressFileLink.href = url;
      decompressFileLink.download = filename || (file.name.replace(/\.vitt$/i,'') + '.decompressed.txt');
      decompressFileLink.style.display = 'inline-block';
      decompressFileLink.textContent = 'Download ' + decompressFileLink.download;
      out.textContent = 'File decompressed: ' + decompressFileLink.download;
    }catch(e){ out.textContent = 'exception: '+String(e) }
  });

})();
