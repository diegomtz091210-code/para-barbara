/* A worn art-book leaf, curling from the right margin toward the left binding. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./folio.js'):root.FolioStudio);if(typeof module==='object'&&module.exports)module.exports=api;else root.BookStudio=api;})(typeof window!=='undefined'?window:globalThis,(Folio)=>{
 'use strict';
 const clamp=t=>Math.max(0,Math.min(1,t));
 const hidden='inset(0 100% 0 0)';
 let stock=null,stockKey='';
 function agedStock(factory,w,h,ratio){
  const key=`${w}:${h}:${ratio}`;if(stock&&stockKey===key)return stock;
  const paper=factory();paper.width=Math.round(w*ratio);paper.height=Math.round(h*ratio);
  const c=paper.getContext('2d');c.setTransform(ratio,0,0,ratio,0,0);
  let seed=2317;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  // Mottling and visible fibres are baked once, rather than animated like noise.
  const grain=factory();grain.width=Math.min(540,Math.ceil(w));grain.height=Math.min(900,Math.ceil(h));
  const g=grain.getContext('2d'),pixels=g.createImageData(grain.width,grain.height);
  const fields=[7,23,67].map(size=>({size,values:Float32Array.from({length:(size+1)**2},()=>rand())}));
  const noise=(field,x,y)=>{const {size,values}=field,n=size+1,xx=x*size,yy=y*size,ix=Math.min(size-1,Math.floor(xx)),iy=Math.min(size-1,Math.floor(yy)),fx=xx-ix,fy=yy-iy,a=values[iy*n+ix]*(1-fx)+values[iy*n+ix+1]*fx,b=values[(iy+1)*n+ix]*(1-fx)+values[(iy+1)*n+ix+1]*fx;return a*(1-fy)+b*fy-.5;};
  for(let y=0;y<grain.height;y++)for(let x=0;x<grain.width;x++){
   const u=x/grain.width,v=y/grain.height,edge=Math.min(u,1-u,v*.7,(1-v)*.7);
   const age=Math.exp(-edge*25),n=noise(fields[0],u,v)*18+noise(fields[1],u,v)*8+noise(fields[2],u,v)*4+(rand()-.5)*9,k=(y*grain.width+x)*4;
   pixels.data[k]=229+n-age*35;pixels.data[k+1]=208+n-age*43;pixels.data[k+2]=167+n-age*47;pixels.data[k+3]=255;
  }
  g.putImageData(pixels,0,0);c.drawImage(grain,0,0,w,h);
  for(let i=0;i<48;i++){
   const side=i%4,x=side===0?rand()*w*.12:side===1?w*(.88+rand()*.12):rand()*w,y=side===2?rand()*h*.10:side===3?h*(.9+rand()*.1):rand()*h,r=5+rand()*Math.min(w,h)*.09;
   const stain=c.createRadialGradient(x,y,0,x,y,r);stain.addColorStop(0,`rgba(111,72,33,${.025+rand()*.045})`);stain.addColorStop(1,'rgba(111,72,33,0)');c.fillStyle=stain;c.fillRect(x-r,y-r,2*r,2*r);
  }
  c.strokeStyle='rgba(85,61,35,.13)';c.lineWidth=.45;c.beginPath();
  for(let i=0;i<Math.min(9000,w*h/55);i++){const x=rand()*w,y=rand()*h;c.moveTo(x,y);c.quadraticCurveTo(x+.3,y+1.2,x+(rand()-.5)*1.4,y+1+rand()*3.7);}c.stroke();
  c.fillStyle='rgba(95,57,25,.13)';
  for(let i=0;i<Math.min(2400,w*h/180);i++){const x=rand()*w,y=rand()*h;if(Math.min(x,w-x,y,h-y)>Math.min(w,h)*.16&&rand()>.15)continue;c.beginPath();c.ellipse(x,y,.2+rand()*.8,.2+rand()*.7,0,0,Math.PI*2);c.fill();}
  // Quiet engraved rules and corner flourishes, like an old endpaper.
  const inset=Math.max(16,Math.min(27,w*.046));c.strokeStyle='rgba(109,76,37,.23)';c.lineWidth=.65;c.strokeRect(inset,inset,w-2*inset,h-2*inset);c.strokeStyle='rgba(109,76,37,.10)';c.strokeRect(inset+3,inset+3,w-2*inset-6,h-2*inset-6);
  for(const [x,y,sx,sy] of [[inset,inset,1,1],[w-inset,inset,-1,1],[inset,h-inset,1,-1],[w-inset,h-inset,-1,-1]]){
   c.save();c.translate(x,y);c.scale(sx,sy);c.strokeStyle='rgba(102,67,31,.31)';c.lineWidth=.7;c.beginPath();c.moveTo(0,33);c.bezierCurveTo(13,17,5,7,16,9);c.bezierCurveTo(28,12,13,27,9,16);c.bezierCurveTo(7,5,17,13,33,0);c.moveTo(3,27);c.quadraticCurveTo(13,14,27,3);c.stroke();c.restore();
  }
  stock=paper;stockKey=key;return paper;
 }
 // Source points are measured along the curl's oblique normal (u) and its spine (v).
 const mix=(a,b,f)=>a+(b-a)*f;
 function folded(d,r){if(d<=0)return [d,0];if(d>=Math.PI*r)return [Math.PI*r-d,2*r];return [r*Math.sin(d/r),r*(1-Math.cos(d/r))];}
 function stockPoint(s,u,v){const [rad,z]=folded(u-s.a,s.r),d=s.a+rad,k=1-z*s.perspective,ev=v*k+s.midV*(1-k)-z*.13;return {x:s.nx*d-s.ny*ev,y:s.ny*d+s.nx*ev,d,z};}
 function trace(c,points,closed){if(!points.length)return;c.beginPath();c.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)c.lineTo(points[i].x,points[i].y);if(closed)c.closePath();}
 function cuts(s,one,two,minimum){
  const u0=one.x*s.nx+one.y*s.ny,u1=two.x*s.nx+two.y*s.ny,du=u1-u0;
  if(Math.max(u0,u1)<minimum-.0001)return [];
  const ts=[0,1];if(Math.abs(du)>.00001){
   for(let i=0;i<=16;i++){const f=(s.a+i*Math.PI*s.r/16-u0)/du;if(f>0&&f<1)ts.push(f);}
   const f=(minimum-u0)/du;if(f>0&&f<1)ts.push(f);
  }
  return ts.sort((a,b)=>a-b).filter(t=>u0+t*du>=minimum-.0001).map(t=>{const x=mix(one.x,two.x,t),y=mix(one.y,two.y,t);return stockPoint(s,x*s.nx+y*s.ny,-x*s.ny+y*s.nx);});
 }
 function materialOutline(s,corners,minimum){return corners.map((one,i)=>cuts(s,one,corners[(i+1)%4],minimum)).filter(a=>a.length>1);}
 class PageTurn{
  constructor({context,previous,next,width,height,ratio=1,factory,direction=1,leaf={},rollPrint}){
   this.ctx=context;this.previous=previous;this.next=next;this.w=width;this.h=height;this.ratio=ratio;this.direction=direction;this.duration=1690;
   this.front=direction>0?previous:next;this.under=direction>0?next:previous;this.print=rollPrint||this.front;
   this.corners=[{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}];
   this.paper=factory();this.paper.width=Math.round(width*ratio);this.paper.height=Math.round(height*ratio);const c=this.paper.getContext('2d');c.setTransform(ratio,0,0,ratio,0,0);
   c.drawImage(agedStock(factory,width,height,ratio),0,0,width,height);
   c.globalCompositeOperation='multiply';c.globalAlpha=.085;c.drawImage(this.print,0,0,width,height);c.globalAlpha=1;c.globalCompositeOperation='source-over';
   c.save();c.translate(width,0);c.scale(-1,1);Folio.verso(c,width,height,leaf);c.restore();this.last=null;
  }
  shape(progress){
   if(this.last&&this.last.progress===progress)return this.last;
   const p=this.direction>0?clamp(progress):1-clamp(progress),t=.09*p+.91*p*p*(3-2*p);
   const tilt=clamp(t/.91),angle=.68*(1-tilt*tilt*(3-2*tilt))+.046*Math.sin(Math.PI*t);
   const nx=Math.cos(angle),ny=Math.sin(angle),max=this.w*nx+this.h*ny;
   const r=Math.max(.005,Math.min(88,this.w*.098,this.h*.126)*Math.sin(Math.PI*p)**.85),a=max*(1-t)-2*t;
   const s={progress,p,t,angle,nx,ny,max,a,r,fold:this.w*(1-t),perspective:.35/Math.max(this.w,this.h),midV:(this.h*nx-this.w*ny)*.5};
   s.edges=materialOutline(s,this.corners,a);s.outline=s.edges.flat();s.back=materialOutline(s,this.corners,a+Math.PI*r/2).flat();this.last=s;return s;
  }
  clips(progress){
   if(progress<=0)return {outgoing:'none',incoming:hidden};if(progress>=1)return {outgoing:hidden,incoming:'none'};
   const s=this.shape(progress);if(s.clips)return s.clips;const pts=s.outline,left=[],right=[];
   for(let i=0;i<=28;i++){
    const y=this.h*i/28,scan=Math.max(.001,Math.min(this.h-.001,y));let lo=(s.a-s.ny*scan)/s.nx,hi=lo;
    for(let j=0;j<pts.length;j++){const p=pts[j],q=pts[(j+1)%pts.length];if((p.y<=scan&&q.y>scan)||(q.y<=scan&&p.y>scan)){const x=mix(p.x,q.x,(scan-p.y)/(q.y-p.y));lo=Math.min(lo,x);hi=Math.max(hi,x);}}
    left.push((clamp(lo/this.w)*this.w).toFixed(1)+'px '+y.toFixed(1)+'px');right.push((clamp(hi/this.w)*this.w).toFixed(1)+'px '+y.toFixed(1)+'px');
   }
   const front='polygon(0 0,'+left.join(',')+',0 '+this.h+'px)',under='polygon('+this.w+'px 0,'+right.join(',')+','+this.w+'px '+this.h+'px)';
   return s.clips=this.direction>0?{outgoing:front,incoming:under}:{outgoing:under,incoming:front};
  }
  band(c,s,u0,u1,d0,d1,z0,z1,source,shade0,shade1){
   const du=u1-u0,dd=d1-d0;if(du<.0003||Math.abs(dd)<.0003)return;
   const k=dd/du,sv=1-(z0+z1)*.5*s.perspective,dy=(s.midV*s.perspective-.13)*(z1-z0)/du,shift=(s.midV*s.perspective-.13)*z0-dy*u0,m=this.w+this.h+5;
   c.save();c.rotate(s.angle);c.beginPath();c.rect(Math.min(d0,d1)-.23,-m,Math.abs(dd)+.46,m*2);c.clip();
   c.transform(k,dy,0,sv,d0-k*u0,shift);c.rotate(-s.angle);c.drawImage(source,0,0,this.w,this.h);
   if(shade0||shade1){
    const tone=x=>x>0?'rgba(255,240,202,'+x+')':'rgba(48,31,17,'+(-x)+')';
    const g=c.createLinearGradient(s.nx*u0,s.ny*u0,s.nx*u1,s.ny*u1);g.addColorStop(0,tone(shade0));g.addColorStop(1,tone(shade1));c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
   }
   c.restore();
  }
  render(progress){
   const c=this.ctx,w=this.w,h=this.h,m=w+h+8;
   if(progress<=0||progress>=1){c.clearRect(0,0,w,h);c.drawImage(progress<=0?this.previous:this.next,0,0,w,h);return this.clips(progress);}
   const s=this.shape(progress);c.drawImage(this.under,0,0,w,h);
   // The printed face remains readable up to the point where the paper leaves the table.
   c.save();c.rotate(s.angle);c.beginPath();c.rect(-m,-m,m+s.a,2*m);c.clip();c.rotate(-s.angle);c.drawImage(this.front,0,0,w,h);c.restore();
   const lift=clamp(s.r/Math.max(1,Math.min(w*.098,h*.126,88))),shade=s.r*.81+3;
   if(s.back.length>2){c.save();trace(c,s.back,true);c.shadowColor='rgba(38,23,13,'+(.17+.28*lift)+')';c.shadowBlur=(3+13*lift)*this.ratio;c.shadowOffsetX=3*lift*this.ratio;c.shadowOffsetY=6*lift*this.ratio;c.fillStyle='rgba(43,29,17,.34)';c.fill();c.restore();}
   c.save();c.rotate(s.angle);const cast=c.createLinearGradient(s.a+s.r-.75,0,s.a+s.r+shade,0);
   cast.addColorStop(0,'rgba(34,25,20,'+(.29*lift)+')');cast.addColorStop(.23,'rgba(36,24,18,'+(.17*lift)+')');cast.addColorStop(1,'rgba(36,24,18,0)');c.fillStyle=cast;c.fillRect(s.a+s.r-.75,-m,shade+1,m*2);c.restore();
   // The visible print compresses into the crest of a cylinder. Its back then
   // unrolls along the same cylinder. Work is bounded by the arc, not the screen width.
   const N=24,half=N/2;
   const lighting=(theta,back)=>{const u=theta/(Math.PI/2);return back?-.24*Math.exp(-(((u-1)/.22)**2))+.16*Math.exp(-(((u-1.44)/.26)**2))-.045: .095*Math.sin(u*Math.PI)-.31*u*u;};
   for(let i=0;i<N;i++){
    const t0=Math.PI*i/N,t1=Math.min(Math.PI*(i+1)/N,(s.max-s.a)/s.r);if(t1<=t0)break;
    const back=i>=half,src=back?this.paper:this.print;
    this.band(c,s,s.a+t0*s.r,s.a+t1*s.r,s.a+s.r*Math.sin(t0),s.a+s.r*Math.sin(t1),s.r*(1-Math.cos(t0)),s.r*(1-Math.cos(t1)),src,lighting(t0,back)*lift,lighting(t1,back)*lift);
   }
   const rolled=s.a+Math.PI*s.r;if(rolled<s.max)this.band(c,s,rolled,s.max,s.a,2*s.a+Math.PI*s.r-s.max,2*s.r,2*s.r,this.paper,-.045*lift,-.015*lift);
   // Only the physical cut edges are outlined. No rectangular line follows the fold.
   c.save();c.lineJoin='round';c.lineCap='round';for(const edge of s.edges){trace(c,edge,false);c.strokeStyle='rgba(87,56,29,'+(.46*lift)+')';c.lineWidth=2.35;c.stroke();c.strokeStyle='rgba(249,230,191,'+(.90*lift)+')';c.lineWidth=.95;c.stroke();}c.restore();
   return this.clips(progress);
  }
 }
 return {PageTurn};
});
