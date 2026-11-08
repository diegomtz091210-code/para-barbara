/* Each painting travels with its own letter and stamp. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.Postscript=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 const chapters=['lo que siento','lo que veo','lo que eres','lo que cuido','lo que elijo'];
 const places=['El huerto','Los girasoles','La casa','El puente','Las estrellas'];
 const roman=['I','II','III','IV','V'];
 const opening={title:'Para empezar',art:'sunflowers',first:'Vi un cuadro, pensé en ti y ya no pude quedarme con uno solo. Así empezó este libro.',last:'Puedes leer una sola hoja o seguir todo el camino. Las demás te esperan para cuando quieras.'};
 const ending={title:'La flor es para ti',art:'almond-blossom',first:'Llegamos, Bárbara. En una mano llevo la flor y en la otra, la tuya.',last:'Me quedaría aquí contigo, viendo cómo se pone el sol. Te amo.'};
 const drawing=[
  '<path d="M7 30q13-3 20 0m-11-2q3-7 4-15m-3 11q-8-2-8-8 7 0 9 6m1-5q0-9 8-11 2 7-8 13"/><path d="m8 31 5 1m12-3 3 0"/>',
  '<g transform="translate(19 16)"><circle r="4.4"/><path d="M0-7q-5-9 0-10 4 4 0 10m5-4q1-7 5-7 1 5-5 9m3 3q7-6 10-2-1 4-10 4m-1 3q9 1 8 5-4 2-9-4M-5-5q-8-7-9-2 2 4 8 5m-1 3q-8 0-9 5 4 1 10-3"/></g><path d="M19 21q2 5 0 12m1-5q6-5 9-3-3 5-9 5"/>',
  '<path d="M4 29h31M7 28V13l8-6 14 5 3 5-17-4-9 3m10-3v15m-6-12v4m3-6v4m6-3v4m5-3v4m-6 7v-5h4v6m5-1v-4m-12-15V4l3 1v4"/><path d="M21 4q4-2 8 0"/>',
  '<path d="M2 24q16-14 33-2M2 19q16-15 33-2m-29 0v5m6-8v6m6-7v6m6-6v6m6-5v6M3 28q6-2 12 0t12 0m-18 4q5-2 10 0"/>',
  '<path d="m3 24 9-7 6 4 8-11 7-6M12 12l.9 4.1 3 .8-3.1.8-.8 3.7-.8-3.7L8 17l3.2-.9Zm14-7 .8 3.7L30 10l-3.2.8-.8 3.7-.7-3.7L22 10l3.3-1.3Z"/><circle cx="4" cy="24" r="1.05"/><circle cx="18" cy="21" r="1.1"/><path d="M7 8q5-5 12-5"/>'
 ];
 function glyph(i){return '<svg class="map-glyph" viewBox="0 0 38 36" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">'+drawing[i]+'</svg>';}
 function forScene(s){return s.kind==='intro'?opening:s.kind==='finale'?ending:{...s.note,art:s.id};}
 return {chapters,places,roman,forScene,glyph};
});
