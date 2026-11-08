const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));
const Studio=require('../dist/brush-engine.js'),{PageTurn}=require('../dist/book-engine.js');
const factory=()=>createCanvas(1,1),root=path.resolve(__dirname,'..'),output='/tmp/barbara-v13-qa';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'artworks.json'),'utf8'));
 const works=['monet-pond','sunflowers','vangogh','almond-blossom','cafe-terrace'].map(id=>{const s=catalog.find(x=>x.id===id);return {...s,kind:'art',dark:s.fg==='#fff6e5'};});
 const images=await Promise.all(works.map(s=>loadImage(path.join(root,'dist',s.image))));
 const montage=createCanvas(390*3,690*2),mx=montage.getContext('2d'),gallery=createCanvas(390*3,664),gx=gallery.getContext('2d');
 for(const [w,h,ratio,direction] of [[390,664,1,1],[390,664,2,-1],[1070,794,1,1],[320,480,1,-1]]){
  const prev=Studio.surface(factory,w,h,ratio),next=Studio.surface(factory,w,h,ratio),dest=Studio.surface(factory,w,h,ratio);
  Studio.compose(prev.getContext('2d'),w,h,works[0],images[0]);
  Studio.compose(next.getContext('2d'),w,h,works[1],images[1]);
  const page=new PageTurn({context:dest.getContext('2d'),previous:prev,next,width:w,height:h,ratio,factory,direction,leaf:works[direction>0?0:1]});
  let previousFold=direction>0?w:0;
  for(const [i,p] of [0,.16,.32,.50,.72,1].entries()){
   const clips=page.render(p),pixels=dest.getContext('2d').getImageData(0,0,dest.width,dest.height).data;
   for(let k=3;k<pixels.length;k+=4)assert.equal(pixels[k],255,'no blank or transparent holes during a turn');
   const fold=page.shape(p).fold;
   assert(direction>0?fold<=previousFold:fold>=previousFold,'advance folds left; backward unfolds right');previousFold=fold;
   assert(!clips.incoming.includes('NaN')&&!clips.outgoing.includes('NaN'));
   if(p===0||p===1){const expected=(p===0?prev:next).getContext('2d').getImageData(0,0,dest.width,dest.height).data;assert.deepEqual(pixels,expected,'endpoints must exactly match their complete scenes');}
   if(w===390&&ratio===1){const x=i%3*390,y=Math.floor(i/3)*690;mx.drawImage(dest,x,y,390,664);mx.fillStyle='#f8f3e8';mx.fillRect(x,y+664,390,26);mx.fillStyle='#333';mx.font='14px sans-serif';mx.fillText(`${Math.round(p*100)}% · giro real del lienzo`,x+14,y+682);}
  }
  if(direction>0){
   // The first lift must reveal a real lower corner while the opposite part remains at rest.
   page.render(.2);const sample=(cv,x,y,ww,hh)=>cv.getContext('2d').getImageData(x,y,ww,hh).data;
   const topHeight=Math.round(dest.height*.18);assert.deepEqual(sample(dest,0,0,dest.width,topHeight),sample(prev,0,0,dest.width,topHeight));
   const boxWidth=Math.ceil(dest.width*.12),boxHeight=Math.ceil(dest.height*.12),xx=dest.width-boxWidth,yy=dest.height-boxHeight;
   const changed=sample(dest,xx,yy,boxWidth,boxHeight),original=sample(prev,xx,yy,boxWidth,boxHeight);let n=0;for(let j=0;j<changed.length;j+=4)if(Math.abs(changed[j]-original[j])>7)n++;
   assert(n>boxWidth*boxHeight*.04,'advancing must physically reveal the lower right corner');
  }
  assert.equal(page.clips(1).incoming,'none');assert.equal(page.clips(0).outgoing,'none');
  const box=Studio.artBox(images[1].width,images[1].height,w,h,works[1]);assert(box.x>0&&box.y>0&&box.x+box.w<w&&box.y+box.h<h);assert(Math.abs(box.w/box.h-images[1].width/images[1].height)<1e-9,'original painting aspect ratio');
 }
 for(const [i,n] of [3,4,2].entries()){
  const img=images[n];
  const c=Studio.surface(factory,390,664);Studio.compose(c.getContext('2d'),390,664,works[n],img);gx.drawImage(c,i*390,0);
  const pixels=c.getContext('2d').getImageData(0,580,390,70).data;const colors=new Set();for(let k=0;k<pixels.length;k+=4)colors.add(`${pixels[k]},${pixels[k+1]},${pixels[k+2]}`);assert(colors.size>100,'outer paper must carry the painting, not a solid fill');
 }
 fs.writeFileSync(path.join(output,'book-frames.png'),montage.toBuffer('image/png'));fs.writeFileSync(path.join(output,'painted-backgrounds.png'),gallery.toBuffer('image/png'));
 console.log('PASS: page curl direction, forward/backward endpoints, complete opaque frames, synchronized HTML clips, 1x/2x density, three viewport sizes, uncropped originals and textured painting continuations. Native Canvas rendering, not browser screenshots.');
})().catch(e=>{console.error(e);process.exitCode=1;});
