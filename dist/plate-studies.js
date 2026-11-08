/* Marginal copperplate studies. Every line, highlight and colour field inside a
   print is derived from the selected crop of the original work. No remote assets. */
(function(root){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),T=Math.PI*2,cache=new Map(),COUNT=7;
 const S=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 const pairDefaults={'courting-garden':[.675,.74],'cot-springtime':[.247,.2],'hayez-kiss':[.387,.77],'burton-stairs':[.23,.37]};
 function seedOf(s){let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0;}
 function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 function point(v,f){return Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)?v.map(x=>clamp(x,0,1)):f;}
 function surface(c,w,h){
  const el=c.canvas,doc=el&&el.ownerDocument;
  let a;if(doc&&doc.createElement){a=doc.createElement('canvas');a.width=w;a.height=h;}
  else if(typeof OffscreenCanvas==='function'){a=new OffscreenCanvas(w,h);}
  else if(el&&typeof el.constructor==='function'){try{a=new el.constructor(w,h);}catch(e){return null;}}
  return a&&a.getContext?a:null;
 }
 function cropBox(img,focus,aspect,zoom){
  const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,sw=Math.min(iw*zoom,ih*zoom*aspect),sh=sw/aspect;
  return [clamp(iw*focus[0]-sw/2,0,iw-sw),clamp(ih*focus[1]-sh/2,0,ih-sh),sw,sh];
 }
 function shadePalette(scene){
  let rgb=[53,46,35];const p=scene.pigments||scene.palette;
  if(Array.isArray(p)&&/^#[0-9a-f]{6}$/i.test(p[0])){const n=parseInt(p[0].slice(1),16),source=[n>>16,(n>>8)&255,n&255];rgb=rgb.map((x,i)=>Math.round(x*.68+source[i]*.24));}
  return rgb;
 }
 // A soft-cut drypoint: two families of graver lines change weight with the
 // luminosity of the crop; local contrast preserves faces, stems and brushwork.
 function print(c,img,scene,focus,w,h,zoom,form,mode,seed){
  const pw=clamp(Math.round(w*1.50/16)*16,96,400),ph=clamp(Math.round(pw*h/w),50,390),
   id=[scene.id||'',img.naturalWidth||img.width,focus.join(':'),pw,ph,zoom,form,mode].join('|');
  if(cache.has(id)){const existing=cache.get(id);cache.delete(id);cache.set(id,existing);return existing;}
  const plate=surface(c,pw,ph);if(!plate)return null;
  const g=plate.getContext('2d',{willReadFrequently:true});if(!g)return null;
  const box=cropBox(img,focus,pw/ph,zoom);
  let pixels;
  try{g.drawImage(img,...box,0,0,pw,ph);pixels=g.getImageData(0,0,pw,ph);}catch(e){return null;}
  const rgba=pixels.data,N=pw*ph,luma=new Uint8Array(N),hist=new Uint32Array(256),rng=random(seed),ink=shadePalette(scene);
  for(let i=0;i<N;i++){const k=i*4;const l=(rgba[k]*.295+rgba[k+1]*.579+rgba[k+2]*.126)|0;luma[i]=l;hist[l]++;}
  // Consolidate pigment grains into readable planes before cutting lines: an
  // individual dot of paint should not generate four additional black edges.
  const horizontal=new Uint8Array(N),wash=new Uint8Array(N);
  for(let y=0;y<ph;y++){const row=y*pw;for(let x=0;x<pw;x++)horizontal[row+x]=(2*luma[row+x]+luma[row+Math.max(0,x-1)]+luma[row+Math.min(pw-1,x+1)]+luma[row+Math.max(0,x-2)]+luma[row+Math.min(pw-1,x+2)])/6;}
  for(let y=0;y<ph;y++){const row=y*pw,a=Math.max(0,y-1)*pw,b=Math.min(ph-1,y+1)*pw,cc=Math.max(0,y-2)*pw,d=Math.min(ph-1,y+2)*pw;for(let x=0;x<pw;x++)wash[row+x]=(2*horizontal[row+x]+horizontal[a+x]+horizontal[b+x]+horizontal[cc+x]+horizontal[d+x])/6;}
  function percentile(p){let total=0;for(let j=0;j<256;j++){total+=hist[j];if(total>=N*p)return j;}return 255;}
  const low=percentile(.025),range=Math.max(52,percentile(.969)-low),f=seed%713*.014,period=clamp(pw/w,1.1,2.2)*3.15,base=[239,229,200];
  const waveX=Float32Array.from({length:pw},(_,x)=>Math.sin(x/pw*10.8+f)),waveY=Float32Array.from({length:ph},(_,y)=>Math.sin(y/ph*8.9-f)),bray=Float32Array.from({length:ph},(_,y)=>Math.sin(y/ph*24.1+f));
  const fineGrain=p=>{p=p-Math.floor(p);return Math.min(p,1-p);};
  for(let y=0;y<ph;y++){
   const v=(y+.5)/ph,wm=waveY[y],wr=bray[y],up=Math.max(0,y-2)*pw,down=Math.min(ph-1,y+2)*pw,row=y*pw;
   for(let x=0;x<pw;x++){
    const u=(x+.5)/pw,i=row+x,k=i*4,lum=wash[i],left=row+Math.max(0,x-2),right=row+Math.min(pw-1,x+2),
     ld=clamp((lum-low)/range,0,1),deep=1-ld,noise=rng()-.5,wx=waveX[x],
     edge=clamp((Math.abs(wash[right]-wash[left])+Math.abs(wash[down+x]-wash[up+x]))/range*1.65-.060,0,.91),
     p1=(x*.48+y*.91+(wx*.63+wm*.92+ld*.44)*period)/period,
     p2=(x*.84-y*.55+wm*period*.48+ld*period*.58)/(period*1.17);
    const line1=S((.028+deep*.271-fineGrain(p1))/.105),line2=S((.012+deep*.202-fineGrain(p2))/.094);
    const etched=clamp(.013+deep*.095+edge*.67+line1*(.17+deep*.53)+line2*S((deep-.40)/.55)*.39+Math.max(0,noise-.435)*deep*2.2,0,.94);
    const grain=noise*9+wm*.75+wx*.62;
    let t=mode==='pigment'?.16+.84*S((u-.09+.089*wm+.037*wr)/.62):mode==='ink'?.19*S((u-.26+.093*wm)/.62):S((u-.30+.102*wm+.11*(v-.5)+.032*wr)/.46);
    const posX=Math.abs(2*u-1),posY=Math.abs(2*v-1);
    let edgeRatio;
    if(form==='oval'){const radius=Math.sqrt(posX*posX+posY*posY);edgeRatio=(1-radius)*Math.min(pw,ph)*.5;}
    else if(form==='arch'){const inside=Math.pow(Math.pow(posX,3.1)+Math.pow(posY,3.1),1/3.1);edgeRatio=(1-inside)*Math.min(pw,ph)*.5;}
    else edgeRatio=Math.min((1-posX)*pw/2,(1-posY)*ph/2);
    const feather=2.7+5.4*(1-t),pressure=S((edgeRatio+(wx+wm)*1.9+noise*2.5-.6)/feather);
    for(let j=0;j<3;j++){const paper=base[j]+grain,proof=paper+(ink[j]-paper)*etched,original=rgba[k+j];rgba[k+j]=Math.round(proof+(original-proof)*t);}
    rgba[k+3]=Math.round(pressure*255);
   }
  }
  g.putImageData(pixels,0,0);
  cache.set(id,plate);if(cache.size>COUNT)cache.delete(cache.keys().next().value);return plate;
 }
 function brokenEdge(c,w,h,seed){
  // Fracture points follow the fibres of one sheet, including its torn mouth.
  const r=random(seed),p=[[-.50,-.395],[-.435,-.48],[-.15,-.493],[.12,-.494],[.36,-.477],[.49,-.477],[.5,-.28],[.485,.18],[.5,.44],[.448,.48],[.32,.482],[.27,.45],[.19,.489],[-.13,.475],[-.33,.50],[-.49,.466],[-.50,.23],[-.482,.02]];
  c.beginPath();c.moveTo(p[0][0]*w,p[0][1]*h);
  for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=(b[0]-a[0])*w,dy=(b[1]-a[1])*h,length=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(length/4.1));
   for(let j=1;j<=steps;j++){const q=j/steps,t=(r()-.5)*Math.min(2.4,h*.029);c.lineTo((a[0]+(b[0]-a[0])*q)*w+(length?dy/length*t:0),(a[1]+(b[1]-a[1])*q)*h-(length?dx/length*t:0));}}
  c.closePath();
 }
 function deck(c,w,h,seed,rounded){
  if(rounded){c.beginPath();c.ellipse(0,0,w*.499,h*.499,-.023,0,T);c.closePath();}else brokenEdge(c,w,h,seed);
  c.save();c.fillStyle='#e8dcbf';c.shadowColor='rgba(47,31,17,.29)';c.shadowBlur=Math.min(6,h*.04);c.shadowOffsetX=.8;c.shadowOffsetY=2.2;c.fill();c.restore();c.save();c.clip();
  const wash=c.createLinearGradient(-w/2,-h/2,w/2,h/2);wash.addColorStop(0,'#dbceb2');wash.addColorStop(.28,'#f2e8d1');wash.addColorStop(.68,'#ede2c8');wash.addColorStop(1,'#d9c9a8');c.fillStyle=wash;c.fillRect(-w/2,-h/2,w,h);
  const r=random(seed+909);c.strokeStyle='rgba(107,86,55,.17)';c.lineWidth=.47;c.beginPath();for(let i=0;i<w*h/64;i++){const x=(r()-.5)*w,y=(r()-.5)*h;c.moveTo(x,y);c.quadraticCurveTo(x+1.4,y+.8,x+1.1+r()*2,y+(r()-.5)*.95);}c.stroke();c.restore();
 }
 function imagePrint(c,img,scene,focus,x,y,w,h,zoom,form,mode,seed){
  const sample=print(c,img,scene,focus,w,h,zoom,form,mode,seed);
  if(sample){c.drawImage(sample,x,y,w,h);return;}
  c.save();if(form==='oval'||form==='arch'){c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,T);c.clip();}
  c.drawImage(img,...cropBox(img,focus,w/h,zoom),x,y,w,h);c.restore();
 }
 function versoMark(c,scene,x,y,pw,dark,small){
  const label=typeof scene.studyLabel==='string'?scene.studyLabel.trim():'';c.save();c.translate(x,y);
  c.strokeStyle=c.fillStyle=dark?'#efdfb8':'#544632';c.lineWidth=.7;c.lineCap='round';
  if(label){
   const size=small?15:clamp(pw*.074,16,21);c.font=size+'px Caveat, cursive';c.textAlign='center';c.textBaseline='top';c.fillText(label,0,0,pw*1.14);
  }else{
   c.globalAlpha*=.70;c.beginPath();c.moveTo(-20,4);c.quadraticCurveTo(-15,2,-9,4);c.moveTo(9,4);c.quadraticCurveTo(14,5,20,3);c.stroke();c.font='italic '+(small?10:12)+'px Georgia, serif';c.textAlign='center';c.fillText(String(scene.order||1).padStart(2,'0'),0,7);
  }
  c.restore();
 }
 function makeSingle(c,scene,img,focus,cx,cy,W,H,angle,seed,kind,dark,small,labelRoom){
  c.save();c.translate(cx,cy);c.rotate(angle);
  const ellipse=kind==='oculus';deck(c,W,H,seed,false);
  const gutter=clamp(W*.036,3,9),top=H*(small?.041:.057),bottom=clamp(H*.115,5,19),iw=W-2*gutter,ih=H-top-bottom;
  const form=ellipse?'oval':kind==='broad'?'arch':'strip';
  imagePrint(c,img,scene,focus,-W/2+gutter,-H/2+top,iw,ih,kind==='strip'?.43:.49,form,'blend',seed);
  c.save();c.strokeStyle='rgba(109,82,48,.52)';c.lineWidth=.58;c.lineCap='round';
  if(ellipse){c.beginPath();c.ellipse(0,(top-bottom)/2,iw*.497+1.7,ih*.498+1.7,0,.48,3.61);c.stroke();c.beginPath();c.ellipse(0,(top-bottom)/2,iw*.497+2.6,ih*.498+3,0,4.69,5.75);c.stroke();}
  else{const xx=-W/2+gutter,yy=-H/2+top,dx=iw,dy=ih;c.beginPath();c.moveTo(xx,yy+4);c.lineTo(xx,yy-.7);c.lineTo(xx+8,yy-.4);c.moveTo(xx+dx-11,yy+dy+1);c.lineTo(xx+dx+.5,yy+dy+.4);c.lineTo(xx+dx+.9,yy+dy-5);c.stroke();}
  // A single printed printer's flower and three plate notches, not a UI badge.
  const yy=H*.5-bottom*.53;c.globalAlpha*=.76;c.beginPath();c.moveTo(-W*.34,yy);c.lineTo(-W*.20,yy+.25);c.moveTo(W*.21,yy+.3);c.lineTo(W*.34,yy-.1);c.stroke();
  for(let j=-1;j<=1;j++){c.fillStyle='rgba(82,61,34,.60)';c.beginPath();c.ellipse(j*3.2,yy-Math.abs(j)*.38,Math.abs(j)? .71:1.04,.67,-.36,0,T);c.fill();}
  c.restore();if(labelRoom)versoMark(c,scene,0,H*.54+4,W,dark,small);c.restore();
 }
 function medal(c,scene,img,focus,x,y,w,h,angle,seed,mode){
  c.save();c.translate(x,y);c.rotate(angle);deck(c,w,h,seed,true);
  const border=Math.max(3,Math.min(w,h)*.046);imagePrint(c,img,scene,focus,-w/2+border,-h/2+border,w-2*border,h-2*border,mode==='ink'?.32:.37,'oval',mode,seed);
  c.strokeStyle='rgba(102,75,39,.50)';c.lineWidth=.68;c.beginPath();c.ellipse(0,0,w*.488,h*.487,.012,.28,5.86);c.stroke();c.strokeStyle='rgba(255,242,205,.82)';c.beginPath();c.ellipse(0,0,w*.471,h*.469,.008,3.41,5.88);c.stroke();c.fillStyle='#9b8158';c.beginPath();c.ellipse(-w*.008,-h*.466,1,1.4,.1,0,T);c.fill();c.restore();
 }
 function diptych(c,scene,img,focus,partner,cx,cy,W,H,seed,dark,small,labelRoom){
  c.save();c.translate(cx,cy);
  const mainW=W*.61,mainH=Math.min(H*.85,mainW*1.03),sideW=W*.46,sideH=Math.min(H*.63,sideW*1.07),primaryX=-W*.172,primaryY=-H*.086,pairX=W*.237,pairY=H*.218;
  // The two impressions share a curving length of binder's thread.
  c.save();c.lineCap='round';for(const [col,weight,dy] of [['rgba(38,27,16,.19)',1.85,.9],[dark?'#c6ae7a':'#8d7956',1.12,0],['rgba(247,226,172,.86)',.43,-.37]]){c.translate(0,dy);c.lineWidth=weight;c.strokeStyle=col;c.beginPath();c.moveTo(primaryX-mainW*.07,primaryY-mainH*.45);c.bezierCurveTo(-W*.19,-H*.74,W*.055,-H*.64,W*.11,-H*.40);c.bezierCurveTo(W*.18,-H*.16,W*.15,-H*.013,pairX+sideW*.05,pairY-sideH*.46);c.moveTo(W*.080,-H*.490);c.bezierCurveTo(W*.13,-H*.63,W*.21,-H*.49,W*.10,-H*.46);c.bezierCurveTo(W*.14,-H*.49,W*.22,-H*.53,W*.25,-H*.46);c.stroke();c.translate(0,-dy);}c.restore();
  medal(c,scene,img,partner,pairX,pairY,sideW,sideH,.13,seed+1,'ink');
  medal(c,scene,img,focus,primaryX,primaryY,mainW,mainH,-.10,seed,'pigment');
  if(labelRoom)versoMark(c,scene,0,H*.61+6,W,dark,small);
  c.restore();
 }
 function quill(c,x,y,scale,ink){
  c.save();c.translate(x,y);c.scale(scale,scale);c.strokeStyle=ink;c.globalAlpha*=.69;c.lineCap='round';c.lineWidth=.65;c.beginPath();c.moveTo(-12,2);c.quadraticCurveTo(-4,2,0,-2);c.quadraticCurveTo(4,-5,8,-3);c.quadraticCurveTo(5,2,0,-2);c.moveTo(0,-2);c.quadraticCurveTo(4,3,14,1);c.stroke();c.restore();
 }
 function draw(c,w,h,scene,img,b){
  if(!c||!img||!b||b.low)return;
  const odd=!!b.odd,dark=!!scene.dark,id=String(scene.id||''),seed=seedOf(id),focus=point(scene.detailFocus,[.5,.43]),partner=point(scene.partnerFocus,pairDefaults[id]||null);
  const ink=dark?'#efe0bd':'#63503a',choice=seed%5,kind=choice===0||choice===3?'oculus':choice===2?'broad':'strip';
  const left=odd?b.x+b.w:0,right=odd?w:b.x;
  c.save();
  if(b.phone){
   const margin=b.y,space=margin-9;if(space<24){c.restore();return;}
   if(space<69){quill(c,odd?w*.77:w*.25,clamp(margin*.5,11,24),.83,ink);c.restore();return;}
   const double=!!partner&&space>93,W=double?Math.min(w*.58,space*2.16,228):Math.min(w*.56,space*(kind==='strip'?2.55:2.06),234);
   const H=double?Math.min(space*.77,W*.61,110):Math.min(space*.66,W*(kind==='oculus'?.62:kind==='broad'?.57:.44),106);
   const labelRoom=space-H>33&&!!scene.studyLabel,cx=odd?w*.61:w*.39,cy=clamp(margin*.51-(labelRoom?7:0),H*.54+4,margin-H*.54-(labelRoom?18:5));
   if(double)diptych(c,scene,img,focus,partner,cx,cy,W,H,seed,dark,true,labelRoom);else makeSingle(c,scene,img,focus,cx,cy,W,H,odd?-.043:.044,seed,kind,dark,true,labelRoom);
  }else{
   const outside=right-left;if(outside<86){c.restore();return;}
   const W=Math.min(outside*.77,Math.max(130,w*.22),h*.42,312),H=Math.min(h*.37,W*(partner?.79:kind==='oculus'?.91:kind==='broad'?.79:.67));
   const cx=(left+right)*.5,cy=clamp(b.y+b.h*(.44+(seed%7)*.012),H*.60+19,h-Math.max(70,b.foot||85)-H*.56-22);
   if(partner&&W>105)diptych(c,scene,img,focus,partner,cx,cy,W,H,seed,dark,false,true);
   else makeSingle(c,scene,img,focus,cx,cy,W,H,((seed>>>9)%9-4)*.009,seed,kind,dark,false,true);
  }
  c.restore();
 }
 const api={draw};if(typeof module==='object'&&module.exports)module.exports=api;else root.PlateStudies=api;
})(typeof window!=='undefined'?window:globalThis);
