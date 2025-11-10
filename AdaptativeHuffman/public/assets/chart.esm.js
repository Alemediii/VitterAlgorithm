// Small ESM shim that dynamically loads Chart.js from CDN and re-exports default
const url = 'https://cdn.jsdelivr.net/npm/chart.js@4.3.0/dist/chart.umd.min.js';

// Load the UMD build and expose a Chart constructor on default export
let loaded = null;
export default async function loadChart(){
  if (loaded) return loaded;
  // create script tag to load UMD and access global.Chart
  await new Promise((resolve, reject)=>{
    const s = document.createElement('script');
    s.src = url;
    s.onload = ()=> setTimeout(resolve, 10);
    s.onerror = (e)=> reject(new Error('Failed to load Chart.js: '+e));
    document.head.appendChild(s);
  });
  if (typeof window.Chart === 'undefined') throw new Error('Chart not available after loading');
  loaded = window.Chart;
  return loaded;
}

export { loadChart as ChartLoader };

