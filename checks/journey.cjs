/* Test what is actually printed, not just the two character origins. */
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {createCanvas}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));
const {Journey,location}=require('../dist/journey.js'),{draw}=require('../dist/traveler.js'),works=require('../artworks.json');
const factory=()=>createCanvas(1,1),last=works.length+1;
function region(px,test){const pts=[];for(let y=0;y<px.height;y++)for(let x=0;x<px.width;x++){const k=(y*px.width+x)*4;if(test(px.data,k))pts.push([x,y]);}return pts;}
function headConnection(h,gait,phase,facing){
 const w=150,hh=100,x=75,y=78,cv=createCanvas(w,hh),c=cv.getContext('2d');
 draw(c,x,y,h,{phase,activity:gait,progress:.80,facing,ink:'#302e29',accent:'#aa7555'});
 const px=c.getImageData(0,0,w,hh),ink=Uint8Array.from({length:w*hh},(_,i)=>px.data[i*4+3]>43&&Math.floor(i/w)<y-h*.38?1:0);
 const nearest=(xx,yy)=>{let best=-1,d=Infinity;for(let j=0;j<ink.length;j++)if(ink[j]){const dx=j%w-xx,dy=Math.floor(j/w)-yy,k=dx*dx+dy*dy;if(k<d){d=k;best=j;}}assert(d<h*h*.012,'both actual heads must be inked');return best;};
 const left=nearest(x-.258*h,y-.804*h),right=nearest(x+.258*h,y-.804*h);
 // Two separately shaped heads above the elbows, with room between their faces.
 let runs=0,prev=false;for(let i=Math.floor(x-h*.50);i<=Math.ceil(x+h*.50);i++){let occupied=false;for(let j=Math.floor(y-h*.92);j<y-h*.775;j++)occupied||=!!ink[j*w+i];if(occupied&&!prev)runs++;prev=occupied;}assert(runs>=2,'two distinct heads must survive phone rasterization');
 const connected=(from,to)=>{const visited=new Uint8Array(w*hh),q=[from];visited[from]=1;for(let ni=0;ni<q.length;ni++){const a=q[ni];if(a===to)return true;for(const off of [-w-1,-w,-w+1,-1,1,w-1,w,w+1]){const j=a+off;if(j>0&&j<w*hh&&ink[j]&&!visited[j]){visited[j]=1;q.push(j);}}}return false;};
 assert(connected(left,right),'an ink path must link the two upper bodies through the hands');
 // Erase only the little clasp in the gap. This must break their single path;
 // neither touching legs nor a generic line elsewhere can satisfy this check.
 for(let j=Math.floor(y-.59*h);j<=Math.ceil(y-.39*h);j++)for(let i=Math.floor(x-h*.047);i<=Math.ceil(x+h*.047);i++)ink[j*w+i]=0;
 assert(!connected(left,right),'the clasp, not the clothes or shoes, must connect them');
 if(!gait){const pts=region(px,(d,k)=>d[k+3]>70);const top=(lo,hi)=>Math.min(...pts.filter(([xx])=>xx>lo&&xx<hi).map(p=>p[1]));const a=top(x-h*.48,x-h*.12),b=top(x+h*.12,x+h*.48);assert(facing>0?b<a:a<b,'the taller boy leads in the actual direction of travel');}
}
let poses=0;for(const h of [33,40,51])for(const f of [-1,1])for(const [a,ph] of [[0,0],[.55,.6],[1,1.5],[1,3.3],[1,4.7]]){headConnection(h,a,ph,f);poses++;}
const sheet=createCanvas(1280,604),sc=sheet.getContext('2d');sc.fillStyle='#efe7d6';sc.fillRect(0,0,sheet.width,sheet.height);
const preview=[['Comienzo',0,0],['Paseo',13.2,1],['Al regreso',16.8,1],['Llegada',last,0]];
for(const [index,[w,h,ratio]] of [[320,53,1],[390,68,2],[1363,79,1]].entries()){
 const dest=factory(),j=new Journey(dest,factory,last);j.resize(w,h,ratio);
 const pixels=()=>dest.getContext('2d').getImageData(0,0,dest.width,dest.height);
 // Detect dark ink by luminance, independent of whether it is brown or blue.
 const marks=()=>region(pixels(),(d,k)=>.2126*d[k]+.7152*d[k+1]+.0722*d[k+2]<65).map(([x,y])=>[x/j.dpr,y/j.dpr]);
 function ink(){const p=marks();assert(p.length>100,'the two figures must be visible against the printed landscape');return p.reduce((sum,q)=>sum+q[0],0)/p.length;}
 j.show(7,0,1);const x1=ink();j.show(8,0,1);const x2=ink();assert(x2>x1+3,'the group advances even on a narrow phone');
 j.show(7.99,.26,-1);assert(j.turn>0&&j.turn<.05,'a reversal starts a physical turn instead of swapping sides');
 for(let n=1;n<=10;n++)j.show(7.99-n*.024,.78,-1);const pivot=j.turn;assert(pivot>.25&&pivot<.75);j.show(j.position,0,-1);const paused=Buffer.from(pixels().data);j.show(j.position,0,-1);assert.equal(j.turn,pivot);assert.deepEqual(Buffer.from(pixels().data),paused,'standing halfway through a turn must be stable');
 for(let n=1;n<=21;n++)j.show(7.75-n*.035,.83,-1);j.show(7,0,-1);assert.equal(j.facing,-1);assert.equal(j.turn,1);assert(Math.abs(ink()-x1)<8,'the two children retrace the landscape');
 const loc=location(j.m,7);assert(Math.abs(loc.screenX-ink())<8,'the group stays registered to the path');
 for(const [page,dir] of [[0,-1],[0,1],[last,1]]){if(page===0&&dir===1)j.show(5,0,1);j.show(page,0,dir);const ps=marks(),xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);assert(Math.min(...xs)>2&&Math.max(...xs)<w-3&&Math.min(...ys)>.2&&Math.max(...ys)<h-.5,'both silhouettes fit at the ends');}
 const arrival=location(j.m,last),flowers=region(pixels(),(d,k)=>Math.hypot(d[k]-187,d[k+1]-133,d[k+2]-80)<28);assert(flowers.some(([x,y])=>x/j.dpr>arrival.screenX+h*.29&&x/j.dpr<w-2&&y/j.dpr<h*.66),'the warm petals, including antialiased ones at 1×, fit at the end');
 // Optional contact sheet: four states of each actual footer, including the
 // compact and high-density phone sizes. No bitmap becomes a runtime asset.
 if(process.argv[2]){const sample=factory(),previewWalk=new Journey(sample,factory,last);previewWalk.resize(w,h,ratio);const firstY=index===0?9:index===1?122:262;sc.font='14px sans-serif';sc.fillStyle='#493d2d';sc.fillText(`${w} px · ${ratio}×`,12,firstY+15);
  for(const [i,[label,page,a]] of preview.entries()){if(i===2){previewWalk.show(20,0,1);previewWalk.show(17,0,-1);}previewWalk.show(page,a,i===2?-1:1);const mobile=w<500,scl=mobile?Math.min(1,307/w):.44,xx=mobile?8+i*318:8+(i%2)*631,yy=firstY+(mobile?26:26+Math.floor(i/2)*76);sc.drawImage(sample,xx,yy,w*scl,h*scl);sc.font='12px sans-serif';sc.fillText(label,xx,yy+h*scl+14);}}
}
if(process.argv[2]){const yy=542;sc.font='14px sans-serif';sc.fillStyle='#493d2d';sc.fillText('Detalle del mismo dibujo · vuelta alrededor de las manos',12,455);for(const [i,t] of [0,.16,.32,.50,.68,.84,1].entries())draw(sc,90+181*i,yy+43,105,{phase:1.2,activity:.7,turn:t,progress:.82,ink:'#302e29',accent:'#b7844f'});fs.writeFileSync(process.argv[2],sheet.toBuffer('image/png'));}
console.log(`PASS: ${poses} two-figure poses linked at their palms, distinct readable heads, boy leading both directions, gradual and interruptible return, flower and feet fully visible, actual journey at 320/390/1363 px.`);
