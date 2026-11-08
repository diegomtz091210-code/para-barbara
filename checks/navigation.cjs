// Run the real app with a small DOM and a controlled animation clock.
// Canvas pixels are checked separately in book-engine.cjs and journey.cjs. This is not a browser.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const settle=()=>new Promise(setImmediate);
const realStudio=require('../dist/brush-engine.js');
function harness({reduced=true,hash='#0'}={}){
 const nodes=new Map(),all=[],docEvents={},winEvents={},timers=new Map(),frames=new Map(),heldImages=new Map();
 let timerId=0,frameId=0,clock=0,brushCalls=0,pageCalls=0,preferenceChange,turnStart=null,turnEnd=null;
 const draw={setTransform(){},clearRect(){},fillRect(){},drawImage(){}};
 class Element{
  constructor(tag='div',attrs={}){this.tag=tag;this.attrs=attrs;this.id=attrs.id||'';this.className=attrs.class||'';this.children=[];this.dataset={};this.events={};this.style={setProperty(k,v){this[k]=v;}};this.open=false;this.disabled=false;all.push(this);if(this.id)nodes.set(this.id,this);if(attrs['data-scene']!==undefined)this.dataset.scene=attrs['data-scene'];}
  set innerHTML(html){this.html=html;this.children=[];const stack=[this];for(const token of html.matchAll(/<\/?[a-z][^>]*>/gi)){const raw=token[0];if(raw.startsWith('</')){if(stack.length>1)stack.pop();continue;}const tag=raw.match(/^<([a-z]+)/i)[1];const attrs={};for(const attr of raw.matchAll(/([\w-]+)(?:="([^"]*)")?/g)){if(attr[1]!==tag)attrs[attr[1]]=attr[2]??'';}const el=new Element(tag,attrs);el.parent=stack.at(-1);el.parent.children.push(el);if(!['br','img','meta','link','input'].includes(tag))stack.push(el);}}
  get innerHTML(){return this.html||'';}
  getAttribute(k){return this.attrs[k]??null;}
  querySelectorAll(selector){const found=[];const visit=n=>{for(const child of n.children){if(matches(child,selector))found.push(child);visit(child);}};visit(this);return found;}
  setAttribute(k,v){this.attrs[k]=v;}removeAttribute(k){delete this.attrs[k];}
  addEventListener(k,f){this.events[k]=f;}focus(){}showModal(){this.open=true;}close(){this.open=false;}getContext(){return draw;}
  closest(tag){let el=this;while(el&&el.tag!==tag)el=el.parent;return el;}
  getBoundingClientRect(){if(this.id==='stage')return {left:0,top:0,right:390,bottom:664,width:390,height:664};const index=this.parent?.children.indexOf(this)||0;const x=24+(index%5)*42,y=70+Math.floor(index/5)*32;return {left:x,top:y,right:x+38,bottom:y+30,width:38,height:30};}
 }
 const matches=(n,s)=>s.startsWith('.')?n.className.split(' ').includes(s.slice(1)):s==='dialog[open]'?n.tag==='dialog'&&n.open:s.startsWith('[')?Object.hasOwn(n.attrs,s.slice(1,-1)):n.tag===s;
 const body=new Element('body');body.innerHTML=fs.readFileSync('dist/index.html','utf8');
 const document={getElementById:id=>nodes.get(id),documentElement:new Element('html'),createElement:tag=>new Element(tag),fonts:{load:()=>Promise.resolve()},querySelector:s=>s==='meta[name="theme-color"]'?{}:document.querySelectorAll(s)[0]||null,querySelectorAll:s=>body.querySelectorAll(s),addEventListener:(k,f)=>docEvents[k]=f};
 const preference={matches:reduced,addEventListener:(name,fn)=>preferenceChange=fn};
 const walkSamples=[];
 const window={addEventListener:(k,f)=>winEvents[k]=f,devicePixelRatio:2,matchMedia:()=>preference};
 const location={hash},history={replaceState:(a,b,v)=>location.hash=v};
 class FakeImage{set src(value){this.url=value;this.complete=true;this.naturalWidth=1000;this.onload?.();}decode(){return heldImages.get(this.url)||Promise.resolve();}}
 window.BrushStudio={clamp:v=>Math.max(0,Math.min(1,v)),surface:()=>new Element('canvas'),compose(){},drawBrush(){brushCalls++;},travel:realStudio.travel};
 window.Endpapers=require('../dist/endpapers.js');window.Postscript=require('../dist/postscript.js');window.JourneyStudio={Journey:class{constructor(){this.position=0;}resize(){}show(page,activity=0,dir){walkSamples.push({page,activity,dir});this.position=page;}}};
 window.BookStudio={PageTurn:class{
  constructor(){this.duration=1690;}
  clips(p){return {incoming:p===0?'inset(0 100% 0 0)':'none',outgoing:p===1?'inset(0 100% 0 0)':'none'};}
  render(p){pageCalls++;if(p===0)turnStart=clock;if(p===1)turnEnd=clock;return this.clips(p);}
 }};
 const ctx=vm.createContext({document,window,location,history,Image:FakeImage,console,getComputedStyle:()=>({fontSize:'24px',color:'#39352f'}),setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id)});
 vm.runInContext(fs.readFileSync('dist/artworks.js','utf8'),ctx);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),ctx);
 const key=async k=>{docEvents.keydown({key:k,preventDefault(){}});await settle();};
 const tick=async()=>{clock+=100;const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(clock);await settle();};
 const finish=async()=>{for(let i=0;frames.size&&i<180;i++)await tick();assert.equal(frames.size,0,'animation must settle');};
 return {nodes,window,walkSamples,location,winEvents,heldImages,key,tick,finish,timers,frames,counts:()=>({brushCalls,pageCalls,turnElapsed:turnEnd-turnStart}),setReduced:()=>{preference.matches=true;preferenceChange();}};
}
(async()=>{
 const h=harness();await settle();const {nodes,window,location,heldImages,winEvents,key}=h;
 const last=window.ARTWORKS.length+1,total=last+1;
 assert.equal(total,51);assert.equal(window.ARTWORKS.filter(a=>a.artist==='Vincent van Gogh').length,22);assert.equal(nodes.get('page').textContent,'01 / 51');assert.equal(nodes.get('prev').disabled,true);
 let release;heldImages.set(window.ARTWORKS.find(a=>a.id==='red-fuji').image,new Promise(r=>release=r));
 location.hash='#12';const delayed=winEvents.hashchange();await settle();assert.equal(nodes.get('page').textContent,'01 / 51');assert.equal(nodes.get('scene').attrs['aria-busy'],'true');
 await key('End');assert.equal(location.hash,'#te-amo');release();await delayed;assert.equal(location.hash,'#te-amo');assert.equal(nodes.get('page').textContent,'51 / 51');
 await key('Home');for(let i=1;i<total;i++){await key('ArrowRight');assert.equal(nodes.get('page').textContent,String(i+1).padStart(2,'0')+' / '+total);}
 assert.equal(nodes.get('next').disabled,true);await key('ArrowRight');assert.equal(location.hash,'#te-amo');
 await key('Home');nodes.get('index-open').onclick();await key('ArrowRight');assert.equal(location.hash,'#0');nodes.get('index-dialog').close();
 await nodes.get('enter').onclick();assert.equal(location.hash,'#obra/durer');nodes.get('inspect-art').onclick();assert.equal(nodes.get('art-dialog').open,true);assert.equal(nodes.get('full-image').src,window.ARTWORKS[0].image);nodes.get('art-dialog').close();
 await key('End');await nodes.get('restart').onclick();assert.equal(location.hash,'#0');
 location.hash='#1.5';await winEvents.hashchange();assert.equal(location.hash,'#obra/durer');location.hash='#Infinity';await winEvents.hashchange();assert.equal(location.hash,'#0');
 const stage=nodes.get('stage');stage.events.touchstart({touches:[{clientX:300,clientY:50}]});stage.events.touchend({changedTouches:[{clientX:100,clientY:60}]});await settle();assert.equal(location.hash,'#obra/durer');
 await key('ArrowLeft');await key('ArrowLeft');assert.equal(location.hash,'#0');
 stage.events.touchstart({touches:[{clientX:300,clientY:50}]});stage.events.touchcancel();stage.events.touchend({changedTouches:[{clientX:100,clientY:60}]});await settle();assert.equal(location.hash,'#0');
 nodes.get('next').onclick();nodes.get('next').onclick();nodes.get('next').onclick();await settle();assert.equal(location.hash,'#obra/snow-magpie');
 assert(h.walkSamples.every(p=>!p.activity),'reduced motion changes the position without walking');assert.equal(h.walkSamples.at(-1).page,3);assert.equal(h.frames.size,0,'reduced motion must skip every animation');assert.equal(nodes.get('outgoing').innerHTML,'');assert(nodes.get('scene').querySelectorAll('.ink-word').every(w=>w.style.clipPath==='none'));
 // Retired paintings still have working bookmarks; the terrace and the walk have different letters.
 for(const [old,canonical] of [['#2','rembrandt-saskia'],['#obra/rembrandt','rembrandt-saskia'],['#obra/renoir-bougival','renoir-promenade']]){
  location.hash=old;await winEvents.hashchange();assert.equal(location.hash,'#obra/'+canonical);
 }
 const stampTitles=new Set(),firstLines=new Set();
 for(const a of window.ARTWORKS){
  location.hash='#obra/'+a.id;await winEvents.hashchange();nodes.get('note-open').onclick();
  stampTitles.add(nodes.get('letter-title').textContent);firstLines.add(nodes.get('letter-one').textContent);assert.equal(nodes.get('letter-stamp').src,'thumbs/'+a.id+'.webp');
  assert(nodes.get('letter-two').textContent);nodes.get('letter-dialog').close();
 }
 assert.equal(stampTitles.size,49);assert.equal(firstLines.size,49);
 assert.equal(window.ARTWORKS.find(a=>a.id==='seurat').poem,'Me gusta pasar contigo un día sin planes.');
 assert(!window.ARTWORKS.some(a=>/bail(a|e)/i.test([a.poem,a.title,...Object.values(a.note)].join(' '))));
 await key('Home');const draws=new Set();
 for(let j=0;j<49;j++){
  const before=location.hash;nodes.get('index-open').onclick();await nodes.get('random-page').onclick();assert(!nodes.get('index-dialog').open);assert.match(location.hash,/^#obra\//);assert.notEqual(location.hash,before);draws.add(location.hash);
 }
 assert.equal(draws.size,49);const lastDraw=location.hash;nodes.get('index-open').onclick();await nodes.get('random-page').onclick();assert.notEqual(location.hash,lastDraw);
 // Interrupt a page turn: only the cover may use the brush, and the latest page must settle.
 const motion=harness({reduced:false});await settle();await motion.finish();assert(motion.counts().brushCalls>0);assert.equal(motion.counts().pageCalls,0);const coverBrushCalls=motion.counts().brushCalls;
 await motion.key('ArrowRight');await motion.tick();await motion.tick();assert(motion.nodes.get('outgoing').innerHTML.length);assert(!/\sid="/.test(motion.nodes.get('outgoing').innerHTML));
 await motion.key('ArrowRight');await motion.finish();assert.equal(motion.location.hash,'#obra/rembrandt-saskia');assert(motion.counts().turnElapsed>=1690&&motion.counts().turnElapsed<=1790,'page turn duration must match its clock');assert.equal(motion.counts().brushCalls,coverBrushCalls,'artwork transitions must never draw a brush');assert.equal(motion.nodes.get('scene').style.clipPath,'none');assert.equal(motion.nodes.get('outgoing').innerHTML,'');assert(motion.nodes.get('scene').querySelectorAll('.ink-word').every(w=>w.style.clipPath==='none'));
 await motion.key('ArrowRight');await motion.tick();motion.setReduced();await motion.finish();assert.equal(motion.nodes.get('outgoing').innerHTML,'');assert(motion.nodes.get('scene').querySelectorAll('.ink-word').every(w=>w.style.clipPath==='none'));
 // On a phone the page follows the drag, but a tentative lift must not commit navigation.
 const drag=harness({reduced:false,hash:'#7'});await settle();const surf=drag.nodes.get('stage');
 const before=drag.walkSamples.at(-1).page;assert.equal(window.ARTWORKS[before-1].id,'sunflowers','old numeric bookmarks still open the original painting');
 const ts=(x,y)=>surf.events.touchstart({touches:[{clientX:x,clientY:y}]}),tm=(x,y)=>surf.events.touchmove({touches:[{clientX:x,clientY:y}]}),te=(x,y)=>surf.events.touchend({changedTouches:[{clientX:x,clientY:y}]});
 ts(300,488);tm(268,487);await settle();await drag.tick();assert(drag.counts().pageCalls>0);assert(drag.walkSamples.at(-1).page>before&&drag.walkSamples.at(-1).page<before+1,'the couple should follow a held page');assert.equal(drag.location.hash,'#obra/sunflowers','drag preview does not alter history');
 tm(295,487);await drag.tick();te(295,487);await drag.finish();assert.equal(drag.location.hash,'#obra/sunflowers');assert.equal(drag.nodes.get('outgoing').innerHTML,'');assert.equal(drag.walkSamples.at(-1).page,before,'a returned leaf leaves no progress behind');
 ts(304,492);tm(178,488);await settle();await drag.tick();te(166,489);await drag.finish();assert.equal(drag.location.hash,'#obra/yellow-house');assert.equal(drag.walkSamples.at(-1).page,before+1);assert.equal(drag.nodes.get('scene').style.clipPath,'none');
 ts(44,361);tm(151,363);await settle();await drag.tick();surf.events.touchcancel();await drag.finish();assert.equal(drag.location.hash,'#obra/yellow-house','touch cancellation returns to the same page');
 ts(44,361);tm(153,363);await settle();await drag.tick();te(174,362);await drag.finish();assert.equal(drag.location.hash,'#obra/sunflowers','the same gesture turns backward');assert.equal(drag.walkSamples.at(-1).page,before);
 const walking=harness({reduced:false,hash:'#obra/cot-springtime'});await settle();const a=walking.walkSamples.at(-1).page,n=walking.walkSamples.length;
 await walking.key('ArrowRight');await walking.finish();const forward=walking.walkSamples.slice(n);assert(forward.some(f=>f.page>a&&f.page<a+1&&f.activity>.3));assert.equal(forward.at(-1).page,a+1);
 const m=walking.walkSamples.length;await walking.key('ArrowLeft');await walking.finish();const back=walking.walkSamples.slice(m);assert(back.some(f=>f.page>a&&f.page<a+1&&f.activity>.3&&f.dir===-1));assert.equal(back.at(-1).page,a);
 walking.nodes.get('note-open').onclick();assert.equal(walking.nodes.get('letter-dialog').open,true);assert.equal(walking.nodes.get('letter-stamp').src,'thumbs/cot-springtime.webp');await walking.key('ArrowRight');assert.equal(walking.location.hash,'#obra/cot-springtime');walking.nodes.get('letter-dialog').close();
 // A direct link (including the old last-page bookmark) must reveal the same
 // three parts in order, without the first visible frame giving the ending away.
 const deep=harness({reduced:false,hash:'#31'});await settle();
 const lines=deep.nodes.get('scene').querySelectorAll('[data-write]').map(node=>node.querySelectorAll('.ink-word'));
 assert.deepEqual(lines.map(g=>g.length),[1,2,9]);assert(lines.flat().every(w=>w.style.opacity==='0'));
 for(let n=0;n<10;n++)await deep.tick();
 assert(lines[0].every(w=>w.style.opacity==='1'));assert(lines[1].every(w=>w.style.opacity==='0'));assert(lines[2].every(w=>w.style.opacity==='0'));
 for(let n=0;n<11;n++)await deep.tick();assert(lines[1].every(w=>w.style.opacity==='1'));assert(lines[2].every(w=>w.style.opacity==='0'));
 await deep.finish();assert(lines.flat().every(w=>w.style.opacity==='1'&&w.style.clipPath==='none'));
 assert.equal(deep.counts().brushCalls,0,'no brush on the sunset');assert.equal(deep.frames.size,0);assert.equal(deep.location.hash,'#te-amo');assert(deep.nodes.get('scene').innerHTML.includes('Te</span> <span class="ink-word">amo'));
 const still=harness({reduced:true,hash:'#te-amo'});await settle();assert(still.nodes.get('scene').querySelectorAll('.ink-word').every(w=>w.style.opacity==='1'));assert.equal(still.frames.size,0);
 const peek=harness({reduced:false,hash:'#obra/vangogh'});await settle();const lastStage=peek.nodes.get('stage');lastStage.events.touchstart({touches:[{clientX:300,clientY:280}]});lastStage.events.touchmove({touches:[{clientX:185,clientY:278}]});await settle();await peek.tick();
 assert(peek.nodes.get('outgoing').querySelectorAll('.ink-word').length>0);assert(peek.nodes.get('outgoing').querySelectorAll('.ink-word').every(w=>w.style.opacity==='0'),'lifting the final leaf must not flash the whole message');
 lastStage.events.touchcancel();await peek.finish();assert.equal(peek.location.hash,'#obra/vangogh');
 console.log('PASS: 51 scenes, 49 distinct painting letters and random pages, 22 by Van Gogh, forward/backward walker, reversible drag, letters, stable links and legacy bookmarks, navigation limits, keyboard, modal lock, details, restart, hashes, held corner preview, return or commit gesture, swipe/cancel, delayed decode, latest request wins, rapid controls, left-page turns, animation cancellation/cleanup, cover-only brush, complete pages, staged sunset dedication, reduced motion and direct links. DOM simulation, not browser rendering.');
})().catch(e=>{console.error(e);process.exitCode=1;});
