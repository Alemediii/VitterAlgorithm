// ES module to fetch benchmark times and render a Chart.js line chart
// This module expects Chart.js UMD to be loaded as window.Chart (index.html loads it from CDN)

console.debug('[chartManager] module loaded');

async function fetchTimes(){
  const res = await fetch('/api/benchmark/times');
  if(!res.ok) throw new Error('Failed to fetch benchmark times');
  return await res.json();
}

function buildChartData(times){
  const labels = times.map(t=>t.N);
  const vitter = times.map(t=>t.vitterMs);
  const huffman = times.map(t=>t.huffmanMs);
  return { labels, datasets: [
    { label: 'Vitter', data: vitter, borderColor: 'red', backgroundColor: 'rgba(255,0,0,0.08)', tension:0.2 },
    { label: 'Huffman', data: huffman, borderColor: 'blue', backgroundColor: 'rgba(0,0,255,0.08)', tension:0.2 }
  ] };
}

function createChart(canvasEl, data, Chart){
  // ensure CSS display size but don't force pixel buffer; Chart.js will handle DPI and pixel ratio
  const w = canvasEl.clientWidth || 600;
  const h = canvasEl.clientHeight || 360;
  canvasEl.style.width = w + 'px';
  canvasEl.style.height = h + 'px';
  canvasEl.style.backgroundColor = '#ffffff'; // ensure visible background
  // Destroy existing Chart instance if present (Chart.js v3+/v4 provides Chart.getChart)
  try { if (typeof Chart.getChart === 'function') { const prev = Chart.getChart(canvasEl); if (prev) { prev.destroy(); } } } catch (e) {}
  // Prefer passing the canvas element to Chart.js; it will obtain the context and manage DPR
  try { return new Chart(canvasEl, {
     type: 'line',
     data,
     options: {
       responsive: true,
       maintainAspectRatio: false,
       plugins: {
         legend: { display: true, position: 'top' },
         title: { display: true, text: 'Comparativa de Tiempos Vitter vs Huffman' }
       },
       scales: {
         x: { title: { display: true, text: 'N (tamaño de entrada)' } },
         y: { title: { display: true, text: 'Tiempo (ms)' } }
       }
     }
   }); } catch(e) { console.warn('Chart constructor with element failed, falling back to ctx', e); const ctx = canvasEl.getContext('2d'); return new Chart(ctx, { type:'line', data, options: { responsive:true, maintainAspectRatio:false } }); }
}

async function loadChartConstructor(){
  if (typeof window !== 'undefined' && window.Chart) return window.Chart;
  throw new Error('Chart.js not available (ensure script tag for Chart.js UMD is present)');
}

export default async function initBenchmarkChart(canvasId){
  const canvas = document.getElementById(canvasId);
  const statusEl = document.getElementById('tiempoChartStatus');
  if(!canvas) return;
  canvas.parentElement.style.height = '360px';
  const ctx = canvas.getContext('2d');
  // draw loading placeholder
  function drawMessage(msg){
    try{
      const w = canvas.clientWidth || canvas.width || 600;
      const h = canvas.clientHeight || canvas.height || 360;
      // set CSS size so Chart.js can size correctly
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0,0,w,h);
      ctx.fillStyle = '#334155';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(msg, w/2, h/2);
    }catch(e){ console.warn('drawMessage failed', e); }
    if (statusEl) statusEl.textContent = msg;
  }

  drawMessage('Cargando datos...');
  try{
    const times = await fetchTimes();
    if(!times || !Array.isArray(times) || times.length===0){ drawMessage('No hay datos'); return; }
    const data = buildChartData(times);
    // draw fallback immediately and don't attempt to load Chart.js (CSP 'self' environments)
    try {
      fallbackDraw(data, canvas);
      if (statusEl) statusEl.textContent = 'Gráfica renderizada (fallback, sin Chart.js)';
    } catch (e) {
      console.error('fallback initial draw failed', e);
      drawMessage('Error dibujando gráfica');
    }
  }catch(e){ console.error('chartManager.init error', e); drawMessage('Error cargando gráfica (ver consola)'); }
}

// Fallback: draw simple line chart on canvas (two series)
function fallbackDraw(dataObj, canvas){
  try{
    const ctx = canvas.getContext('2d');
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 360;
    const ratio = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,w,h);
    // margins
    const margin = {left:50, right:20, top:30, bottom:40};
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;
    // labels
    ctx.fillStyle = '#222'; ctx.font='13px sans-serif'; ctx.textAlign='left'; ctx.fillText('Comparativa de Tiempos Vitter vs Huffman', margin.left, 18);
    // axes
    ctx.strokeStyle = '#ccc'; ctx.beginPath(); ctx.moveTo(margin.left, margin.top); ctx.lineTo(margin.left, margin.top+plotH); ctx.lineTo(margin.left+plotW, margin.top+plotH); ctx.stroke();
    const labels = dataObj.labels || [];
    const v = dataObj.datasets && dataObj.datasets[0] ? dataObj.datasets[0].data : [];
    const huff = dataObj.datasets && dataObj.datasets[1] ? dataObj.datasets[1].data : [];
    const all = v.concat(huff);
    const maxVal = Math.max(1, ...all);
    // y ticks
    ctx.fillStyle='#444'; ctx.textAlign='right'; ctx.font='12px sans-serif';
    for(let i=0;i<=5;i++){
      const y = margin.top + plotH - (i/5)*plotH;
      const val = (i/5)*maxVal;
      ctx.fillText(val.toFixed(2), margin.left-8, y+3);
      ctx.strokeStyle='#eee'; ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(margin.left+plotW, y); ctx.stroke();
    }
    // x labels
    ctx.textAlign='center'; ctx.font='12px sans-serif';
    for(let i=0;i<labels.length;i++){
      const x = margin.left + (i/(labels.length-1||1))*plotW;
      ctx.fillText(String(labels[i]), x, margin.top+plotH+18);
    }
    // plot function
    function plotSeries(series, color){
      if(!series || series.length===0) return;
      ctx.strokeStyle = color; ctx.lineWidth=2; ctx.beginPath();
      for(let i=0;i<series.length;i++){
        const x = margin.left + (i/(series.length-1||1))*plotW;
        const y = margin.top + plotH - (series[i]/maxVal)*plotH;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    plotSeries(v, 'red');
    plotSeries(huff, 'blue');
    // legend
    ctx.fillStyle='red'; ctx.fillRect(w-140, margin.top+4,12,12); ctx.fillStyle='#222'; ctx.fillText('Vitter', w-120, margin.top+14);
    ctx.fillStyle='blue'; ctx.fillRect(w-70, margin.top+4,12,12); ctx.fillStyle='#222'; ctx.fillText('Huffman', w-50, margin.top+14);
  }catch(err){ console.error('fallbackDraw error', err); }
}
