'use strict';
(() => {
 const section=document.querySelector('.vr-section');if(!section)return;
 const runway=section.querySelector('.vr-scroll'),visual=section.querySelector('.vr-experience');
 const steps=[...section.querySelectorAll('[data-vr-step]')],motion=matchMedia('(prefers-reduced-motion: reduce)');
 const chapters=[
  ['01 / THE IDEA','Smart-home apps hide every device behind a list of tiles. The idea is to skip the list: look at the real device and control it where it stands.'],
  ['02 / PASSTHROUGH','Quest 3 shows your real room through its cameras, in colour. That live view becomes the interface: controls can sit next to an appliance instead of inside a menu.'],
  ['03 / RECOGNISE & CONTROL','The plan: the headset recognises the AC, the TV and the kettle and links each one to its device in Home Assistant. Point at the kettle, and its controls open beside it.']
 ];
 const clamp=n=>Math.max(0,Math.min(1,n)),smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
 let pending=false,manual=0,active=-1;
 function render(){
  pending=false;const still=motion.matches||document.documentElement.classList.contains('paused');
  section.classList.toggle('vr-static',still);
  const p=still?manual:clamp(-runway.getBoundingClientRect().top/Math.max(1,runway.offsetHeight-innerHeight));
  const inside=smooth((p-.64)/.08);
  visual.dispatchEvent(new CustomEvent('hmdprogress',{detail:clamp(p/.64)}));
  visual.style.setProperty('--film-opacity',(1-smooth((p-.635)/.05)).toFixed(3));
  visual.style.setProperty('--room-zoom',(1.22-.22*smooth((p-.38)/.3)).toFixed(3));
  visual.style.setProperty('--room-opacity','1');
  visual.style.setProperty('--pov',inside.toFixed(3));
  visual.classList.toggle('is-inside',p>=.68);
  // Cover-crop the room so the band from the air conditioner to the kettle stays in view.
  const box=visual.getBoundingClientRect(),room=visual.querySelector('.vr-room-view>img');
  const iw=1086,ih=1448,scale=Math.max(box.width/iw,box.height/ih),spare=Math.max(0,ih*scale-box.height);
  const dock=visual.querySelector('.quest-system-dock'),keepAbove=box.height-(dock?dock.offsetHeight+parseFloat(getComputedStyle(dock).bottom)+12:90);
  const offY=Math.max(0,Math.min(spare,905*scale-keepAbove)),offX=(iw*scale-box.width)/2;
  room.style.objectPosition=`50% ${spare?offY/spare*100:50}%`;
  const point=(x,y)=>[x*scale-offX,y*scale-offY];
  visual.querySelectorAll('.vr-detect').forEach(el=>{const [x0,y0,x1,y1]=el.dataset.box.split(',').map(Number),a=point(x0,y0),b=point(x1,y1);Object.assign(el.style,{left:a[0]+'px',top:a[1]+'px',width:(b[0]-a[0])+'px',height:(b[1]-a[1])+'px'});el.classList.toggle('label-inside',a[1]<48)});
  const target=point(357,806),origin=point(592,858);
  const panel=visual.querySelector('.vr-ac-panel'),kettleTop=point(357,742)[1];
  if(box.width<520){const kr=point(412,0)[0];panel.style.left=Math.min(box.width-panel.offsetWidth-8,kr+12)+'px';panel.style.top=Math.max(40,Math.min(box.height-panel.offsetHeight-110,kettleTop-panel.offsetHeight*.45))+'px'}
  else{panel.style.left=Math.max(12,box.width*.03)+'px';panel.style.top=Math.max(44,kettleTop-panel.offsetHeight-48)+'px'}
  const ray=visual.querySelector('.vr-pointing-ray');ray.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);ray.setAttribute('preserveAspectRatio','none');
  ray.querySelector('path').setAttribute('d',`M${origin[0]} ${origin[1]} L${target[0]} ${target[1]}`);
  ray.querySelectorAll('circle').forEach(circle=>{circle.setAttribute('cx',target[0]);circle.setAttribute('cy',target[1])});
  const index=p<.3?0:p<.68?1:2;
  if(index!==active){active=index;section.querySelector('.vr-chapter').textContent=chapters[index][0];section.querySelector('.vr-explanation').textContent=chapters[index][1];steps.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
  section.querySelector('.vr-mode-label').textContent=p>=.68?'THROUGH THE HEADSET':p>=.3?'LOOKING INTO THE LENSES':'OUTSIDE THE HEADSET';
  section.querySelector('.vr-scroll-hint').textContent=p>=.68?'POINT AT THE SMART KETTLE ↖':p>.3?'STEP THROUGH THE LENSES ↓':'SCROLL TO PUT IT ON ↓';
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(render)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);motion.addEventListener('change',request);
 new MutationObserver(request).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 steps.forEach((button,i)=>button.addEventListener('click',()=>{manual=[.06,.46,.88][i];if(section.classList.contains('vr-static'))render();else scrollTo({top:scrollY+runway.getBoundingClientRect().top+manual*(runway.offsetHeight-innerHeight),behavior:'smooth'})}));
 const temperature=section.querySelector('#vr-temperature'),output=section.querySelector('#vr-temp-value');
 temperature.addEventListener('input',()=>{const unit=document.createElement('span');unit.textContent='°C';output.replaceChildren(document.createTextNode(temperature.value),unit);temperature.style.setProperty('--fill',((temperature.value-40)/60*100)+'%')});
 temperature.style.setProperty('--fill','66.67%');render();
})();
