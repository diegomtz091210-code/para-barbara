(() => {
'use strict';
const artworks=window.ARTWORKS||[],Studio=window.BrushStudio;
const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sunset=window.Endpapers.sunset,finaleImage=sunset.image;
const gardenColours=artworks.map(a=>{const sw=a.pigments||[a.bg];const strength=h=>{const [r,g,b]=[1,3,5].map(k=>parseInt(h.slice(k,k+2),16));return (Math.max(r,g,b)-Math.min(r,g,b))*.8+(r*.21+g*.72+b*.07)*.16;};return sw.reduce((best,x)=>strength(x)>strength(best)?x:best,sw[0]);});
const scenes=[{kind:'intro',title:'Bárbara, mira esto.',image:'graphics/estampas-de-portada.webp',bg:'#f6f1e6',fg:'#24354f',accent:'#bdab89'},...artworks.map(a=>({...a,kind:'art',dark:a.fg==='#fff6e5'})),{kind:'finale',title:'Te amo',bouquet:gardenColours,image:finaleImage,bg:'#df9a71',fg:'#4c302d',accent:'#74432e',dark:false}];
const count=scenes.length,last=count-1,num=n=>String(n+1).padStart(2,'0');
const bounded=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(last,Math.trunc(Number(value)))):0;
const oldPlates='durer|rembrandt|whistler-grey|almond-glass|pink-peach|flowering-orchard|sunflowers|sower|klimt|turner|red-vineyard|red-fuji|roses|redon-flowers|renoir|monet-sunset|bedroom|kandinsky|irises|seurat|poppies|wheat-cypresses|olive-trees|monet-pond|monet|hokusai|monet-lilies|almond-blossom|cafe-terrace|vangogh'.split('|');
const replacedPlates=new Map([['rembrandt','rembrandt-saskia'],['renoir-bougival','renoir-promenade']]);
const plateIndex=key=>Math.max(0,scenes.findIndex(s=>s.id===(replacedPlates.get(key)||key)));
const address=i=>i===0?'#0':i===last?'#te-amo':'#obra/'+scenes[i].id;
function fromAddress(hash){
 const key=String(hash||'').replace(/^#/,'');if(key==='te-amo')return last;
 if(key.startsWith('obra/'))return plateIndex(key.slice(5));
 const n=Number(key);if(!Number.isFinite(n))return 0;const j=Math.trunc(n);
 if(j===oldPlates.length+1)return last;if(j>=1&&j<=oldPlates.length)return plateIndex(oldPlates[j-1]);
 return bounded(j);
}
let current=fromAddress(location.hash),requested=current,requestSerial=0,motionEpoch=0,frame=0,resolveMotion=null,loadTimer=0,resizeTimer=0;
let width=0,height=0,ratio=1,activeImage=null,first=true,turning=false,visibleScene=scenes[0];
const images=new Map(),motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)'),reduced=()=>motionPreference.matches;
const stage=$('stage'),scene=$('scene'),outgoing=$('outgoing'),canvas=$('painting-surface'),cursor=$('brush-surface');
const ctx=canvas.getContext('2d'),cursorCtx=cursor.getContext('2d'),factory=()=>document.createElement('canvas');
const walker=new window.JourneyStudio.Journey($('journey-canvas'),factory,last);
walker.show(current,0,1);
function walkFrame(from,to,p){
 const f=Math.max(0,Math.min(1,p)),dir=to>=from?1:-1;
 // A jump across the atlas is a cut between places, never a sprint through thirty pages.
 if(Math.abs(to-from)>3){walker.show(f<.5?from:to,0,dir);return;}
 const u=f*f*(3-2*f);walker.show(from+(to-from)*u,Math.min(1,Math.sin(Math.PI*f)*5),dir);
}
const fontReady=document.fonts?Promise.all([document.fonts.load('24px "Pinyon Script"'),document.fonts.load('24px "Petit Formal Script"')]).catch(()=>{}):Promise.resolve();
function ink(text,className='',tag='p'){
 const lines=text.split('\n').map(line=>line.split(/(\s+)/).map(word=>/\S/.test(word)?`<span class="ink-word">${esc(word)}</span>`:word).join('')).join('<br> ');
 return `<${tag} class="${className}" data-write>${lines}</${tag}>`;
}
function imageReady(src){
 if(!src)return Promise.resolve(null);
 if(images.has(src))return images.get(src);
 const image=new Image();image.decoding='async';
 const result=new Promise(resolve=>{
  image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=src;
  if(image.complete)resolve(image.naturalWidth?image:null);
 }).then(async img=>{if(img?.decode){try{await img.decode();}catch{}}return img;});
 images.set(src,result);return result;
}
function sizeSurfaces(){
 const r=stage.getBoundingClientRect();width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));ratio=Math.min(window.devicePixelRatio||1,2);
 const trailBox=$('journey-canvas').getBoundingClientRect();walker.resize(trailBox.width,trailBox.height,ratio);
 for(const c of [canvas,cursor]){c.width=Math.round(width*ratio);c.height=Math.round(height*ratio);c.getContext('2d').setTransform(ratio,0,0,ratio,0,0);}
}
function clearBrush(){cursorCtx.clearRect(0,0,width,height);}
function brush(point){clearBrush();Studio.drawBrush(cursorCtx,point);}
function stopMotion(){
 motionEpoch++;if(frame)cancelAnimationFrame(frame);frame=0;
 if(resolveMotion){const resolve=resolveMotion;resolveMotion=null;resolve(false);}
 clearBrush();
}
function animate(duration,tick,epoch){
 return new Promise(resolve=>{
  resolveMotion=resolve;let start;
  const step=time=>{
   if(epoch!==motionEpoch){resolve(false);return;}
   if(start===undefined)start=time;
   const p=Math.min(1,(time-start)/duration);tick(p);
   if(p<1)frame=requestAnimationFrame(step);
   else {frame=0;resolveMotion=null;resolve(true);}
  };
  frame=requestAnimationFrame(step);
 });
}
function showWords(root=scene){root.querySelectorAll('.ink-word').forEach(word=>{word.style.clipPath='none';word.style.opacity='1';word.style.transform='none';});}
function readyForSunset(root){
 root.querySelectorAll('.ink-word').forEach(word=>{word.style.clipPath='inset(-.16em 100% -.2em -.05em)';word.style.opacity='0';});
}
async function revealAtSunset(epoch){
 if(reduced()){showWords();return;}
 const words=[];let total=0;
 scene.querySelectorAll('[data-write]').forEach((part,j)=>{
  const start=[140,980,2140][j]??2140,step=[0,280,105][j]??105,span=[650,650,420][j]??420;
  part.querySelectorAll('.ink-word').forEach((el,k)=>{const at=start+k*step;words.push({el,at,span,done:false});total=Math.max(total,at+span);});
 });
 if(!words.length){showWords();return;}
 const finished=await animate(total,p=>{
  const time=p*total;
  for(const word of words){
   if(word.done||time<word.at)continue;const f=Math.min(1,(time-word.at)/word.span),u=f*f*(3-2*f);
   word.el.style.opacity=String(Math.min(1,u*2.5));
   word.el.style.clipPath=f===1?'none':'inset(-.16em '+(100*(1-u)).toFixed(2)+'% -.2em -.05em)';
   word.el.style.transform=f===1?'none':'translateY('+((1-u)*.045).toFixed(3)+'em)';
   if(f===1)word.done=true;
  }
 },epoch);
 if(finished&&epoch===motionEpoch)showWords();
}
const ghost=html=>html.replace(/\s(?:id|aria-labelledby|aria-describedby)="[^"]*"/g,'').replace(/<button\b/g,'<button tabindex="-1"');
function captureOutgoing(){
 outgoing.innerHTML=ghost(scene.innerHTML);
 outgoing.style.clipPath='none';
}
function layoutWriting(){
 const origin=stage.getBoundingClientRect(),lines=[];
 for(const block of scene.querySelectorAll('[data-write]')){
  const style=getComputedStyle(block),fontSize=parseFloat(style.fontSize)||24;
  let row=null;
  for(const word of block.querySelectorAll('.ink-word')){
   const r=word.getBoundingClientRect();if(!r.width)continue;
   const x=r.left-origin.left,y=r.top-origin.top;
   if(!row||Math.abs(y-row.top)>fontSize*.55){row={top:y,y:y+r.height*.66,start:x,end:x+r.width,words:[],size:fontSize,color:style.color};lines.push(row);}
   row.words.push({el:word,x,w:r.width});row.start=Math.min(row.start,x);row.end=Math.max(row.end,x+r.width);
  }
 }
 return lines;
}
async function writeWords(epoch,entry){
 if(reduced()){showWords();clearBrush();return;}
 const lines=layoutWriting();if(!lines.length){clearBrush();return;}
 const segments=[];let elapsed=0;
 const pen=(line,end=false)=>({x:end?line.end+6:line.start-6,y:line.y,nib:Math.max(7,Math.min(16,line.size*.20)),angle:-.50,pressure:.75,color:line.color,writing:true});
 const add=(kind,duration,from,to,line)=>{segments.push({kind,duration,begin:elapsed,from,to,line});elapsed+=duration;};
 let previous=entry||{...pen(lines[0]),x:-130,y:lines[0].y-55,pressure:.1};
 for(const [i,line] of lines.entries()){
  const start=pen(line),end=pen(line,true);
  add('travel',i?260:350,previous,start);
  add('write',Math.max(540,Math.min(1100,(line.end-line.start)*3.2)),start,end,line);
  previous=end;
 }
 add('travel',550,previous,{...previous,x:width+230,y:previous.y-70,angle:-Math.PI/2,pressure:0});
 const complete=await animate(elapsed,p=>{
  const time=p*elapsed;
  for(const segment of segments){
   const t=Studio.clamp((time-segment.begin)/segment.duration);
   if(segment.kind==='write'&&time>=segment.begin){
    // The same fingertip position reveals the letters and moves the bristles.
    const eased=t*t*(3-2*t),x=segment.from.x+(segment.to.x-segment.from.x)*eased;
    for(const word of segment.line.words){const fraction=Studio.clamp((x-word.x)/word.w);word.el.style.clipPath=fraction>=1?'none':`inset(0 ${100-fraction*100}% 0 0)`;}
   }
   if(time>=segment.begin&&time<=segment.begin+segment.duration){
    if(segment.kind==='travel')brush(Studio.travel(segment.from,segment.to,t,segment===segments[0]?28:34));
    else {
     const e=t*t*(3-2*t);
     brush({...segment.from,x:segment.from.x+(segment.to.x-segment.from.x)*e,y:segment.from.y+Math.sin(e*Math.PI*3)*1.1,pressure:.67+.18*Math.sin(Math.PI*t),angle:-.50+Math.sin(t*Math.PI*2)*.07});
    }
    break;
   }
  }
 },epoch);
 if(!complete||epoch!==motionEpoch)return;
 showWords();clearBrush();
}
// Only the ink that actually bends around the crest is painted into the curl.
function printedFace(base,markup){
 const plate=Studio.surface(factory,width,height,ratio),g=plate.getContext('2d');g.drawImage(base,0,0,width,height);
 const origin=stage.getBoundingClientRect();
 for(const word of markup.querySelectorAll('.ink-word')){
  if(!word.textContent)continue;
  const r=word.getBoundingClientRect(),st=getComputedStyle(word);if(!r.width||!r.height||Number.parseFloat(st.opacity)<=.003||st.clipPath==='inset(0px 100% 0px 0px)')continue;
  g.save();g.translate(r.left-origin.left+r.width/2,r.top-origin.top+r.height/2);g.rotate(-.026);
  g.font=st.fontSize+' '+st.fontFamily;g.fillStyle=st.color;g.globalAlpha=Number.isFinite(Number.parseFloat(st.opacity))?Number.parseFloat(st.opacity):1;g.textAlign='center';g.textBaseline='middle';g.fillText(word.textContent,0,0);g.restore();
 }
 return plate;
}
function leafMarkup(s,at,available){
 if(s.kind==='intro')return `<section class="scene-inner intro"><div class="intro-copy">${ink('Bárbara,\nmira esto.','intro-title','h1')}${ink('Vi estos girasoles y pensé en ti.\n¿Me acompañas un ratito?','intro-note')}<button class="enter quiet-control" id="enter">Ven conmigo<svg viewBox="0 0 48 24" aria-hidden="true"><path d="M1 16Q21 7 43 10M33 2l12 8-10 11"/></svg></button></div></section>`;
 if(s.kind==='finale')return `<section class="scene-inner finale" style="--sol-x:${sunset.screenX*100}%;--sol-y:${sunset.screenY*100}%"><div class="finale-copy">${ink('Bárbara,','','h1')}${ink('Te amo','finale-message')}${ink('Mi parte favorita del mundo\nes donde estás tú.','finale-note')}</div><div class="end-actions quiet-control"><button class="restart" id="restart">Volver a empezar <span aria-hidden="true">↗</span></button></div></section>`;
 return `<section class="scene-inner art-scene ${at%2?'corner-left':''}" aria-label="${esc(s.title)}"><button class="art-inspect" id="inspect-art" aria-label="Ampliar ${esc(s.title)}, de ${esc(s.artist)}"><span class="sr-only">${esc(s.title)} · ${esc(s.artist)} · ${esc(s.year)}</span></button><div class="scene-text">${ink(s.poem,'poem')}</div>${available?'':'<p class="art-error">Esta pintura no pudo cargarse.<br><button id="retry-image">Intentar de nuevo</button></p>'}</section>`;
}
function renderMarkup(s){
 scene.className='scene-pending';scene.innerHTML=leafMarkup(s,current,!!activeImage);
 if(s.kind==='intro')$('enter').onclick=()=>go(1);
 else if(s.kind==='finale')$('restart').onclick=()=>go(0);
 else{$('inspect-art').onclick=()=>openArt(current-1);if(!activeImage)$('retry-image').onclick=()=>{images.delete(s.image);go(current,false,true);};}
}
async function present(s,img,initial,direction,lastOnPaper){
 const walkFrom=walker.position,destination=current;stopMotion();const epoch=motionEpoch;
 // A quick second turn starts from the complete current page, never a stale fold.
 if(turning){Studio.compose(ctx,width,height,visibleScene,activeImage);showWords();turning=false;}
 scene.style.clipPath='none';
 if(!initial&&!reduced())captureOutgoing();else outgoing.innerHTML='';
 const previous=Studio.surface(factory,width,height,ratio);previous.getContext('2d').drawImage(canvas,0,0,width,height);
 const next=Studio.surface(factory,width,height,ratio);Studio.compose(next.getContext('2d'),width,height,s,img);
 activeImage=img;visibleScene=s;renderMarkup(s);
 // Every artwork and its words are printed together on the leaf. Only the cover writes itself.
 if(s.kind==='finale'&&!reduced())readyForSunset(scene);else if(s.kind!=='intro')showWords();
 if(initial||reduced()){
  walker.show(destination,0,direction);
  ctx.clearRect(0,0,width,height);ctx.drawImage(next,0,0,width,height);
 }else{
  turning=true;
  const rollPrint=direction>0?printedFace(previous,outgoing):printedFace(next,scene);
  const leaf=direction>0?scenes[lastOnPaper]:s;
  const page=new window.BookStudio.PageTurn({context:ctx,previous,next,width,height,ratio,factory,direction,leaf,rollPrint});
  const start=page.clips(0);scene.style.clipPath=start.incoming;outgoing.style.clipPath=start.outgoing;
  const complete=await animate(page.duration,p=>{
   const clips=page.render(p);outgoing.style.clipPath=clips.outgoing;scene.style.clipPath=clips.incoming;walkFrame(walkFrom,destination,p);
  },epoch);
  if(!complete||epoch!==motionEpoch)return;
  turning=false;ctx.clearRect(0,0,width,height);ctx.drawImage(next,0,0,width,height);
 }
 walker.show(destination,0,direction);outgoing.innerHTML='';scene.style.clipPath='none';scene.className='';clearBrush();
 if(s.kind==='intro')await writeWords(epoch);else if(s.kind==='finale')await revealAtSunset(epoch);else showWords();
}
async function go(index,focus=true,force=false,settled=false){
 if(liveDrag||touch)discardDrag();
 const destination=bounded(index);requested=destination;const serial=++requestSerial;
 scene.setAttribute('aria-busy','true');clearTimeout(loadTimer);
 loadTimer=setTimeout(()=>{if(serial===requestSerial)$('loading').hidden=false;},850);
 const [img]=await Promise.all([imageReady(scenes[destination].image),fontReady]);
 if(serial!==requestSerial)return;
 clearTimeout(loadTimer);$('loading').hidden=true;scene.removeAttribute('aria-busy');
 if(destination===current&&!first&&!force){history.replaceState(null,'',address(current));return;}
 const old=current,direction=destination<old?-1:1,s=scenes[destination];
 // Capture outgoing geometry with its original colors before updating the scene state.
 const root=document.documentElement.style;
 outgoing.style.setProperty('--old-fg',scenes[old].fg);
 current=destination;
 stage.setAttribute('data-sheet',s.kind);stage.setAttribute('data-tone',s.dark?'dark':'light');
 root.setProperty('--page-image',s.kind==='art'?`url("${s.image}")`:'none');root.setProperty('--nav-wash',s.kind==='art'?(s.dark?'rgba(12,19,25,.78)':'rgba(253,246,225,.82)'):s.bg);
 root.setProperty('--bg',s.bg);root.setProperty('--fg',s.fg);root.setProperty('--accent',s.accent||s.fg);root.setProperty('--progress-ratio',String(current/last));
 document.querySelector('meta[name="theme-color"]').content=s.bg;
 $('act').textContent=current===0?'para ti':current===last?'te amo':s.chapter||'contigo';$('page').textContent=`${num(current)} / ${count}`;
 $('journey-canvas').setAttribute('aria-label',current===last?'Los dos llegan juntos, de la mano. Él lleva una flor para Bárbara.':'Él lleva a Bárbara de la mano. Están en la hoja '+(current+1)+' de '+count+'.');
 $('note-label').textContent=current===last?'La última carta':'Una nota';
 $('prev').disabled=current===0;$('next').disabled=current===last;
 document.querySelectorAll('[data-scene]').forEach(button=>{if(Number(button.dataset.scene)===current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 history.replaceState(null,'',address(current));
 const initial=first||settled;first=false;
 // present() only paints our own canvas and text; it never captures the browser.
 present(s,img,initial,direction,old).catch(()=>{if(serial!==requestSerial)return;stopMotion();turning=false;scene.style.clipPath='none';outgoing.innerHTML='';walker.show(current,0,direction);Studio.compose(ctx,width,height,s,img);scene.className='';showWords();});
 $('announcement').textContent=`Momento ${current+1} de ${count}. ${s.title}.`;
 if(focus)scene.focus({preventScroll:true});
 if(current+1<count)imageReady(scenes[current+1].image);
 if(current>0)imageReady(scenes[current-1].image);
 const keep=new Set(scenes.slice(Math.max(0,current-1),current+2).map(x=>x.image));for(const key of images.keys()){if(images.size<=6)break;if(!keep.has(key))images.delete(key);}
}
function openArt(index){const a=artworks[index];if(!a)return;$('full-image').src=a.image;$('full-image').alt=`${a.title}, ${a.artist}, ${a.year}`;$('art-label').textContent=a.title;$('full-caption').textContent=`${a.artist} · ${a.year} · ${a.medium}. ${a.museum}.`;$('art-dialog').showModal();}
const Post=window.Postscript,sectionNames=Post.chapters,sectionNumbers=Post.roman;
const entry=(s,i)=>'<button class="index-item" data-scene="'+i+'"><img width="51" height="46" alt="" data-thumb="thumbs/'+esc(s.id)+'.webp"><span class="index-caption"><span>'+esc(s.title)+'</span><em>'+esc(s.artist)+'</em></span><small>'+num(i)+'</small></button>';
$('map-stops').innerHTML=sectionNames.map((name,j)=>'<button type="button" data-stop="'+j+'" aria-label="Ver '+esc(name)+'" aria-pressed="false">'+Post.glyph(j)+'<span>'+Post.places[j]+'</span></button>').join('');
$('index-list').innerHTML=sectionNames.map((name,j)=>'<section class="index-group" id="tramo-'+j+'" hidden><h3><small>'+sectionNumbers[j]+'</small>'+esc(name)+'</h3><div class="index-grid">'+scenes.map((s,i)=>s.chapter===name?entry(s,i):'').join('')+'</div></section>').join('')+'<div class="index-ends"><button data-scene="0">↶ &nbsp; A la portada</button><button data-scene="'+last+'">La última hoja &nbsp; ↗</button></div>';
function showStop(j){
 document.querySelectorAll('[data-stop]').forEach(btn=>btn.setAttribute('aria-pressed',String(Number(btn.getAttribute('data-stop'))===j)));
 sectionNames.forEach((name,k)=>{$('tramo-'+k).hidden=k!==j;});
 for(const thumb of $('tramo-'+j).querySelectorAll('[data-thumb]')){thumb.src=thumb.getAttribute('data-thumb');thumb.removeAttribute('data-thumb');}
}
document.querySelectorAll('[data-stop]').forEach(btn=>btn.onclick=()=>showStop(Number(btn.getAttribute('data-stop'))));
document.querySelectorAll('[data-scene]').forEach(button=>button.onclick=()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());go(Number(button.dataset.scene));});
// Draw from a shuffled stack. Crossing the end of the stack never reopens the same leaf.
const foldedSlips=[];
$('random-page').onclick=()=>{
 if(foldedSlips.length===1&&foldedSlips[0]===requested)foldedSlips.pop();
 if(!foldedSlips.length){
  for(let n=1;n<last;n++)foldedSlips.push(n);
  for(let n=foldedSlips.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[foldedSlips[n],foldedSlips[j]]=[foldedSlips[j],foldedSlips[n]];}
 }
 const end=foldedSlips.length-1;
 if(end>0&&foldedSlips[end]===requested)[foldedSlips[0],foldedSlips[end]]=[foldedSlips[end],foldedSlips[0]];
 $('index-dialog').close();return go(foldedSlips.pop());
};
$('prev').onclick=()=>go(requested-1);$('next').onclick=()=>go(requested+1);$('index-open').onclick=()=>{showStop(current===last?4:Math.max(0,sectionNames.indexOf(scenes[current].chapter)));$('index-dialog').showModal();};
$('note-open').onclick=()=>{
 const here=scenes[current],note=Post.forScene(here),n=here.kind==='finale'?4:Math.max(0,sectionNames.indexOf(here.chapter));
 $('letter-title').textContent=note.title;$('letter-one').textContent=note.first;$('letter-two').textContent=note.last;
 $('letter-stamp').src='thumbs/'+note.art+'.webp';$('letter-glyph').innerHTML=Post.glyph(n);$('letter-dialog').showModal();
};
document.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||event.altKey||event.ctrlKey||event.metaKey)return;if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();go(event.key==='Home'?0:event.key==='End'?last:requested+(event.key==='ArrowRight'?1:-1));}});
// Dragging is a reversible preview. History and the spoken page number change
// only after the reader lets go and the chosen leaf has actually landed.
let touch=null,liveDrag=null,hushClickUntil=0;
function discardDrag(){
 const d=liveDrag;touch=null;liveDrag=null;stage.removeAttribute('data-lift');if(!d)return;
 if(d.raf)cancelAnimationFrame(d.raf);stopMotion();scene.style.clipPath='none';outgoing.innerHTML='';
 ctx.drawImage(d.from,0,0,width,height);walker.show(current,0);showWords();
}
function drawHeld(d,p){
 d.shown=p;const clips=d.sheet.render(p);scene.style.clipPath=clips.outgoing;outgoing.style.clipPath=clips.incoming;walkFrame(d.g.start,d.target,p);
}
async function liftWithFinger(g){
 const target=bounded(g.start+g.dir);if(target===g.start)return;
 const dest=scenes[target],img=await imageReady(dest.image);
 if(touch!==g||turning||g.start!==current||g.serial!==requestSerial||reduced()||(dest.kind==='art'&&!img))return;
 stopMotion();showWords();scene.className='';
 const from=Studio.surface(factory,width,height,ratio);from.getContext('2d').drawImage(canvas,0,0,width,height);
 const to=Studio.surface(factory,width,height,ratio);Studio.compose(to.getContext('2d'),width,height,dest,img);
 outgoing.style.setProperty('--old-fg',dest.fg);outgoing.innerHTML=ghost(leafMarkup(dest,target,!!img));if(dest.kind==='finale'&&!reduced())readyForSunset(outgoing);else showWords(outgoing);
 const rollPrint=g.dir>0?printedFace(from,scene):printedFace(to,outgoing);
 const sheet=new window.BookStudio.PageTurn({context:ctx,previous:from,next:to,width,height,ratio,factory,direction:g.dir,leaf:g.dir>0?scenes[current]:dest,rollPrint});
 stage.setAttribute('data-lift','');liveDrag={sheet,from,to,target,shown:0,raf:0,g};drawHeld(liveDrag,g.p);
}
function updateFinger(g,dx){
 g.p=Math.max(0,Math.min(.965,(-dx*g.dir-9)/(width*.91)));
 const d=liveDrag;if(d&&d.g===g&&!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=0;if(liveDrag===d)drawHeld(d,g.p);});
}
async function dropLeaf(d,commit){
 if(d.raf){cancelAnimationFrame(d.raf);d.raf=0;}const p=d.shown,end=commit?1:0,epoch=motionEpoch;
 const ms=commit?Math.max(160,Math.min(870,(1-p)*d.sheet.duration*.78)):Math.max(145,Math.min(410,p*850));
 const landed=await animate(ms,u=>{const e=u*u*(3-2*u);drawHeld(d,p+(end-p)*e);},epoch);
 if(!landed||liveDrag!==d)return;liveDrag=null;stage.removeAttribute('data-lift');outgoing.innerHTML='';scene.style.clipPath='none';
 if(commit){await go(d.target,true,false,true);}else{ctx.drawImage(d.from,0,0,width,height);walker.show(current,0);showWords();}
}
function beginGesture(x,y){
 if(liveDrag)discardDrag();touch=document.querySelector('dialog[open]')?null:{x,y,start:current,serial:requestSerial,when:Date.now(),p:0,dir:0,pending:false};
}
function moveGesture(x,y){
 const g=touch;if(!g)return;const dx=x-g.x,dy=y-g.y;
 if(!g.dir){if(Math.abs(dy)>13&&Math.abs(dy)>Math.abs(dx)*1.1){touch=null;return;}if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.28)return;g.dir=dx<0?1:-1;}
 updateFinger(g,dx);
 if(!g.pending&&!turning&&!reduced()&&requested===current){g.pending=true;liftWithFinger(g).catch(()=>{if(touch===g)discardDrag();});}
}
function endGesture(x,y){
 const g=touch;if(!g||document.querySelector('dialog[open]'))return;touch=null;
 const dx=x-g.x,dy=y-g.y,d=liveDrag,dir=g.dir||(dx<0?1:-1),dist=-dx*dir,fast=Math.abs(dx)/Math.max(1,Date.now()-g.when)>.50;
 const commit=dist>Math.min(width*.22,83)||(fast&&dist>31);
 if(d&&d.g===g){hushClickUntil=Date.now()+400;dropLeaf(d,commit);return;}
 if(Math.abs(dx)>Math.abs(dy)*1.4&&commit){hushClickUntil=Date.now()+400;go(requested+dir);}
}
function cancelGesture(){touch=null;if(liveDrag){hushClickUntil=Date.now()+350;dropLeaf(liveDrag,false);}}
stage.addEventListener('touchstart',e=>{if(e.touches.length===1)beginGesture(e.touches[0].clientX,e.touches[0].clientY);else discardDrag();},{passive:true});
stage.addEventListener('touchmove',e=>{if(e.touches.length===1)moveGesture(e.touches[0].clientX,e.touches[0].clientY);else discardDrag();},{passive:true});
stage.addEventListener('touchend',e=>endGesture(e.changedTouches[0].clientX,e.changedTouches[0].clientY),{passive:true});
stage.addEventListener('touchcancel',cancelGesture,{passive:true});
let pointerId=null;
stage.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'||e.button!==0)return;const btn=e.target.closest?.('button');if(btn&&btn.id!=='inspect-art')return;
 pointerId=e.pointerId;beginGesture(e.clientX,e.clientY);
});
stage.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId)return;if(!(e.buttons&1)){pointerId=null;cancelGesture();return;}moveGesture(e.clientX,e.clientY);if(touch?.dir&&!stage.hasPointerCapture?.(e.pointerId)){stage.setPointerCapture?.(e.pointerId);e.preventDefault();}});
stage.addEventListener('pointerup',e=>{if(e.pointerId===pointerId){pointerId=null;endGesture(e.clientX,e.clientY);}});
stage.addEventListener('pointercancel',e=>{if(e.pointerId===pointerId){pointerId=null;cancelGesture();}});
stage.addEventListener('click',event=>{if(Date.now()<hushClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
window.addEventListener('hashchange',()=>{if(location.hash==='#scene'){scene.focus({preventScroll:true});return;}return go(fromAddress(location.hash));});
function settleResize(){clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const r=stage.getBoundingClientRect();if(Math.abs(r.width-width)<2&&Math.abs(r.height-height)<2)return;discardDrag();stopMotion();turning=false;scene.style.clipPath='none';sizeSurfaces();walker.show(current,0);outgoing.innerHTML='';Studio.compose(ctx,width,height,scenes[current],activeImage);showWords();scene.className='';},120);}
if(typeof ResizeObserver!=='undefined')new ResizeObserver(settleResize).observe(stage);else window.addEventListener('resize',settleResize);
motionPreference.addEventListener?.('change',()=>{if(reduced()){discardDrag();stopMotion();turning=false;scene.style.clipPath='none';walker.show(current,0);outgoing.innerHTML='';Studio.compose(ctx,width,height,scenes[current],activeImage);showWords();scene.className='';}});
sizeSurfaces();const opening=scenes[current];document.documentElement.style.setProperty('--bg',opening.bg);ctx.fillStyle=opening.bg;ctx.fillRect(0,0,width,height);go(current,false,true);
})();
