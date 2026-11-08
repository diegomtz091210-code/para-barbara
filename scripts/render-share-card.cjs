// Render a sharing image from the same artwork and drawing used on the website.
const path=require('node:path'),fs=require('node:fs');
const {createCanvas,loadImage,GlobalFonts}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));
const Endpapers=require('../dist/endpapers'),{Journey}=require('../dist/journey'),art=require('../artworks.json');const base=path.resolve(__dirname,'..');
async function stageLight(c,w,h){
 const html=fs.readFileSync(path.join(base,'dist/index.html'),'utf8');
 const paint=async(name,x,y,ww,hh)=>{const svg=html.match(new RegExp('<svg class="'+name+'"[^>]*>[\\s\\S]*?</svg>'))?.[0];if(!svg)throw new Error('Missing stage light: '+name);
  const expanded=svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.round(ww)+'" height="'+Math.round(hh)+'" ');const im=await loadImage(Buffer.from(expanded));c.drawImage(im,x,y,ww,hh);
 };
 await paint('light-field',0,0,w,h);const lampW=Math.max(48,Math.min(75,w*.055)),lampH=lampW*48/86;await paint('theatre-lamp',(w-lampW)/2,-lampH*.16,lampW,lampH);
}
(async()=>{
 GlobalFonts.registerFromPath(path.join(base,'dist/fonts/pinyon.ttf'),'Pinyon Script');
 const cv=createCanvas(1200,630),c=cv.getContext('2d'),atlas=await loadImage(path.join(base,'dist/graphics/estampas-de-portada.webp'));
 Endpapers.cover(c,1200,555,atlas);await stageLight(c,1200,555);c.save();c.translate(88,175);c.rotate(-.027);c.fillStyle='#24354f';c.font='94px "Pinyon Script"';c.fillText('Bárbara,',0,0);c.fillText('mira esto.',0,86);
 c.font='29px "Pinyon Script"';c.fillStyle='#24354f';c.fillText('Vi estos girasoles y pensé en ti.',4,172);c.fillText('¿Me acompañas un ratito?',4,208);c.restore();
 const footer=createCanvas(1,1),scene=new Journey(footer,()=>createCanvas(1,1),art.length+1);scene.resize(1200,75,1);scene.show(0,0);c.drawImage(footer,0,555);
 fs.writeFileSync(path.join(base,'dist/graphics/para-barbara.jpg'),cv.toBuffer('image/jpeg',87));
})().catch(e=>{console.error(e);process.exitCode=1;});
