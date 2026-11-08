/* Draw the things an art notebook contains: colour trials, enlarged fragments and margin sketches. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./plate-studies.js'):root.PlateStudies);if(typeof module==='object'&&module.exports)module.exports=api;else root.FolioStudio=api;})(typeof window!=='undefined'?window:globalThis,function(PlateStudies){
 'use strict';
 const cap=(a,l,r)=>Math.max(l,Math.min(r,a)),TAU=Math.PI*2;
 const acts=['lo que siento','lo que veo','lo que eres','lo que cuido','lo que elijo'];
 const roman=['I','II','III','IV','V'];
 const act=s=>Math.max(0,s.chapter?acts.indexOf(s.chapter):Math.min(4,Math.floor(((s.order||1)-1)/6)));
 function layout(iw,ih,w,h,s={}){
  const phone=w<685||w/h<.93,low=h<395,odd=(s.order||1)%2===1;
  const pad=phone?cap(w*.055,13,28):Math.max(26,w*.047);
  const top=low?12:phone?cap(h*.068,22,56):cap(h*.061,20,57);
  const foot=low?99:phone?cap(h*.22,150,180):cap(h*.17,132,180);
  const gutter=!phone&&!low?cap(w*.185,115,316):0;
  const left=pad+(odd?0:gutter),right=pad+(odd?gutter:0),availableHeight=Math.max(30,h-top-foot);
  const scale=Math.min((w-left-right)/iw,availableHeight/ih),pw=iw*scale,ph=ih*scale;
  const x=left+(w-left-right-pw)*.5,y=top+(availableHeight-ph)*(phone?.54:.50);
  return {x,y,w:pw,h:ph,phone,low,odd,pad,foot};
 }
 function sprig(c,olive){
  c.beginPath();c.moveTo(-16,49);c.bezierCurveTo(3,26,-4,0,22,-46);c.moveTo(-9,35);c.bezierCurveTo(-29,14,-24,-4,-34,-21);c.stroke();
  function leaf(x,y,a,l,b){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-b,-l*.30,-b*.75,-l*.78,0,-l);c.bezierCurveTo(b*.78,-l*.62,b*.6,-l*.2,0,0);c.moveTo(0,0);c.quadraticCurveTo(-.7,-l*.5,0,-l);c.stroke();c.save();c.globalAlpha*=.55;c.lineWidth=.43;for(let k=2;k<9;k++){const v=k/10;c.beginPath();c.moveTo(-b*Math.sin(v*Math.PI)*.56,-l*v);c.lineTo(0,-l*(v+.07));c.stroke();}c.restore();c.restore();}
  const ll=olive?24:16,b=olive?7:3.7;
  [[-8,31,-1.00],[-5,23,.93],[-3,14,-.87],[0,5,1.08],[5,-7,-.69],[9,-18,.82],[16,-31,-.38],[-20,15,-1.05],[-26,-1,.58],[-30,-12,-.85]].forEach(([x,y,a],i)=>leaf(x,y,a,ll*(.79+.15*Math.sin(i)),b));
  if(olive){for(const [x,y] of [[0,12],[-3,15],[11,-13]]){c.save();c.translate(x,y);c.rotate(.4);c.beginPath();c.ellipse(0,0,2.4,4,.1,0,TAU);c.fill();c.restore();}}
 }
 function flower(c){
  c.beginPath();c.moveTo(-15,48);c.bezierCurveTo(-5,29,-7,10,3,-9);c.moveTo(-6,23);c.quadraticCurveTo(10,20,16,8);c.quadraticCurveTo(4,9,-6,23);c.moveTo(-8,30);c.quadraticCurveTo(-21,23,-24,9);c.quadraticCurveTo(-10,15,-8,30);c.stroke();
  c.save();c.translate(5,-15);for(let i=0;i<7;i++){c.save();c.rotate(i*TAU/7);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-9,-7,-14,-16,-10,-23);c.bezierCurveTo(-6,-28,-1,-25,2,-22);c.bezierCurveTo(8,-26,12,-18,8,-12);c.quadraticCurveTo(7,-4,0,0);c.stroke();c.globalAlpha*=.48;c.beginPath();c.moveTo(0,-3);c.quadraticCurveTo(-4,-13,-7,-19);c.moveTo(1,-3);c.quadraticCurveTo(2,-10,6,-17);c.stroke();c.restore();}c.beginPath();c.arc(0,0,4.1,0,TAU);c.fill();c.restore();
 }
 function sun(c){
  c.save();c.translate(0,-3);for(let j=0;j<30;j++){const a=j*TAU/30,inner=18+(j%2)*3,outer=j%3===0?43:j%2?33:27;c.beginPath();c.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);c.quadraticCurveTo(Math.cos(a+.025)*(inner+7),Math.sin(a+.025)*(inner+7),Math.cos(a+.006)*outer,Math.sin(a+.006)*outer);c.stroke();}c.beginPath();c.ellipse(0,0,15.6,15.1,.15,0,TAU);c.stroke();c.globalAlpha*=.65;for(let j=-9;j<11;j+=3){const q=Math.sqrt(14*14-j*j);c.beginPath();c.moveTo(-q,j);c.quadraticCurveTo(-5,j-2,1+j/4,j-4);c.stroke();}c.restore();
 }
 function stars(c){
  const pts=[[-37,20],[-18,8],[-5,14],[9,-7],[24,-16],[40,-32]];c.save();c.globalAlpha*=.65;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();
  pts.forEach(([x,y],i)=>{const a=i===3?7:i%2?4.5:2.7;c.beginPath();c.moveTo(x-a,y);c.quadraticCurveTo(x,y-1,x,y-a*1.55);c.quadraticCurveTo(x+.5,y-1,x+a,y);c.quadraticCurveTo(x,y+1,x,y+a*1.55);c.quadraticCurveTo(x-1,y+1,x-a,y);c.fill();});c.beginPath();c.arc(8,-5,32,-1.73,-.29);c.stroke();
 }
 function motif(c,id,x,y,size,color,alpha=1){
  c.save();c.translate(x,y);c.scale(size/100,size/100);c.strokeStyle=c.fillStyle=color;c.lineWidth=1.05;c.lineCap='round';c.lineJoin='round';c.globalAlpha*=alpha;
  if(id===0)sprig(c,false);else if(id===1)sun(c);else if(id===2)flower(c);else if(id===3)sprig(c,true);else stars(c);c.restore();
 }
 function dab(c,x,y,w,h,color,k){
  c.save();c.translate(x,y);c.rotate((k%2?1:-1)*.055);c.fillStyle=color;
  c.beginPath();for(let j=0;j<=22;j++){const f=j/22,taper=Math.sin(f*Math.PI)**.30,noise=Math.sin(j*3.03+k*1.71)*.11;const yy=-(.38+noise)*h*taper;if(j)c.lineTo(f*w,yy);else c.moveTo(0,0);}for(let j=22;j>=0;j--){const f=j/22,taper=Math.sin(f*Math.PI)**.33;c.lineTo(f*w,h*(.36+.10*Math.sin(j*2.9+k))*taper);}c.closePath();c.fill();c.globalAlpha*=.37;
  for(let i=0;i<5;i++){c.fillRect(w*.05+w*((i*7+k)%11)/22,(i-2)*h*.19,w*(.45+.10*Math.cos(i)),.45);}c.strokeStyle='rgba(252,234,196,.58)';c.lineWidth=.48;c.beginPath();c.moveTo(w*.21,-h*.15);c.quadraticCurveTo(w*.46,-h*.27,w*.76,-h*.1);c.stroke();c.restore();
 }
 function swatches(c,x,y,w,p){const gap=w*.035,d=(w-gap*3)/4;p.forEach((v,i)=>dab(c,x+i*(d+gap),y+Math.sin(i*1.8)*1.2,d,cap(w*.13,9,20),v,i));}
 function surround(c,w,h,s,img,b){
  const odd=b.odd,dark=!!s.dark,colors=s.pigments||(dark?['#344747','#798876','#aaa47d','#ddd2ad']:['#47443d','#9c947d','#cbbf99','#e3d5b1']);
  // Keep the painting in the margins, as if it had soaked into the fibres.
  c.save();const wash=c.createLinearGradient(0,0,w*.8,h);wash.addColorStop(0,dark?'rgba(20,30,48,.47)':'rgba(243,235,215,.61)');wash.addColorStop(.55,dark?'rgba(23,35,54,.30)':'rgba(248,240,221,.43)');wash.addColorStop(1,dark?'rgba(19,29,47,.69)':'rgba(246,239,222,.78)');c.fillStyle=wash;c.fillRect(0,0,w,h);
  PlateStudies.draw(c,w,h,s,img,b);
  // Four actual pigments from the reproduction share the tail of the page with the letter.
  const pw=b.phone?cap(w*.23,65,96):cap(w*.104,96,154),px=odd?w-b.pad-pw:b.pad,py=h-(b.low?17:b.phone?31:42);
  swatches(c,px,py,pw,colors);
  const gx=c.createLinearGradient(0,0,Math.min(30,w*.047),0);gx.addColorStop(0,'rgba(36,28,20,.24)');gx.addColorStop(.20,'rgba(36,28,20,.10)');gx.addColorStop(1,'rgba(36,28,20,0)');c.fillStyle=gx;c.fillRect(0,0,Math.min(30,w*.047),h);
  for(let i=0;i<3;i++){c.strokeStyle=i===1?'rgba(70,49,27,.19)':'rgba(244,228,193,.36)';c.lineWidth=.65;c.beginPath();c.moveTo(w-1.2-i*1.7,0);c.quadraticCurveTo(w-i*1.7-1.8,h*.48,w-i*1.7-1.1,h);c.stroke();}
  c.restore();
 }
 function mount(c,b,dark){
  const {x,y,w,h}=b;c.save();c.shadowColor=dark?'rgba(9,12,14,.48)':'rgba(45,32,13,.25)';c.shadowBlur=b.phone?6:11;c.shadowOffsetX=1.3;c.shadowOffsetY=b.phone?3:5;
  c.beginPath();c.moveTo(x-1.8,y-2.3);c.lineTo(x+w*.48,y-1.4);c.lineTo(x+w+2.1,y-2.2);c.lineTo(x+w+2.6,y+h+2.1);c.lineTo(x+w*.28,y+h+2.8);c.lineTo(x-1.9,y+h+2);c.closePath();c.fillStyle='#e9dfc5';c.fill();c.restore();
  // A printer's registration pencil mark lives outside the original.
  c.save();c.strokeStyle=dark?'rgba(246,228,189,.60)':'rgba(61,48,35,.50)';c.lineWidth=.7;
  for(const [xx,yy,sx,sy] of [[x,y,-1,-1],[x+w,y+h,1,1]]){c.beginPath();c.moveTo(xx+sx*4,yy);c.lineTo(xx+sx*10,yy);c.moveTo(xx,yy+sy*4);c.lineTo(xx,yy+sy*10);c.stroke();}c.restore();
 }
 function verso(c,w,h,s={}){
  const id=act(s),ink='#314766',x=w*.27,y=h*.48,sz=Math.min(w*.33,h*.27,166);
  c.save();c.translate(x,y);c.rotate(-.095);c.strokeStyle=ink;c.globalAlpha=.41;c.lineWidth=.65;
  c.beginPath();c.ellipse(0,0,sz*.47,sz*.55,0,0,TAU);c.stroke();c.beginPath();c.ellipse(0,0,sz*.432,sz*.507,0,.08,6.1);c.stroke();
  motif(c,id,0,-sz*.05,sz*.63,ink,1);c.textAlign='center';c.fillStyle=ink;c.font='italic '+Math.max(9,sz*.087)+'px Georgia, serif';c.fillText('para ti',0,sz*.34);c.restore();
  c.save();c.fillStyle=ink;c.globalAlpha=.42;c.font=Math.max(10,Math.min(15,w*.025))+'px Georgia, serif';c.textAlign='center';c.fillText(roman[id]+'  ·  '+String(s.order||1).padStart(2,'0'),w*.22,h*.87);c.restore();
 }
 return {layout,surround,mount,verso,motif,act};
});
