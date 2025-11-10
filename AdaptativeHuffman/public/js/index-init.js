// Extracted index inline code to avoid CSP inline-script issues
// Exposes utility functions used across the index page

export function doFetchJson(url, body){
  const opts = body
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    : { method: 'GET' };

  return fetch(url, opts).then(async r=>{
    let j = null;
    try{ j = await r.json(); }catch(e){ j = { status: r.status, text: await r.text() }; }
    return { ok: r.ok, status: r.status, json: j };
  }).catch(err=>({ ok:false, status:0, json: { error: err.message } }));
}

export function wireSmoothAnchor(){
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click', function(e){ e.preventDefault(); const target = document.querySelector(this.getAttribute('href')); if(target) target.scrollIntoView({ behavior:'smooth', block:'center' }); });
  });
}

export async function diagnoseUma(){
  const statusEl = document.getElementById('uma-status');
  const imgEl = document.getElementById('uma-img');
  if(!statusEl || !imgEl) return;
  try{
    // perform HEAD to check availability (some servers may not support HEAD, fall back to GET)
    let res = null;
    try { res = await fetch('/uma.png', { method: 'HEAD', cache: 'no-store' }); }
    catch(e) { res = await fetch('/uma.png', { method: 'GET', cache: 'no-store' }); }
    if(!res.ok){ statusEl.textContent = 'No cargó: '+res.status+' '+res.statusText; imgEl.style.opacity = 0.4; return; }
    const contentType = res.headers.get('content-type') || '';
    statusEl.textContent = 'Cargada: '+res.status+' '+contentType;
    // set direct src (avoid blob URL which violates CSP img-src 'self' data:)
    imgEl.src = '/uma.png';
  }catch(e){ statusEl.textContent = 'Error al fetch: '+(e && e.message? e.message : e); imgEl.style.opacity = 0.4; }
}

// auto-run on import
if (typeof window !== 'undefined'){
  window.addEventListener('load', ()=>{ wireSmoothAnchor(); diagnoseUma(); });
}
