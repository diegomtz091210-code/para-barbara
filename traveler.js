/* Two cut-paper children, with individual gaits and one shared handclasp.
   During a U-turn they take opposite arcs across the depth of the path. */
(function (root, make) {
  const api = make();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TravelerStudio = api;
})(typeof window === 'undefined' ? globalThis : window, () => {
  'use strict';
  const PI = Math.PI, TURN = PI * 2;
  const unit = n => Math.max(0, Math.min(1, n));
  const mix = (a,b,t) => a+(b-a)*t;
  const smooth = t => { t=unit(t); return t*t*(3-2*t); };
  const step = (a,b,v) => smooth((v-a)/(b-a));
  const lerpPoint = (a,b,t) => ({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)});
  const at = (x,y) => ({x,y});

  // Coordinate system: the soles meet y=0; a child's proportions put the
  // crown near -98, hips at -36. The knee is solved from the moving ankle.
  function leg(phase,near,activity,bob,sway) {
    const cycle = ((phase/TURN)%1+1)%1, stance = .59, planted = cycle < stance;
    const t = planted ? cycle/stance : (cycle-stance)/(1-stance);
    const ankleX = planted ? mix(16.7,-15.3,t) : mix(-15.3,16.7,smooth(t));
    const lift = planted ? 0 : 10.3 * Math.sin(PI*t)**1.22;
    const roll = planted ? -.23*(1-step(0,.22,t))+.64*step(.70,1,t) : mix(.64,-.23,step(.03,.79,t));
    const angle=roll*activity, cs=Math.cos(angle), sn=Math.sin(angle);
    // These points enclose the actual sole, including its curved toe.
    const contact=Math.max(-3.48*sn+3.15*cs,-2.55*sn+3.48*cs,3.6*sn+3.44*cs,7.8*sn+2.9*cs,8.9*sn+1.95*cs);
    const idleHip=at(near?1.5:-3.7,-36.6), idleKnee=at(near?4.8:-4.1,-19.9), idleFoot=at(near?4.3:-5.2,-contact);
    const hip=at(idleHip.x+sway*.67,idleHip.y+bob), foot=at(mix(idleFoot.x,ankleX,activity),-contact-lift*activity);
    const dx=foot.x-hip.x,dy=foot.y-hip.y,dist=Math.max(.1,Math.hypot(dx,dy));
    const upper=19.65,lower=18.55,along=Math.min(upper,Math.max(0,(upper*upper-lower*lower+dist*dist)/(2*dist)));
    const bend=Math.sqrt(Math.max(0,upper*upper-along*along));
    const walkKnee=at(hip.x+(dx*along+dy*bend)/dist,hip.y+(dy*along-dx*bend)/dist);
    return {hip,knee:lerpPoint(idleKnee,walkKnee,activity),foot,angle};
  }
  function joint(c,a,b,wa,wb) {
    // Rounded, tapered limbs remain a continuous silhouette at small sizes.
    const dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
    c.beginPath();c.moveTo(a.x+nx*wa,a.y+ny*wa);
    c.quadraticCurveTo((a.x+b.x)/2+nx*(wa*.56+wb*.47),(a.y+b.y)/2+ny*(wa*.56+wb*.47),b.x+nx*wb,b.y+ny*wb);
    c.quadraticCurveTo(b.x+dx/L*wb*1.35,b.y+dy/L*wb*1.35,b.x-nx*wb,b.y-ny*wb);
    c.lineTo(a.x-nx*wa,a.y-ny*wa);c.quadraticCurveTo(a.x-dx/L*wa,a.y-dy/L*wa,a.x+nx*wa,a.y+ny*wa);c.fill();
  }
  function shorts(c,a,b,near) {
    const e=lerpPoint(a,b,near?.68:.63),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,nx=dy/d,ny=-dx/d;
    c.beginPath();c.moveTo(a.x+nx*5.4,a.y+ny*5.4);c.quadraticCurveTo(e.x+nx*4.4,e.y+ny*4.4-2,e.x+nx*5.1,e.y+ny*5.1);
    c.quadraticCurveTo(e.x+.4,e.y+1.25,e.x-nx*5.25,e.y-ny*5.25+.5);c.lineTo(a.x-nx*5.6,a.y-ny*5.6);c.closePath();c.fill();
  }
  function drawLeg(c,L,near,ink,az=1,depth=0,girl=false,mark='#f3ead2') {
    c.save();c.fillStyle=ink;c.globalAlpha*=near?1:.83;
    joint(c,L.hip,L.knee,girl?3.65:4.3,2.8);joint(c,L.knee,L.foot,girl?2.45:2.75,1.78);if(!girl)shorts(c,L.hip,L.knee,near);
    c.translate(L.foot.x,L.foot.y);
    // The shoe keeps a heel-width when the children turn towards the depth of the path.
    if(depth>.001){const si=Math.sin(L.angle),co=Math.cos(L.angle),sole=Math.max(-3.48*si+3.15*co,-2.55*si+3.48*co,3.6*si+3.44*co,7.8*si+2.9*co,8.9*si+1.95*co);c.beginPath();c.ellipse(0,sole-1.65,3.05*depth,1.65,0,0,TURN);c.fill();}
    if(Math.abs(az)<.0001){c.restore();return;}
    c.scale(az*(girl?.87:1),1);c.rotate(L.angle);c.beginPath();c.moveTo(-2.75,-2.35);
    c.quadraticCurveTo(-2,-1.3,-.45,-1.55);c.lineTo(1.8,-2.15);c.quadraticCurveTo(2.8,-.2,4.6,.3);
    c.bezierCurveTo(7.7,.35,9.1,.8,8.85,1.95);c.quadraticCurveTo(8.2,3.06,3.6,3.42);
    c.lineTo(-2.5,3.45);c.quadraticCurveTo(-3.65,3.2,-3.53,2.12);c.lineTo(-2.75,-2.35);c.closePath();c.fill();
    if(girl&&near){c.strokeStyle=mark;c.lineWidth=1.05;c.globalAlpha*=.65;c.beginPath();c.moveTo(.25,-.85);c.lineTo(2.0,.65);c.stroke();}c.restore();
  }
  function head(c,ink,mark){
    // A soft forehead and turned-up nose, cowlicks in front of a rounded nape.
    c.fillStyle=ink;c.beginPath();c.moveTo(-5.8,-66.8);c.quadraticCurveTo(-5.2,-71.8,-8.55,-73);
    c.quadraticCurveTo(-11.1,-73.55,-12.05,-76);c.lineTo(-14,-74.85);c.quadraticCurveTo(-13.35,-77.2,-13.9,-79.6);
    c.lineTo(-16.7,-78.3);c.quadraticCurveTo(-14.2,-81.3,-14.8,-83.6);c.lineTo(-16.4,-83.6);
    c.quadraticCurveTo(-15.1,-91,-9.75,-93.7);c.lineTo(-12.8,-95.2);c.quadraticCurveTo(-7.3,-96,-5.1,-94.7);
    c.lineTo(-4.7,-98.75);c.quadraticCurveTo(-2.25,-96.2,.5,-96.1);c.quadraticCurveTo(5.4,-99.3,9.9,-95.9);
    c.quadraticCurveTo(13.75,-95.4,15.1,-91.3);c.quadraticCurveTo(13.45,-91.8,12.4,-91.35);
    c.quadraticCurveTo(13.9,-89,13.45,-85.45);c.quadraticCurveTo(13.75,-83.8,16.65,-81.9);
    c.quadraticCurveTo(17.15,-80.46,14.1,-79.94);c.quadraticCurveTo(15.04,-78.6,13.72,-77.85);
    c.quadraticCurveTo(14.3,-76.9,13.2,-76.2);c.quadraticCurveTo(13.05,-73.58,10.4,-73.3);
    c.lineTo(6.15,-72.95);c.quadraticCurveTo(4.95,-70.25,5.75,-66.25);c.closePath();c.fill();
    // Just two engraved notches in the hair; the face stays in silhouette.
    c.save();c.strokeStyle=mark;c.globalAlpha*=.48;c.lineWidth=1.25;c.beginPath();c.moveTo(-9.2,-90.3);c.quadraticCurveTo(-6.1,-93,-3.1,-92.8);
    c.moveTo(-6.2,-80.7);c.quadraticCurveTo(-8.05,-84.03,-5.35,-84.45);c.stroke();c.restore();
  }
  function twig(c,x,y,grow,phase,activity,offer,ink,accent,az=1,depth=0){
    c.save();c.translate(x,y);c.rotate((-.05+.1*Math.cos(phase+.35)*activity+.18*offer)*az);
    const shoot=step(.04,.63,grow),opening=step(.54,.89,grow),bud=step(.25,.65,grow),px=(u,v)=>az*u-.17*depth*v;
    const ux=5.9+3.9*shoot,vy=-15.5-5.2*shoot,tip=at(px(ux,vy),vy);c.strokeStyle=ink;c.lineWidth=1.85;c.beginPath();c.moveTo(px(-1.15,3.9),3.9);c.bezierCurveTo(px(.3,-3.2),-3.2,px(4.8,-11.4),-11.4,tip.x,tip.y);c.stroke();
    function leaf(lx,ly,dx,dy,width){c.beginPath();c.moveTo(px(lx,ly),ly);c.quadraticCurveTo(px(lx+dx*.36+width,ly+dy*.18)+depth*.5,ly+dy*.18,px(lx+dx,ly+dy),ly+dy);c.quadraticCurveTo(px(lx+dx*.30-width*.22,ly+dy*.78)-depth*.5,ly+dy*.78,px(lx,ly),ly);c.fill();}
    c.fillStyle=ink;leaf(2.37,-6.75,-2.9-1.8*shoot,-4.15-2.2*shoot,2.05);if(shoot>.03)leaf(4.9,-12.05,(2.7+4.6*shoot)*shoot,(-1.4-2.15*shoot)*shoot,2.15*shoot);
    if(bud>.025){c.fillStyle=accent;c.save();c.translate(tip.x,tip.y);c.rotate(.17);c.scale(bud,bud);
      // A single field flower, with irregular daisy petals rather than an icon.
      for(let j=0;j<6;j++){const a=j*TURN/6+[.03,-.10,.07,-.04,.10,.01][j];c.save();c.rotate(a);
       const len=mix(2.1,5.55,opening)*[.92,1.04,1.02,.86,1.04,.90][j],wid=mix(.7,1.97,opening);c.beginPath();c.moveTo(-.4,-.25);c.bezierCurveTo(-wid,-len*.40,-wid,-len*.93,-wid*.32,-len);c.bezierCurveTo(wid*1.18,-len*1.08,wid*.88,-len*.42,.4,-.25);c.closePath();c.fill();c.restore();}
      c.fillStyle=ink;c.beginPath();c.arc(0,0,mix(.7,1.3,opening),0,TURN);c.fill();c.restore();}
    c.restore();
  }
  function scratches(ink){const m=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(ink);if(!m)return '#f4e5c9';const hex=m[1].length===3?m[1].split('').map(k=>k+k).join(''):m[1],n=parseInt(hex,16);return ((n>>16)*.299+((n>>8)&255)*.587+(n&255)*.114)>150?'#393a30':'#f3ead2';}
  function boyBody(c,phase,activity,ink,mark){
    head(c,ink,mark);
    // Short, slightly oversized jacket, a turned collar and a loose back hem.
    c.fillStyle=ink;c.beginPath();c.moveTo(-5.25,-70.1);c.lineTo(4.4,-69.6);c.quadraticCurveTo(5.8,-67.8,8.0,-66.1);
    c.quadraticCurveTo(11.2,-63.8,9.3,-59.45);c.quadraticCurveTo(9.8,-49.25,10.0,-44.7);
    c.lineTo(11.05,-39.8);c.lineTo(6.1,-39.2);c.lineTo(4.3,-37.8);c.quadraticCurveTo(-3.8,-39.25,-12.9,-37.4);
    c.quadraticCurveTo(-12.15,-40.9,-13.8,-42.24);c.quadraticCurveTo(-11.05,-48.3,-10.7,-58.4);c.quadraticCurveTo(-11.1,-65.75,-5.6,-67.72);c.closePath();c.fill();
    // A cross-body satchel swings behind his hip; its small flap and long strap
    // separate the silhouette from the dark coat without outlining the child.
    c.save();c.strokeStyle=mark;c.globalAlpha*=.73;c.lineWidth=1.65;c.beginPath();c.moveTo(2.8,-67.65);c.bezierCurveTo(.2,-62.2,-5.1,-53.6,-12.0,-47.4);c.stroke();c.restore();
    c.save();c.translate(-11.1,-46.0);c.rotate(-.1-.11*activity*Math.sin(phase-.35));c.fillStyle=ink;c.beginPath();c.moveTo(-6.4,-3.6);c.quadraticCurveTo(-.35,-5.4,5.35,-3.35);c.lineTo(5.85,4.15);c.quadraticCurveTo(3.65,7.8,-3.0,7.0);c.quadraticCurveTo(-7.0,6.8,-7.15,4.75);c.closePath();c.fill();c.strokeStyle=mark;c.globalAlpha*=.66;c.lineWidth=1.4;c.beginPath();c.moveTo(-5.45,-1.8);c.quadraticCurveTo(-.6,1.3,4.6,-1.3);c.moveTo(-.18,1);c.lineTo(-.15,2.85);c.stroke();c.restore();
  }
  function girlBody(c,phase,activity,ink,mark){
    const swing=Math.sin(phase-.36)*activity;
    // Hair tied with a little ribbon. The ponytail hangs from its own pivot.
    c.save();c.translate(-10,-86);c.rotate(-.07+swing*.12);c.fillStyle=ink;c.beginPath();c.moveTo(.3,1);
    c.bezierCurveTo(-2,-4,-8,-4,-11,0);c.bezierCurveTo(-14.5,5.2,-11.7,13,-18.7,17.6);
    c.quadraticCurveTo(-10.5,18.6,-7.4,14.2);c.quadraticCurveTo(-8,17,-5.6,18.8);c.bezierCurveTo(-6,15,-2.4,12.5,-3.1,7.3);c.quadraticCurveTo(-4,3.6,.3,1);c.fill();
    c.beginPath();c.moveTo(-3.5,-.6);c.quadraticCurveTo(-9.5,-2.1,-9,-6.8);c.quadraticCurveTo(-3.2,-5.5,-2.8,-1.4);c.quadraticCurveTo(-1.4,-6.4,2.6,-7.3);c.quadraticCurveTo(3.0,-2.5,-.8,-.1);c.closePath();c.fill();c.restore();
    c.fillStyle=ink;c.beginPath();c.moveTo(-4.8,-67.3);c.quadraticCurveTo(-4.7,-71.5,-8.8,-74.6);
    c.bezierCurveTo(-15.3,-79,-14.7,-86,-11.8,-91.7);c.bezierCurveTo(-7.5,-99.25,4,-99.43,9.5,-95.5);
    c.quadraticCurveTo(13.75,-92.8,13.9,-89.8);c.quadraticCurveTo(13,-88.7,12.4,-88.5);
    c.quadraticCurveTo(13.2,-86,12.7,-84.5);c.quadraticCurveTo(13.3,-82.3,15.7,-81.6);
    c.quadraticCurveTo(16.25,-80.2,13.2,-79.6);c.quadraticCurveTo(14.6,-78.3,13,-77.4);
    c.quadraticCurveTo(13.3,-73.7,10.25,-73);c.lineTo(5.75,-72.6);c.quadraticCurveTo(4.8,-70.2,6.15,-67.0);c.closePath();c.fill();
    // A short swaying skirt, a waist seam and a turned pocket; the legs stay readable.
    c.beginPath();c.moveTo(-5.45,-69.1);c.quadraticCurveTo(-10.8,-67.5,-10.6,-61.4);
    c.quadraticCurveTo(-9.0,-53,-9.5,-48.1);c.quadraticCurveTo(-10.65,-41.2,-16.4-swing*2,-31.3);
    c.quadraticCurveTo(-13.15-swing,-31.65,-11.45,-29.9);c.quadraticCurveTo(-8.7,-28.7,-6.4,-30.1);
    c.quadraticCurveTo(-3.5,-31.2,-.8,-29.5);c.quadraticCurveTo(2.0,-28.4,4.1,-29.6);c.quadraticCurveTo(6.65,-31,9.1,-29.6);
    c.quadraticCurveTo(11.9,-29.4,14.25+swing*1.2,-30.7);c.quadraticCurveTo(9.8,-40.9,8.15,-49.55);
    c.quadraticCurveTo(7.35,-53.8,9.1,-59.5);c.quadraticCurveTo(10.8,-65.4,5.6,-67.7);c.lineTo(2.6,-69.2);c.closePath();c.fill();
    c.save();c.strokeStyle=mark;c.globalAlpha*=.53;c.lineWidth=1.35;c.beginPath();c.moveTo(-7.0,-48.4);c.quadraticCurveTo(-.4,-47.2,5.6,-49.0);c.moveTo(-10.5,-35.5);c.quadraticCurveTo(-8.5,-39.25,-7.7,-42.75);c.moveTo(-8,-91.1);c.quadraticCurveTo(-4.05,-95.6,1.0,-94.7);c.stroke();c.restore();
  }
  // Along a semicircle the side profile gets narrower, but hair, shoulders and
  // clothing retain their transverse volume. There is no flip or cross-fade.
  function bodyDepth(c,girl,d,ink,mark){
    if(d<.001)return;c.save();c.scale(d,1);c.fillStyle=ink;
    c.beginPath();c.ellipse(0,-84.75,girl?12.5:13.25,girl?13.05:13.45,0,0,TURN);c.fill();
    if(!girl){c.beginPath();c.moveTo(-12.6,-83);c.lineTo(-15.15,-81.7);c.quadraticCurveTo(-14.05,-87.0,-12.7,-89.9);c.lineTo(-14.7,-89.1);c.quadraticCurveTo(-11.0,-95.7,-5.8,-96.1);c.lineTo(-8.55,-98.65);c.quadraticCurveTo(-4.0,-98.9,-.9,-97.0);c.lineTo(.95,-99.6);c.quadraticCurveTo(2.4,-96.9,5.9,-96.2);c.lineTo(4.9,-92);c.closePath();c.fill();}
    c.beginPath();c.moveTo(-5.8,-73.8);c.quadraticCurveTo(-3.4,-69.8,-7.2,-68);c.quadraticCurveTo(-14.4,-66.4,-13.6,-60.8);
    c.lineTo(-10,-49.4);c.lineTo(girl?-16.5:-12.1,girl?-31.0:-38.4);c.quadraticCurveTo(0,girl?-28.4:-36.8,girl?16:12.3,girl?-30.6:-38.7);
    c.lineTo(10.2,-49.7);c.lineTo(13.35,-61.15);c.quadraticCurveTo(14.3,-66.9,6.4,-68.1);c.quadraticCurveTo(3.1,-69.25,5.0,-74);c.closePath();c.fill();
    if(girl){c.beginPath();c.moveTo(5.2,-90.4);c.bezierCurveTo(17.2,-95,18.3,-82.2,16.6,-77);c.quadraticCurveTo(15.15,-70.7,20,-69.6);c.bezierCurveTo(13.2,-67.3,8.2,-72.7,9.4,-80.0);c.quadraticCurveTo(11.9,-88,5.2,-90.4);c.fill();}
    else{c.strokeStyle=mark;c.globalAlpha*=d*.55;c.lineWidth=1.6;c.beginPath();c.moveTo(-6.1,-66.0);c.lineTo(7.5,-46.15);c.stroke();}
    c.restore();
  }
  function childPose(child,opt){
    const {phase,activity,grow,az,d,grip}=opt,girl=child.girl,pp=girl?phase*1.043+1.17:phase;
    const cyc=Math.cos(pp),bob=(1-Math.cos(pp*2+(girl?.41:.14)))*(girl?.85:1.03)*activity;
    const sway=(girl?.65:.88)*cyc*activity,tilt=(girl?.025:.032)*activity+.014*activity*Math.sin(pp)-(girl?0:.011*step(.865,.992,grow));
    const ct=Math.cos(tilt),st=Math.sin(tilt);
    const project=(v,z=0,body=true)=>{if(!body)return at(az*v.x+d*z,v.y);const yy=v.y+36.6,xx=ct*v.x-st*yy+sway;return at(az*xx+d*z,st*v.x+ct*yy-36.6+bob);};
    const legs=[false,true].map(near=>{const raw=leg(pp+(near?0:PI),near,activity,bob,sway),z=(near?1:-1)*(girl?3.2:3.75);return {hip:project(raw.hip,z,false),knee:project(raw.knee,z,false),foot:project(raw.foot,z,false),angle:raw.angle};});
    const toLocal=p=>{const ly=(p.y-child.y)/child.scale;return at((p.x-child.x)/child.scale-child.lean*ly,ly);};
    const shoulder=project(girl?at(4.2,-62.7):at(-4.4,-62.9),girl?4.3:2.7);
    const palm=toLocal(grip),elbow=at(mix(shoulder.x,palm.x,.5)+(girl?-1.6:1.7)*az*(1-.4*d),mix(shoulder.y,palm.y,.5)+4.1-.65*activity*cyc);
    return {pp,cyc,bob,sway,tilt,project,legs,shoulder,palm,elbow};
  }
  function renderChild(c,child,rig,opt){
    const {az,d,ink,accent,mark,activity,grow}=opt,{project,pp,cyc,legs}=rig,girl=child.girl;
    c.save();c.translate(child.x,child.y);c.scale(child.scale,child.scale);c.transform(1,0,child.lean,1,0,0);c.fillStyle=ink;
    drawLeg(c,legs[0],false,ink,az,d,girl,mark);drawLeg(c,legs[1],true,ink,az,d,girl,mark);
    if(girl){
      const fs=at(-5,-63.0),a=-.38+.73*cyc*activity,el=at(fs.x+14*Math.sin(a),fs.y+14*Math.cos(a)),hand=at(el.x+11.45*Math.sin(a+.25),el.y+11.45*Math.cos(a+.25));
      const s=project(fs,-5),e=project(el,-7),t=project(hand,-7.2);c.save();c.globalAlpha*=.86;joint(c,s,e,3.6,2.55);joint(c,e,t,2.2,1.6);c.beginPath();c.ellipse(t.x,t.y+.65,2.08,2.62,0,0,TURN);c.fill();c.restore();
    }
    // Both sets of fingers arrive at the same world-space palm, even when
    // their shoes stand at different heights on the hill or in the turn.
    c.save();c.globalAlpha*=girl?.99:.94;joint(c,rig.shoulder,rig.elbow,girl?3.65:3.8,2.8);joint(c,rig.elbow,rig.palm,2.62,2.12);c.beginPath();c.ellipse(rig.palm.x,rig.palm.y,2.61,2.36,0,0,TURN);c.fill();c.restore();
    c.save();c.translate(az*rig.sway,rig.bob);bodyDepth(c,girl,d,ink,mark);c.restore();
    if(Math.abs(az)>.0001){c.save();c.scale(az,1);c.translate(rig.sway,rig.bob);c.translate(0,-36.6);c.rotate(rig.tilt);c.translate(0,36.6);if(girl)girlBody(c,pp,activity,ink,mark);else boyBody(c,pp,activity,ink,mark);c.restore();}
    if(!girl){
      const offer=step(.865,.992,grow),ns=at(4.5,-63.2),up=-.045-.38*cyc*activity,baseE=at(ns.x+14.2*Math.sin(up),ns.y+14.2*Math.cos(up)),fa=1.03-.25*cyc*activity;
      const baseH=at(baseE.x+11.2*Math.sin(fa),baseE.y+11.2*Math.cos(fa)),e=project(lerpPoint(baseE,at(15,-55),offer),-8),hand=project(lerpPoint(baseH,at(26.4,-59.7),offer),-10),s=project(ns,-5.6);
      twig(c,hand.x+.45*az,hand.y+.35,grow,pp,activity,offer,ink,accent,az,d);
      c.fillStyle=ink;joint(c,s,e,4.1,2.9);joint(c,e,hand,2.5,1.65);c.beginPath();c.ellipse(hand.x+.1,hand.y,2.45,2.08,0,0,TURN);c.fill();
    }
    c.restore();
  }
  function draw(c,x,groundY,height,options={}){
    if(!c||!Number.isFinite(height)||height<=0)return;
    const phase=Number.isFinite(options.phase)?options.phase% (TURN*4096):0,activity=unit(Number.isFinite(options.activity)?options.activity:0),grow=unit(Number.isFinite(options.progress)?options.progress:0);
    const rotation=Number.isFinite(options.turn)?unit(options.turn):(options.facing<0?1:0),theta=rotation*PI;
    const az=Math.cos(theta),d=Math.sin(theta),scale=height/100;
    const gap=51.5+1.25*activity*Math.sin(phase-.3),off=gap*.5*az;
    const groundOffset=dx=>options.groundAt?(options.groundAt(x+dx*scale)-groundY)/scale:0;
    const boy={x:off,y:groundOffset(off)-14.4*d,scale:1-.021*d,lean:.083*d,girl:false};
    const girl={x:-off,y:groundOffset(-off)+10.8*d,scale:.936+.008*d,lean:-.068*d,girl:true};
    const grip=at((boy.x+girl.x)*.5+21.9*d-az*(.5+.48*activity*Math.sin(phase)),(boy.y+girl.y)*.5-48.6+.71*activity*Math.sin(phase*2+.34));
    const ink=options.ink||'#33392f',accent=options.accent||'#b78b4c';
    const opt={phase,activity:activity*(1-.32*d),grow,az,d,grip,ink,accent,mark:scratches(ink)};
    c.save();c.translate(x,groundY);c.scale(scale,scale);c.lineJoin='round';c.lineCap='round';
    // On the turn he takes the far arc and she the near one, never the same
    // spot on the path. Their linked hands swing around the outside of the arc.
    if(d>.04){c.save();c.fillStyle=ink;c.globalAlpha*=.16*d;for(const k of [boy,girl]){c.beginPath();c.ellipse(k.x,k.y+.25,8.2*k.scale,1.45,0,0,TURN);c.fill();}c.restore();}
    // He turns first to look for the return path; she follows a little later.
    const firstAngle=theta+.43*d,secondAngle=theta-.39*d;
    for(const [child,angle] of [[boy,firstAngle],[girl,secondAngle]]){const view={...opt,az:Math.cos(angle),d:Math.sin(angle)};renderChild(c,child,childPose(child,view),view);}c.restore();
  }
  return {draw};
});
