/* Guards for Barbara's book. The plate is a local atlas of monochrome details
   from the Sunflowers, Almond Blossom and Melencolia reproductions in the book. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.Endpapers=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 const TAU=2*Math.PI, sun=[0,0,800,1016],almond=[800,0,736,470],durer=[800,470,384,490],stock=[1184,470,352,384];
 const random=seed=>()=>{seed=seed*16807%2147483647;return seed/2147483647;};
 const hasAtlas=im=>im&&(im.naturalWidth||im.width)===1536;
 function patch(c,im,src,x,y,w,h){if(!hasAtlas(im))return; c.drawImage(im,...src,x,y,w,h);}
 function ambient(c,w,h,img){
  c.fillStyle='#f8f4eb';c.fillRect(0,0,w,h);
  const wash=c.createLinearGradient(0,h*.9,w,h*.15);wash.addColorStop(0,'#eae0ce');wash.addColorStop(.29,'#fbf8f0');wash.addColorStop(.59,'#f7f3e9');wash.addColorStop(1,'#eae1d0');c.fillStyle=wash;c.fillRect(0,0,w,h);
  c.save();c.globalCompositeOperation='multiply';c.globalAlpha=.42;
  if(hasAtlas(img)){for(let y=0,k=0;y<h;y+=205,k++){for(let x=k%2?-92:0;x<w;x+=192)patch(c,img,stock,x,y,192.15,205.15);}}
  else{const r=random(404);c.fillStyle='rgba(74,60,41,.22)';for(let j=0;j<Math.min(4500,w*h/55);j++)c.fillRect(r()*w,r()*h,.65,.55+r()*1.3);}
  c.restore();
 }
 function stitch(c,w,h,night=false){
  const sl=Math.max(9,Math.min(20,w*.017));
  const fade=c.createLinearGradient(0,0,sl*2.25,0);fade.addColorStop(0,night?'rgba(2,9,12,.48)':'rgba(86,66,39,.23)');fade.addColorStop(.09,night?'rgba(188,160,105,.21)':'rgba(254,245,218,.4)');fade.addColorStop(.29,night?'rgba(2,9,12,.35)':'rgba(88,69,42,.09)');fade.addColorStop(1,'rgba(98,80,52,0)');c.fillStyle=fade;c.fillRect(0,0,sl*2.25,h);
  c.save();c.strokeStyle=night?'rgba(226,204,149,.24)':'rgba(84,66,43,.24)';c.lineWidth=.65;c.beginPath();c.moveTo(sl*.77,-2);c.bezierCurveTo(sl*.96,h*.35,sl*.64,h*.69,sl*.87,h+2);c.stroke();
  for(const f of [.16,.49,.81]){const y=h*f,x=sl*.72,L=Math.min(27,Math.max(13,h*.031));c.fillStyle=night?'rgba(10,13,13,.86)':'rgba(88,70,46,.49)';for(const off of [0,L]){c.beginPath();c.ellipse(x,y+off,1.35,1.9,-.2,0,TAU);c.fill();}c.lineCap='round';c.strokeStyle=night?'#5a5344':'#9d8f70';c.lineWidth=1.8;c.beginPath();c.moveTo(x+.35,y);c.quadraticCurveTo(x+2.1,y+L*.43,x,y+L);c.stroke();c.strokeStyle=night?'#b4a78a':'#f2e8d0';c.lineWidth=.75;c.stroke();}
  c.restore();
 }
 function deckle(c,x,y,w,h,seed,amp=1.6){
  const r=random(seed);c.beginPath();c.moveTo(x+1,y);
  for(let i=1,n=Math.max(2,Math.ceil(w/8));i<=n;i++)c.lineTo(x+w*i/n,y+(r()-.5)*amp);
  for(let i=1,n=Math.max(2,Math.ceil(h/8));i<=n;i++)c.lineTo(x+w+(r()-.5)*amp,y+h*i/n);
  for(let i=1,n=Math.max(2,Math.ceil(w/7));i<=n;i++)c.lineTo(x+w*(1-i/n),y+h+(r()-.5)*amp*1.8);
  for(let i=1,n=Math.max(2,Math.ceil(h/7));i<=n;i++)c.lineTo(x+(r()-.5)*amp,y+h*(1-i/n));c.closePath();
 }
 function support(c,x,y,w,h,r,col,blur=8){
  deckle(c,x,y,w,h,r,2.4);c.save();c.shadowColor='rgba(47,37,20,.32)';c.shadowOffsetY=4;c.shadowOffsetX=2;c.shadowBlur=blur;c.fillStyle=col;c.fill();c.restore();c.fillStyle=col;c.fill();
 }
 function tape(c,x,y,w,h,a){
  c.save();c.translate(x,y);c.rotate(a);deckle(c,-w/2,-h/2,w,h,2361,3.2);c.fillStyle='rgba(194,176,130,.64)';c.fill();c.clip();
  const r=random(4509);c.strokeStyle='rgba(255,252,225,.46)';c.lineWidth=.74;c.beginPath();for(let i=0;i<58;i++){const yy=(r()-.5)*h,xx=(r()-.5)*w;c.moveTo(xx,yy);c.lineTo(Math.min(w/2,xx+r()*w*.4+2),yy+r()-.5);}c.stroke();c.restore();
 }
 function bSeal(c,x,y,sz,col,angle=-.14){
  c.save();c.translate(x,y);c.rotate(angle);c.scale(sz/50,sz/50);c.strokeStyle=col;c.fillStyle=col;c.lineCap='round';
  for(const [radius,size,gap] of [[44,1.4,.12],[40,.8,.27],[36,.8,.18]]){c.lineWidth=size;c.beginPath();c.ellipse(0,0,radius,radius*.97,.06,.14+gap,3.18);c.stroke();c.beginPath();c.ellipse(0,0,radius,radius*.97,.06,3.23,TAU+.11);c.stroke();}
  for(let i=0;i<28;i++){const k=i*TAU/28;c.beginPath();c.arc(Math.cos(k)*39,Math.sin(k)*38,.55,0,TAU);c.fill();}
  // A calligraphic B and a blossom; no separate heading or caption.
  c.lineWidth=2.05;c.beginPath();c.moveTo(-21,16);c.bezierCurveTo(0,9,7,-29,-1,-24);c.bezierCurveTo(-8,-20,-10,7,-13,21);c.moveTo(-14,-11);c.bezierCurveTo(-3,-27,20,-25,15,-12);c.bezierCurveTo(11,-4,2,-1,-3,0);c.bezierCurveTo(17,-8,24,6,10,15);c.bezierCurveTo(1,21,-8,18,-10,15);c.stroke();
  c.lineWidth=.75;c.beginPath();c.moveTo(5,25);c.quadraticCurveTo(18,24,26,11);c.moveTo(17,21);c.quadraticCurveTo(12,15,16,12);c.quadraticCurveTo(20,15,17,21);c.moveTo(21,17);c.quadraticCurveTo(27,19,30,15);c.quadraticCurveTo(27,13,21,17);c.stroke();c.restore();
 }
 function botanical(c,x,y,k,ang,pale=false){
  const ink=pale?'rgba(222,212,160,.72)':'#626654',light=pale?'rgba(172,176,127,.20)':'#d3d1b7';c.save();c.translate(x,y);c.rotate(ang);c.scale(k,k);c.lineCap='round';c.lineJoin='round';
  function stem(x0,y0,x1,y1,x2,y2,x3,y3,width){c.strokeStyle=ink;c.lineWidth=width;c.beginPath();c.moveTo(x0,y0);c.bezierCurveTo(x1,y1,x2,y2,x3,y3);c.stroke();}
  function leaf(px,py,length,width,a){c.save();c.translate(px,py);c.rotate(a);c.strokeStyle=ink;c.fillStyle=light;c.lineWidth=.9;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(width*.62,-length*.10,width*1.12,-length*.58,0,-length);c.bezierCurveTo(-width*.59,-length*.72,-width*.87,-length*.22,0,0);c.closePath();c.fill();c.stroke();c.lineWidth=.62;c.beginPath();c.moveTo(0,-1);c.quadraticCurveTo(width*.13,-length*.44,0,-length*.98);for(let f=.16;f<.9;f+=.12){const a1=Math.sin(Math.PI*f);c.moveTo(width*.1*a1,-length*f);c.lineTo(width*.72*a1,-length*(f+.09));c.moveTo(width*.1*a1,-length*f);c.lineTo(-width*.55*a1,-length*(f+.08));}c.stroke();c.restore();}
  function blossom(px,py,rad,phi){c.save();c.translate(px,py);c.rotate(phi);for(let j=0;j<5;j++){c.save();c.rotate(j*TAU/5+[.08,-.02,.04,0,-.05][j]);const d=rad*[.95,1.12,1,.87,1.04][j];c.strokeStyle=ink;c.lineWidth=.75;c.fillStyle=pale?'rgba(181,182,137,.10)':'#e8e4cf';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-d*.45,-d*.21,-d*.6,-d*.73,-d*.3,-d*.96);c.quadraticCurveTo(-d*.17,-d*1.08,-d*.06,-d*.90);c.bezierCurveTo(d*.30,-d*1.17,d*.60,-d*.87,d*.42,-d*.56);c.quadraticCurveTo(d*.23,-d*.17,0,0);c.fill();c.stroke();c.lineWidth=.5;c.beginPath();for(let z=-2;z<=2;z++){c.moveTo(z*.35,-1);c.quadraticCurveTo(z*d*.14,-d*.36,z*d*.12,-d*(.60+.04*(2-Math.abs(z))));}c.stroke();c.restore();}c.fillStyle=ink;for(let i=0;i<11;i++){const t=i*2.4,rr=rad*.16*Math.sqrt(i/11);c.beginPath();c.arc(Math.cos(t)*rr,Math.sin(t)*rr,.45+.19*(i%3),0,TAU);c.fill();}c.restore();}
  stem(0,0,12,-65,-7,-132,22,-238,2.4);stem(3,-51,17,-65,34,-83,45,-108,1.6);stem(5,-102,-10,-115,-29,-139,-39,-167,1.5);stem(8,-143,26,-151,38,-167,55,-184,1.4);stem(14,-197,3,-210,-9,-215,-16,-233,1.2);stem(22,-237,26,-252,31,-264,36,-269,1.15);
  leaf(20,-70,38,10,.54);leaf(1,-89,41,9,-.68);leaf(37,-92,27,8,-.06);leaf(-16,-128,42,10,-.81);leaf(-29,-149,34,7,.22);leaf(20,-152,39,8,.89);leaf(40,-170,26,8,.07);leaf(16,-196,29,8,-.35);leaf(25,-250,24,6,-.21);leaf(9,-208,26,7,-.9);
  blossom(46,-110,12,.1);blossom(-40,-168,13,.34);blossom(55,-184,15,.66);blossom(-16,-233,11,.7);blossom(36,-270,10,.1);c.restore();
 }
 function printStack(c,img){
  // Letter underneath the prints: its folded paper and a few perforations show.
  c.save();c.translate(532,415);c.rotate(-.092);support(c,-270,-311,540,622,612,'#d9d0b6',11);c.strokeStyle='rgba(114,97,71,.25)';c.lineWidth=1.1;c.beginPath();c.moveTo(-265,-306);c.lineTo(0,-30);c.lineTo(262,-306);c.moveTo(-266,307);c.lineTo(-73,82);c.stroke();c.restore();
  // A torn botanical clipping; the image runs into two irregular cut edges.
  c.save();c.translate(254,586);c.rotate(-.135);support(c,-161,-112,322,224,349,'#eee8d5',8);c.save();deckle(c,-154,-106,307,196,731,2.5);c.clip();patch(c,img,almond,-154,-106,307,196);c.restore();c.strokeStyle='#9d957c';c.lineWidth=.65;c.beginPath();c.moveTo(-144,96);c.lineTo(-100,96);c.moveTo(105,96);c.lineTo(145,96);c.stroke();c.restore();
  // Main loose art plate, its true ink density kept within a deckled margin.
  c.save();c.translate(536,413);c.rotate(.060);support(c,-224,-286,448,572,238,'#f0ecdf',15);patch(c,img,stock,-223,-285,446,570);patch(c,img,sun,-206,-268,412,520);c.strokeStyle='rgba(77,74,56,.4)';c.lineWidth=.75;c.strokeRect(-206,-268,412,520);
  c.strokeStyle='rgba(87,79,56,.48)';c.lineWidth=.7;c.beginPath();c.moveTo(-214,251);c.lineTo(-209,251);c.moveTo(-206,254);c.lineTo(-206,260);c.moveTo(205,-275);c.lineTo(205,-271);c.moveTo(208,-268);c.lineTo(214,-268);c.stroke();c.restore();
  // A thin, perforated ticket cut from the first engraving in the story.
  c.save();c.translate(788,229);c.rotate(.13);c.save();c.shadowBlur=7;c.shadowOffsetY=3;c.shadowColor='rgba(54,44,26,.27)';const tw=121,th=155;c.beginPath();c.moveTo(-tw/2,-th/2);for(let i=0;i<13;i++){const x=-tw/2+i*tw/13;c.lineTo(x+1,-th/2);c.quadraticCurveTo(x+tw/26,-th/2+4,x+tw/13-1,-th/2);}for(let i=0;i<16;i++){const y=-th/2+i*th/16;c.lineTo(tw/2,y+1);c.quadraticCurveTo(tw/2-4,y+th/32,tw/2,y+th/16-1);}for(let i=0;i<13;i++){const x=tw/2-i*tw/13;c.lineTo(x-1,th/2);c.quadraticCurveTo(x-tw/26,th/2-4,x-tw/13+1,th/2);}for(let i=0;i<16;i++){const y=th/2-i*th/16;c.lineTo(-tw/2,y-1);c.quadraticCurveTo(-tw/2+4,y-th/32,-tw/2,y-th/16+1);}c.closePath();c.fillStyle='#e8e1cb';c.fill();c.restore();patch(c,img,durer,-48,-65,96,122);c.strokeStyle='#948b70';c.lineWidth=.65;c.strokeRect(-51,-68,102,128);c.restore();
  // The rings of the collector's seal are printed on both pieces of paper.
  bSeal(c,295,656,52,'rgba(68,75,62,.78)',-.16);
  tape(c,397,129,111,26,-.19);botanical(c,730,741,1.09,.24);tape(c,732,700,56,14,-.16);
  c.save();c.strokeStyle='rgba(68,69,58,.36)';c.lineWidth=1.25;c.lineCap='round';c.beginPath();for(let j=0;j<3;j++){const y=298+7*j;c.moveTo(810,y);c.bezierCurveTo(833,y-7,849,y+8,866,y);c.bezierCurveTo(884,y-7,891,y+3,899,y-3);}c.stroke();c.restore();
 }
 function cover(c,w,h,img){
  c.save();ambient(c,w,h,img);stitch(c,w,h);
  const mobile=w<=650&&h>w*.90,short=h<400&&w>h*1.45;
  let scale,cx,cy;
  if(mobile){scale=Math.min(w*.94/855,h*.40/690);cx=w*.504;cy=h*.236;}
  else{scale=Math.min(w*(short?.39:.49)/822,h*(short?.77:.86)/700);cx=w*(short?.783:.748);cy=h*(short?.45:.49);}
  // A real thread comes out from under the prints and leads down to the first footprint.
  if(!short){const sx=cx-197*scale,sy=cy+246*scale,foot=Math.max(25,Math.min(48,w*.074));c.save();c.lineWidth=1.15;c.lineCap='round';c.strokeStyle='rgba(37,58,85,.53)';c.beginPath();c.moveTo(foot,h+1);
   if(mobile){c.bezierCurveTo(w*.35,h*.985,w*.91,h*1.035,w*.94,h*.862);c.bezierCurveTo(w*.987,h*.72,w*.937,h*.46,w*.76,h*.388);c.quadraticCurveTo(w*.59,h*.30,sx,sy);}
   else{c.bezierCurveTo(w*.19,h*.914,w*.35,h*.985,w*.45,h*.872);c.bezierCurveTo(w*.515,h*.794,w*.54,h*.882,sx,sy);}
   c.stroke();c.strokeStyle='rgba(255,248,224,.82)';c.lineWidth=.6;c.setLineDash([1.2,3.3]);c.stroke();c.restore();}
  c.save();c.translate(cx,cy);c.scale(scale,scale);c.translate(-492,-410);printStack(c,img);c.restore();
  // Two faint marks at the fore-edge are cropped by the page, never by the text.
  c.save();c.strokeStyle='rgba(108,92,64,.21)';c.lineWidth=.65;const ex=w-4;c.beginPath();c.moveTo(ex,h*.10);c.lineTo(ex+2,h*.47);c.moveTo(ex-1,h*.63);c.lineTo(ex,h*.94);c.stroke();c.restore();c.restore();
 }
 // Each blossom is inked with one colour actually sampled from a painting in the letter.
 function collectedBlossoms(c,w,h,colours){
  if(!colours||!colours.length)return;
  const mobile=w<700||w/h<.92;const r=random(8751);
  const paths=mobile?[
   [[-.022,.66],[.028,.85],[.104,.954],[.251,1.008]],
   [[1.017,.36],[.96,.17],[.78,.09],[.55,.012]]
  ]:[
   [[-.035,.95],[.13,.73],[.014,.37],[.15,.14]],
   [[1.03,.14],[.878,.30],[.982,.60],[.872,.89]]
  ];
  function curve(u,a){const t=1-u;return [w*(t*t*t*a[0][0]+3*t*t*u*a[1][0]+3*t*u*u*a[2][0]+u*u*u*a[3][0]),h*(t*t*t*a[0][1]+3*t*t*u*a[1][1]+3*t*u*u*a[2][1]+u*u*u*a[3][1])];}
  const mid=Math.ceil(colours.length/2),scale=mobile?Math.min(1.05,w/400):Math.min(1.8,Math.min(w/850,h/570));
  paths.forEach((a,half)=>{
   const colors=half?colours.slice(mid):colours.slice(0,mid);
   c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle='rgba(223,206,149,.77)';c.lineWidth=1.3*scale;c.beginPath();c.moveTo(w*a[0][0],h*a[0][1]);c.bezierCurveTo(w*a[1][0],h*a[1][1],w*a[2][0],h*a[2][1],w*a[3][0],h*a[3][1]);c.stroke();
   colors.forEach((color,i)=>{const t=.10+.86*i/Math.max(1,colors.length-1),[x,y]=curve(t,a),[x2,y2]=curve(t+.005,a),ang=Math.atan2(y2-y,x2-x),side=i%2?-1:1,d=(9+r()*13)*scale;
    const twist=ang+side*(.64+.49*r()),ex=x+d*Math.cos(twist),ey=y+d*Math.sin(twist);
    c.strokeStyle='rgba(219,202,147,.75)';c.lineWidth=.76*scale;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+d*.62*Math.cos(ang),y+d*.62*Math.sin(ang),ex,ey);c.stroke();
    const rad=(2.65+r()*2.1)*scale;c.save();c.translate(ex,ey);c.rotate(r()*TAU);
    for(let p=0;p<5;p++){c.rotate(TAU/5);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-rad*.55,-rad*.36,-rad*.62,-rad*1.12,-rad*.16,-rad);c.quadraticCurveTo(rad*.04,-rad*.82,rad*.23,-rad*1.05);c.bezierCurveTo(rad*.72,-rad*.92,rad*.46,-rad*.24,0,0);c.fillStyle=color;c.fill();c.strokeStyle='rgba(239,221,170,.70)';c.lineWidth=.45*scale;c.stroke();}
    c.fillStyle='#dcc580';c.beginPath();c.arc(0,0,rad*.21,0,TAU);c.fill();c.restore();
    if(i%3===1){c.save();c.translate(x,y);c.rotate(ang+side*2.12);c.strokeStyle='rgba(202,193,140,.72)';c.fillStyle='rgba(89,121,94,.55)';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(4*scale,-3*scale,8*scale,0);c.quadraticCurveTo(2.7*scale,3.7*scale,0,0);c.fill();c.stroke();c.restore();}
   });c.restore();
  });
 }
 const sunset={image:'graphics/atardecer-para-barbara.webp',sourceX:.50,sourceY:.481,screenX:.50,screenY:.50};
 function finale(c,w,h,img,colours){
  c.save();
  const iw=img&&(img.naturalWidth||img.width),ih=img&&(img.naturalHeight||img.height);
  if(iw&&ih){
   // On a phone we see the middle of the same painting. Anchor the title
   // to its actual sunlit sky, instead of cropping to the centre by accident.
   const sc=Math.max(w/iw,h/ih)*1.28;
   const dx=Math.min(0,Math.max(w-iw*sc,w*sunset.screenX-iw*sc*sunset.sourceX));
   const dy=Math.min(0,Math.max(h-ih*sc,h*sunset.screenY-ih*sc*sunset.sourceY));
   c.drawImage(img,dx,dy,iw*sc,ih*sc);
  }else{
   // The dedication remains readable even if an image has not decoded.
   const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#a18d9a');sky.addColorStop(.34,'#f5b77c');sky.addColorStop(.57,'#ffe0a0');sky.addColorStop(.69,'#bd7e76');sky.addColorStop(1,'#675b73');c.fillStyle=sky;c.fillRect(0,0,w,h);
   c.fillStyle='#ffe7ae';c.beginPath();c.arc(w*.5,h*.54,Math.min(w*.28,h*.15),0,TAU);c.fill();
   c.fillStyle='#926e76';c.beginPath();c.moveTo(0,h*.74);c.bezierCurveTo(w*.27,h*.59,w*.45,h*.74,w*.63,h*.68);c.quadraticCurveTo(w*.84,h*.59,w,h*.65);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
  }
  // Add only a little shade below the sky for the small restart control.
  const shore=c.createLinearGradient(0,h*.77,0,h);shore.addColorStop(0,'rgba(34,27,44,0)');shore.addColorStop(1,'rgba(43,30,44,.39)');c.fillStyle=shore;c.fillRect(0,h*.77,w,h*.23);
  stitch(c,w,h,true);
  const m=Math.min(w,h),narrow=w<=650;
  collectedBlossoms(c,w,h,colours);
  bSeal(c,w-(narrow?29:48),h-(narrow?28:44),Math.min(26,Math.max(15,m*.037)),'rgba(224,202,146,.53)',-.19);
  // Broken gilt tooling near the outside corners, like the end of a binding.
  c.save();c.strokeStyle='rgba(235,216,162,.38)';c.lineWidth=.75;const d=narrow?16:26,a=Math.min(w*.12,68),b=Math.min(h*.12,72);c.beginPath();c.moveTo(w-d-a,d);c.quadraticCurveTo(w-d-2,d+1,w-d,d+2);c.lineTo(w-d,d+b);c.moveTo(d,h-d-b*.67);c.lineTo(d,h-d);c.lineTo(d+a,h-d);c.stroke();c.restore();c.restore();
 }
 return {cover,finale,sunset};
});
