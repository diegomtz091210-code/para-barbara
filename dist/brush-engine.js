/* Shared by the website and the pixel-level rendering checks. */
(function(root,factory){
 const common=typeof module==='object'&&module.exports;
 const api=factory(common?require('./folio.js'):root.FolioStudio,common?require('./endpapers.js'):root.Endpapers);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BrushStudio=api;
})(typeof window!=='undefined'?window:globalThis,(Folio,Endpapers)=>{
 'use strict';
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=v=>v*v*(3-2*v);
 function surface(factory,w,h,ratio=1){
  const canvas=factory();canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
  canvas.getContext('2d').setTransform(ratio,0,0,ratio,0,0);return canvas;
 }
 function texture(ctx,w,h,dark){
  let seed=81;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  ctx.save();ctx.fillStyle=dark?'#fff':'#302b24';
  for(let i=0;i<Math.min(w*h/150,5000);i++){ctx.globalAlpha=.014+rand()*.025;ctx.fillRect(rand()*w,rand()*h,.45+rand()*.8,.5+rand()*.7);}
  ctx.restore();
 }
 function contain(iw,ih,x,y,w,h){const scale=Math.min(w/iw,h/ih);return {x:x+(w-iw*scale)/2,y:y+(h-ih*scale)/2,w:iw*scale,h:ih*scale};}
 const artBox=Folio.layout;
 function continuation(ctx,w,h,img,box,dark){
  const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
  // Nine-slice the actual edges of the painting into its surrounding paper.
  // This carries the landscape's colors outward without inventing painted content.
  const bleed=18,sx=iw*.075,sy=ih*.075;
  ctx.save();ctx.filter=`blur(${Math.max(5,Math.min(12,w*.017))}px)`;
  const scale=Math.max(w/iw,h/ih)*1.1;ctx.drawImage(img,(w-iw*scale)/2,(h-ih*scale)/2,iw*scale,ih*scale);
  const left=box.x+bleed,right=box.x+box.w-bleed,top=box.y+bleed,bottom=box.y+box.h-bleed;
  const extend=(x,y,sw,sh,dx,dy,dw,dh,flipX=false,flipY=false)=>{
   ctx.save();ctx.translate(dx+(flipX?dw:0),dy+(flipY?dh:0));ctx.scale(flipX?-1:1,flipY?-1:1);ctx.drawImage(img,x,y,sw,sh,0,0,dw,dh);ctx.restore();
  };
  extend(0,0,iw,sy,box.x-bleed,-bleed,box.w+2*bleed,top+bleed,false,true);
  extend(0,ih-sy,iw,sy,box.x-bleed,bottom,box.w+2*bleed,h-bottom+bleed,false,true);
  extend(0,0,sx,ih,-bleed,box.y-bleed,left+bleed,box.h+2*bleed,true);
  extend(iw-sx,0,sx,ih,right,box.y-bleed,w-right+bleed,box.h+2*bleed,true);
  extend(0,0,sx,sy,-bleed,-bleed,left+bleed,top+bleed,true,true);
  extend(iw-sx,0,sx,sy,right,-bleed,w-right+bleed,top+bleed,true,true);
  extend(0,ih-sy,sx,sy,-bleed,bottom,left+bleed,h-bottom+bleed,true,true);
  extend(iw-sx,ih-sy,sx,sy,right,bottom,w-right+bleed,h-bottom+bleed,true,true);
  ctx.restore();
  // A translucent wash in the paper keeps the handwritten line readable.
  const wash=ctx.createLinearGradient(0,Math.max(0,h-210),0,h);
  wash.addColorStop(0,dark?'rgba(12,19,25,0)':'rgba(253,246,225,0)');
  wash.addColorStop(1,dark?'rgba(12,19,25,.74)':'rgba(253,246,225,.78)');
  ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);texture(ctx,w,h,dark);
 }
 function compose(ctx,w,h,scene,img){
  ctx.clearRect(0,0,w,h);ctx.fillStyle=scene.bg;ctx.fillRect(0,0,w,h);
  if(scene.kind==='intro'){Endpapers.cover(ctx,w,h,img);return;}
  if(scene.kind==='finale'){Endpapers.finale(ctx,w,h,img,scene.bouquet);return;}
  if(!img){texture(ctx,w,h,scene.dark);return;}
  const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
  const box=artBox(iw,ih,w,h,scene);
  continuation(ctx,w,h,img,box,scene.dark);
  Folio.surround(ctx,w,h,scene,img,box);Folio.mount(ctx,box,scene.dark);
  ctx.drawImage(img,box.x,box.y,box.w,box.h);
 }
 // A pen-and-ink round brush: long scratched handle, engraved ferrule and a
 // pointed bundle of individual hairs. Coordinates meet the canvas at the tip.
 function drawBrush(ctx,{x,y,nib=40,angle=-Math.PI/2,color='#39352f',writing=false,pressure=.8,finesse=writing?1:0}){
  const ink='#191a18',paper='#faf7ec',p=clamp(pressure);
  const fine=clamp(finesse),spread=nib*(.45+.55*p),head=Math.max(54-26*fine,nib*(2.25-.55*p));
  const ferrule=40-26*fine,handle=130-55*fine,neck=Math.max(3,Math.min(20,nib*.23));
  const base=-head,collar=base-ferrule,tail=collar-handle;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.lineJoin='round';ctx.lineCap='round';
  // A fine paper-colored contour keeps the black drawing legible on dark works.
  ctx.strokeStyle=paper;ctx.lineWidth=1.8;ctx.fillStyle=ink;
  ctx.beginPath();ctx.moveTo(-neck*.66,collar-3);ctx.bezierCurveTo(-neck*.99,collar-25,-neck*.26,tail+27,-1,tail);ctx.quadraticCurveTo(0,tail-5,1.7,tail);ctx.bezierCurveTo(neck*.35,tail+28,neck*.94,collar-23,neck*.63,collar-3);ctx.closePath();ctx.stroke();ctx.fill();
  ctx.strokeStyle=paper;ctx.lineWidth=.7;
  for(let i=0;i<5;i++){const side=(i-2)*neck*.21;ctx.beginPath();ctx.moveTo(side,collar-10-i*3);ctx.bezierCurveTo(side-1,collar-handle*.26,side*.42,tail+handle*.26,side*.13,tail+16+i*7);ctx.stroke();}
  // Two slightly imperfect ink outlines and short cross-hatching, like the reference.
  ctx.fillStyle=paper;ctx.strokeStyle=ink;ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(-neck*.7,collar+3);ctx.lineTo(-neck*.9,collar-1);ctx.lineTo(-neck*.61,collar-6);ctx.lineTo(neck*.68,collar-7);ctx.lineTo(neck*.84,collar-1);ctx.lineTo(neck*.66,collar+3);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-neck*.68,collar+3);ctx.bezierCurveTo(-neck*.95,collar+ferrule*.45,-neck*1.24,base-4,-neck*1.26,base);ctx.lineTo(neck*1.23,base+.5);ctx.bezierCurveTo(neck*1.25,base-8,neck*.85,collar+12,neck*.68,collar+3);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-neck*.85,base-5);ctx.quadraticCurveTo(0,base-6,neck,base-4);ctx.moveTo(-neck*.7,base-9);ctx.lineTo(neck*.9,base-8);ctx.moveTo(-neck*.49,collar+5);ctx.lineTo(-neck*.95,base-12);ctx.stroke();
  for(let j=0;j<12;j++){const yy=collar+5+j*(ferrule-9)/12,edge=neck*(.73+.43*j/12);ctx.beginPath();ctx.moveTo(edge-neck*(.20+.16*Math.sin(j*2.1)),yy+1);ctx.lineTo(edge,yy-1);ctx.stroke();}
  // Pressure opens the belly of the round brush; its tip stays pointed.
  ctx.fillStyle=ink;ctx.strokeStyle=paper;ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(-neck*1.2,base);ctx.bezierCurveTo(-spread*.40,-head*.83,-spread*.59,-head*.40,-spread*.32,-head*.22);ctx.bezierCurveTo(-spread*.16,-head*.12,-spread*.025,-head*.025,0,1);ctx.bezierCurveTo(spread*.06,-head*.15,spread*.40,-head*.19,spread*.48,-head*.43);ctx.bezierCurveTo(spread*.60,-head*.70,neck*1.3,-head*.88,neck*1.2,base);ctx.closePath();ctx.stroke();ctx.fill();
  ctx.strokeStyle=paper;
  for(let j=0;j<24;j++){
   const u=j/23*2-1,drift=Math.sin(j*2.63)*.045;
   ctx.lineWidth=j%4===0?1.05:.42;ctx.globalAlpha=.42+(j%4)*.14;
   ctx.beginPath();ctx.moveTo(u*neck*1.03,base+1+(j%3));
   ctx.bezierCurveTo(u*spread*.32,-head*.82,(u*.39+drift)*spread,-head*.60,(u*.39+drift*.4)*spread,-head*.43);
   ctx.quadraticCurveTo((u*.2-drift)*spread,-head*.22,u*spread*.035,-head*(.035+(j%5)*.032));ctx.stroke();
  }
  ctx.globalAlpha=1;ctx.strokeStyle=color;ctx.lineWidth=Math.max(.8,nib*.024);ctx.beginPath();ctx.moveTo(-spread*.02,-head*.10);ctx.quadraticCurveTo(spread*.015,-head*.035,0,1);ctx.stroke();
  ctx.restore();
 }
 const mix=(a,b,t)=>a+(b-a)*t;
 function travel(from,to,t,arch=22){
  const e=smooth(clamp(t)),delta=Math.atan2(Math.sin(to.angle-from.angle),Math.cos(to.angle-from.angle));
  return {...to,x:mix(from.x,to.x,e),y:mix(from.y,to.y,e)-Math.sin(Math.PI*e)*arch,angle:from.angle+delta*e,nib:mix(from.nib,to.nib,e),finesse:mix(from.finesse??(from.writing?1:0),to.finesse??(to.writing?1:0),e),pressure:mix(from.pressure??.8,to.pressure??.8,e)*(.35+.65*Math.abs(2*e-1))};
 }
 return {clamp,surface,contain,artBox,compose,drawBrush,travel};
});
