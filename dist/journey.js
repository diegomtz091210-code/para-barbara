/* A continuous miniature landscape printed along the lower margin. The camera
   travels with the reader: one page is a visible stride even on a narrow phone. */
(function(root,make){const lib=make(typeof module==='object'&&module.exports?require('./traveler.js'):root.TravelerStudio);if(typeof module==='object'&&module.exports)module.exports=lib;else root.JourneyStudio=lib;})(typeof window==='undefined'?globalThis:window,(Traveler)=>{
 'use strict';
 const TAU=2*Math.PI,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,f)=>a+(b-a)*f;
 function seed(n){return ()=>{n=n*16807%2147483647;return n/2147483647;};}
 function paperLine(c,pts,ink,weight){c.strokeStyle=ink;c.lineWidth=weight;c.beginPath();pts.forEach((p,i)=>{if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});c.stroke();}
 function blob(c,x,y,rx,ry,ink,ang=0){c.fillStyle=ink;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),ang,0,TAU);c.fill();}
 const ground=(x,L,h)=>h*(.855+.019*Math.sin(x/89)-.022*Math.cos(x/193))-.115*h*Math.exp(-(((x-L*.745)/(h*1.01))**2));
 function reed(c,x,y,h,ink,light){
  c.save();c.translate(x,y);c.strokeStyle=ink;c.lineWidth=.65;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(h*.08,-h*.52,h*.31,-h);c.moveTo(h*.11,-h*.51);c.quadraticCurveTo(-h*.03,-h*.82,-h*.19,-h*.86);c.moveTo(h*.15,-h*.65);c.quadraticCurveTo(h*.36,-h*.81,h*.42,-h*.77);c.stroke();if(light)blob(c,h*.3,-h,h*.065,h*.12,light,.53);c.restore();
 }
 function cottage(c,x,y,scale,p){
  c.save();c.translate(x,y);c.scale(scale,scale);c.lineJoin='round';c.lineWidth=.7;c.strokeStyle=p.edge;
  c.fillStyle=p.house;c.beginPath();c.moveTo(-24,-1);c.lineTo(-24,-23);c.lineTo(-4,-29);c.lineTo(24,-23);c.lineTo(24,-1);c.closePath();c.fill();c.stroke();
  c.fillStyle=p.roof;c.beginPath();c.moveTo(-27,-22);c.lineTo(-17,-33);c.lineTo(6,-37);c.lineTo(27,-23);c.lineTo(-3,-27);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(-14,-33);c.lineTo(-14,-40);c.lineTo(-11,-40);c.lineTo(-11,-34);c.fill();c.stroke();
  paperLine(c,[[-4,-27],[-4,-1]],p.edge,.7);paperLine(c,[[-24,-12],[-4,-16],[24,-11]],p.edge,.6);
  c.fillStyle=p.shutter;for(const z of [[-21,-20],[-12,-22],[0,-22],[8,-21],[17,-19],[-21,-10],[-12,-12],[0,-11],[17,-9]]){c.fillRect(z[0],z[1],3.4,5.1);c.fillStyle=p.window;c.fillRect(z[0]+1,z[1]+.8,1,2.2);c.fillStyle=p.shutter;}c.fillStyle=p.door;c.fillRect(7,-10,5.3,9.6);
  c.save();c.strokeStyle=p.faint;c.lineWidth=.65;c.beginPath();c.moveTo(-12,-41);c.bezierCurveTo(-15,-46,-2,-41,-3,-47);c.bezierCurveTo(-3,-50,9,-46,12,-50);c.stroke();c.restore();c.restore();
 }
 function orchard(c,x,y,z,p,r,bloom){
  c.save();c.translate(x,y);c.scale(z,z);c.strokeStyle=p.bark;c.lineWidth=1.9;c.lineCap='round';c.beginPath();c.moveTo(-1,0);c.quadraticCurveTo(5,-19,1,-39);c.moveTo(2,-14);c.quadraticCurveTo(-10,-22,-14,-31);c.moveTo(3,-23);c.quadraticCurveTo(13,-29,18,-40);c.moveTo(1,-31);c.quadraticCurveTo(-5,-38,-4,-43);c.stroke();
  c.lineWidth=.72;
  for(let i=0;i<42;i++){const a=r()*TAU,d=Math.sqrt(r()),xx=Math.cos(a)*22*d+1,yy=-32+Math.sin(a)*13*d;
   c.beginPath();c.moveTo(xx*.43,yy*.35-17);c.quadraticCurveTo(xx*.84,yy+1.7,xx,yy);c.stroke();blob(c,xx,yy,1.15+r()*1.9,.7+r()*1.8,i%3?p.leaf:p.leafLight,r()-.5);
   if(bloom&&i%2===0)for(let j=0;j<4;j++)blob(c,xx+Math.cos(j*1.57)*1.2,yy+Math.sin(j*1.57)*1.2,1.1,.8,p.bloom,j*.7);
  }c.restore();
 }
 function sunflower(c,x,y,sc,p,r){
  c.save();c.translate(x,y);c.scale(sc,sc);c.strokeStyle=p.leaf;c.fillStyle=p.leaf;c.lineWidth=1.25;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(3,-12,1,-28);c.stroke();
  for(const z of [[1,-10,-1],[2,-17,1]]){c.beginPath();c.moveTo(z[0],z[1]);c.quadraticCurveTo(z[0]+z[2]*5,z[1]-7,z[0]+z[2]*11,z[1]-6);c.quadraticCurveTo(z[0]+z[2]*8,z[1]+1,z[0],z[1]);c.fill();}
  c.translate(1,-29);for(let j=0;j<13;j++){const a=j*TAU/13+r()*.05;blob(c,Math.cos(a)*4.3,Math.sin(a)*4.3,2.9,1.13,p.gold,a);}
  blob(c,0,0,3.2,3.2,p.seeds);for(let j=0;j<7;j++){const a=j*2.4;blob(c,Math.cos(a)*2.02,Math.sin(a)*2.02,.38,.35,p.window);}c.restore();
 }
 function bridge(c,x,y,sc,p){
  c.save();c.translate(x,y);c.scale(sc,sc);
  c.strokeStyle=p.water;c.lineWidth=.8;c.beginPath();for(let j=0;j<9;j++){const yy=3.5+j*1.2,xx=-29+j%3*4;c.moveTo(xx,yy);c.bezierCurveTo(xx+9,yy-1.3,xx+21,yy+1.3,xx+27+(j*7)%17,yy);}c.stroke();
  c.strokeStyle=p.rail;c.lineWidth=2;c.beginPath();c.moveTo(-46,2);c.quadraticCurveTo(0,-16,46,2);c.stroke();c.lineWidth=1.25;c.beginPath();c.moveTo(-46,-5);c.quadraticCurveTo(0,-25,46,-5);c.moveTo(-46,-8);c.quadraticCurveTo(0,-28,46,-8);c.stroke();
  for(let j=0;j<=10;j++){const f=j/10,xx=-46+92*f,yy=-9*4*f*(1-f);paperLine(c,[[xx,yy+1],[xx,yy-9.5]],p.rail,.85);}c.restore();
 }
 function cypress(c,x,y,sc,p,r){
  c.save();c.translate(x,y);c.scale(sc,sc);c.beginPath();c.moveTo(-2,0);c.bezierCurveTo(-10,-8,-3,-24,-3.6,-31);c.bezierCurveTo(-2,-27,-1,-40,1,-47);c.bezierCurveTo(0,-31,5,-30,4,-22);c.bezierCurveTo(9,-11,8,-4,4,0);c.closePath();c.fillStyle=p.leaf;c.fill();
  c.strokeStyle=p.leafLight;c.lineWidth=.48;c.beginPath();for(let i=0;i<18;i++){const yy=-r()*34,xx=(r()-.5)*5;c.moveTo(xx,yy);c.quadraticCurveTo(xx+2.2,yy-3,xx+1,yy-8);}c.stroke();c.restore();
 }
 function star(c,x,y,rad,col){c.fillStyle=col;c.beginPath();for(let j=0;j<8;j++){const a=-Math.PI/2+j*Math.PI/4,rr=j%2?rad*.25:rad*(j%4===0?1:.76);const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;if(j)c.lineTo(xx,yy);else c.moveTo(xx,yy);}c.closePath();c.fill();}
 function letter(c,x,y,z,p){
  c.save();c.translate(x,y);c.rotate(-.11);c.scale(z,z);c.fillStyle=p.letter;c.strokeStyle=p.edge;c.lineWidth=.9;c.beginPath();c.moveTo(-15,-1);c.lineTo(-15,-20);c.lineTo(14,-19);c.lineTo(15,-.5);c.closePath();c.fill();c.stroke();
  paperLine(c,[[-14,-19],[0,-8],[14,-18]],p.edge,.77);paperLine(c,[[-13,-2],[-3,-10]],p.faint,.6);paperLine(c,[[13,-2],[3,-10]],p.faint,.6);blob(c,.2,-9.1,2.55,2.18,p.bloom,-.12);c.restore();
 }
 const inks={
  pencil:{edge:'#7e735f',faint:'rgba(107,96,72,.31)',bark:'#817969',leaf:'#a6a18e',leafLight:'#c7c0aa',bloom:'#c0ad94',house:'#dcd1b1',roof:'#b5a88a',shutter:'#999885',door:'#8e8268',window:'#e9dfc6',gold:'#cebd92',seeds:'#96856a',rail:'#a8a28e',water:'#bbb9a4',letter:'#ebe0c5',path:'#ad9d7d'},
  pigment:{edge:'#685942',faint:'rgba(104,85,48,.35)',bark:'#796345',leaf:'#667e64',leafLight:'#a9ac78',bloom:'#b36b66',house:'#e0b44f',roof:'#a67a55',shutter:'#60796e',door:'#856642',window:'#f7dea1',gold:'#ce9a32',seeds:'#795331',rail:'#69887d',water:'#91aba2',letter:'#eee0bc',path:'#8c6746'}
 };
 function scenery(c,L,h,colored){
  const p=colored?inks.pigment:inks.pencil,r=seed(810241);const k=h/69;
  // Three distances, engraved once. In front, the way has a small rise at the bridge.
  c.save();c.lineJoin='round';c.lineCap='round';
  for(let ridge=0;ridge<2;ridge++){const y=x=>h*(.61+ridge*.072+.057*Math.sin(x/(121+ridge*65)+ridge)+.05*Math.cos(x/211)+.016*Math.sin(x/38));c.beginPath();c.moveTo(0,h);for(let x=0;x<L+7;x+=7)c.lineTo(x,y(x));c.lineTo(L,h);c.closePath();c.fillStyle=colored?(ridge?'#d3ccb1':'#e1d9c4'):(ridge?'#ded7c2':'#e9e2cf');c.fill();c.strokeStyle=p.faint;c.lineWidth=.45;c.beginPath();for(let x=0;x<L+8;x+=8){if(x)c.lineTo(x,y(x));else c.moveTo(x,y(x));}c.stroke();
   for(let j=0;j<L/14;j++){const x=r()*L,yy=y(x)+1.2+r()*h*.065;paperLine(c,[[x,yy],[x+2+r()*9,yy-.4-r()]],p.faint,.42);}
  }
  const floor=x=>ground(x,L,h);
  for(const [f,sz] of [[.075,.6],[.126,.91],[.166,.51],[.206,.56]])orchard(c,L*f,floor(L*f)-4*k,sz*k,p,r,true);
  for(let j=0;j<19;j++){const x=L*(.252+j*.0039)+Math.sin(j*1.69)*5*k;sunflower(c,x,floor(x)-2*k,(.36+.46*r())*k,p,r);}
  const houseX=L*.494;cottage(c,houseX-38*k,floor(houseX)-1.3*k,.52*k,p);cottage(c,houseX,floor(houseX)-2.2*k,.93*k,p);cottage(c,houseX+44*k,floor(houseX)-1.5*k,.46*k,p);
  for(const [f,s] of [[.414,.47],[.554,.49],[.625,.65],[.703,.62],[.807,.54]])orchard(c,L*f,floor(L*f)-2*k,s*k,p,r,false);
  const bridgeX=L*.745,bridgeW=Math.min(1.30,L/1600+.41)*k;bridge(c,bridgeX,floor(bridgeX)+10*k,bridgeW,p);
  for(const [f,v] of [[.863,.52],[.874,.68],[.885,.42],[.932,.89]])cypress(c,L*f,floor(L*f)-2*k,v*k,p,r);
  for(let j=0;j<11;j++){const x=L*(.84+.153*j/11)+Math.sin(j*9)*4,yy=h*(.16+.16*r());star(c,x,yy,k*(1.55+1.9*r()),colored?'#b18a3e':'#b7ac8e');}
  letter(c,L-14*k,floor(L-14*k)-1*k,.71*k,p);
  c.beginPath();c.moveTo(0,h);for(let x=0;x<L+4;x+=4)c.lineTo(x,floor(x));c.lineTo(L,h);c.closePath();c.fillStyle=colored?'#e7d9b6':'#e7dfc9';c.fill();
  c.strokeStyle=p.path;c.lineWidth=.95*k;c.beginPath();for(let x=0;x<L+3;x+=3){const yy=floor(x)+.27*k*Math.sin(x*1.39);if(x)c.lineTo(x,yy);else c.moveTo(x,yy);}c.stroke();
  for(let i=0;i<L/3.9;i++){const x=r()*L,yy=floor(x)+1+r()*h*.09;paperLine(c,[[x,yy],[x+(2+r()*5)*k,yy-.7*k]],p.faint,.44*k);}
  for(let j=0;j<L/22;j++){const x=r()*L;if(Math.abs(x-bridgeX)<h*.75)continue;reed(c,x,floor(x),k*(2.7+r()*5.6),p.faint,j%6===0?p.gold:null);}
  c.restore();
 }
 function dimensions(w,h,last){
  const margin=clamp(Math.min(51,h*.76)*.87+4,31,54),L=Math.max(w*1.48,w+(last||30)*Math.max(19,Math.min(h*.45,32)));
  return {w,h,margin,L,last:Math.max(1,last)};
 }
 function location(m,page){const p=clamp(page/m.last),travel=(m.L-2*m.margin)*p,camera=(m.L-m.w)*p,x=m.margin+travel;return {p,x,screenX:x-camera,ground:ground(x,m.L,m.h),travel,camera};}
 class Journey{
  constructor(canvas,factory,last){this.canvas=canvas;this.factory=factory;this.last=last;this.position=0;this.facing=1;this.turn=0;this.walkPhase=0;this.placed=false;this.width=0;this.layers=null;}
  resize(w,h,dpr=1){
   w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));const rs=Math.min(1.8,dpr,7500/dimensions(w,h,this.last).L);
   if(this.width===w&&this.height===h&&this.dpr===rs)return;
   this.width=w;this.height=h;this.dpr=rs;this.canvas.width=Math.round(w*rs);this.canvas.height=Math.round(h*rs);this.ctx=this.canvas.getContext('2d');this.ctx.setTransform(rs,0,0,rs,0,0);this.m=dimensions(w,h,this.last);
   this.layers=[false,true].map(color=>{const surface=this.factory();surface.width=Math.ceil(this.m.L*rs);surface.height=Math.ceil(h*rs);const c=surface.getContext('2d');c.setTransform(rs,0,0,rs,0,0);scenery(c,this.m.L,h,color);return surface;});
   this.show(this.position,0,this.facing);
  }
  show(page,activity=0,heading){
   page=clamp(page,0,this.last);const delta=page-this.position;
   if(Math.abs(delta)>.00006)this.facing=delta<0?-1:1;else if(heading)this.facing=heading<0?-1:1;
   const aim=this.facing<0?1:0,move=Math.abs(delta);
   // The two children keep their place when a gesture pauses. They round the
   // turn over half a leaf's travel; an interrupted reversal retraces that arc.
   // First views, index jumps and reduced motion settle straight into the pose.
   if(!this.placed||move>3||(activity===0&&move>=.98))this.turn=aim;
   else if(move>.000001)this.turn+=clamp(aim-this.turn,-move/.51,move/.51);
   this.position=page;if(!this.layers)return;
   const c=this.ctx,m=this.m,h=m.h,w=m.w,t=location(m,page),d=this.dpr;activity=clamp(activity);
   const stride=clamp(h*.355,14.1,25.2);
   if(!this.placed||move>3)this.walkPhase=t.travel*Math.PI/stride;
   else this.walkPhase+=move*(m.L-2*m.margin)/m.last*Math.PI/stride;
   this.placed=true;
   c.clearRect(0,0,w,h);const base=c.createLinearGradient(0,0,0,h);base.addColorStop(0,'#f2ebdd');base.addColorStop(.71,'#f3edda');base.addColorStop(1,'#e8dfc8');c.fillStyle=base;c.fillRect(0,0,w,h);
   c.drawImage(this.layers[0],t.camera*d,0,w*d,h*d,0,0,w,h);
   // The paper takes on pigment behind the pair. Exactly the same part loses
   // its colour when he retraces the route.
   const fade=Math.min(14,h*.20),edge=Math.max(0,t.screenX-fade*.72);c.drawImage(this.layers[1],t.camera*d,0,edge*d,h*d,0,0,edge,h);
   c.save();for(let i=0;i<8;i++){const x=edge+i*fade/8,ww=Math.min(w-x,fade/8+.08);if(ww<=0)break;c.globalAlpha=1-(i+.5)/8;c.drawImage(this.layers[1],(t.camera+x)*d,0,ww*d,h*d,x,0,ww,h);}c.restore();
   // Two trails of tiny soles, offset in depth and in cadence. They end at
   // the travellers, not beyond their shoes, when the route is retraced.
   const childH=Math.min(clamp(h*.76,27,51),(t.ground-.8)/1.12);
   const yaw=this.turn*this.turn*(3-2*this.turn),theta=yaw*Math.PI,groundAt=sx=>ground(t.camera+sx,m.L,h)-.25;
   for(const z of [0,1]){
    const sep=childH*.2575*(z?-1:1),stepLength=stride*(z?.952:1),shift=sep+z*stepLength*.38;
    const start=Math.max(1,Math.ceil((t.camera-m.margin-shift)/stepLength)),end=Math.floor((t.x+sep*Math.cos(theta)-m.margin-shift)/stepLength);
    for(let i=start;i<=end;i++){const wx=m.margin+shift+i*stepLength,xx=wx-t.camera;if(xx<2||xx>w-2)continue;const gy=ground(wx,m.L,h)+1.15+z*2.25+(i%2)*.77;blob(c,xx,gy,z?1.29:1.65,z?.42:.52,z?'rgba(99,66,39,.28)':'rgba(99,66,39,.39)',i%2?.13:-.15);}
   }
   Traveler.draw(c,t.screenX,t.ground-.25,childH,{phase:this.walkPhase,activity,facing:this.facing,turn:yaw,groundAt,progress:t.p,ink:'#24354f',accent:t.p<.085?'#787263':t.p<.51?'#bb8547':t.p<.79?'#ad7463':'#bb8550'});
   // A letterpress rule on the lower edge carries into the controls.
   c.fillStyle='rgba(108,83,47,.16)';c.fillRect(0,h-.7,w,.7);
  }
 }
 return {Journey,dimensions,location};
});
