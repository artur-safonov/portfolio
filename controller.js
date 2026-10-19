'use strict';
(() => {
 const section=document.querySelector('.rc-section');
 if(!section)return;
 const runway=section.querySelector('.rc-scroll'), stage=section.querySelector('.rc-stage');
 const steps=[...section.querySelectorAll('.rc-step')];
 const chapters=[
  ['01 / THE DISPLAY MODULE','One module.<br>All the control.','The 4-inch Guition unit combines the touchscreen, display and ESP32-S3. They stay together in the build, running the ESPHome interface for lights, devices and music.','Guition ESP32-S3-4848S040 · 480 × 480'],
  ['02 / STORED ENERGY','A battery.<br>A little freedom.','Behind the display sits a LiPo 505573 cell and a HXYP-1S-30T8 protection board. The display’s own IP5306 handles charging and power conversion; v0.8 needs no separate UPS board.','LiPo 3.7 V / 3000 mAh → 1S BMS → display BAT'],
  ['03 / THE PRINTED ENCLOSURE','Made to fit.<br>Layer by layer.','A custom printed enclosure holds the display, battery and protection board. Its rear lid carries four rectangular magnets. The layout follows measured parts and the v0.8 CAD.','PETG / ASA · 89.6 × 89.6 × 20.1 mm'],
  ['04 / THE MAGNETIC DOCK','On the wall.<br>Off in a moment.','Two printed wall rails hold steel washers that meet the magnets in the rear lid. The controller can come away from its wall mount while keeping its battery and electronics together.','Printed wall dock · magnetic rear lid']
 ];
 const count=section.querySelector('.rc-counter'),title=section.querySelector('.rc-copy h3'),body=section.querySelector('.rc-description'),detail=section.querySelector('.rc-detail');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let active=-1,pending=false,manual=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function chapter(index){
  if(index===active)return;
  active=index;const c=chapters[index];count.textContent=c[0];title.innerHTML=c[1];body.textContent=c[2];detail.textContent=c[3];
  steps.forEach((step,i)=>step.setAttribute('aria-pressed',String(i===index)));
 }
 function render(){
  pending=false;
  const still=motion.matches||document.documentElement.classList.contains('paused');
  section.classList.toggle('rc-static',still);
  const rect=runway.getBoundingClientRect();
  const progress=still?manual:clamp(-rect.top/Math.max(1,runway.offsetHeight-innerHeight));
  const expansion=still?1:clamp((progress-.08)/.65);
  const smooth=expansion*expansion*(3-2*expansion);
  stage.style.setProperty('--travel',Math.max(.8,Math.min(1.4,stage.clientHeight/730)).toFixed(3));
  stage.style.setProperty('--spread',smooth.toFixed(4));
  stage.style.setProperty('--turn',(-10-21*smooth)+'deg');
  stage.style.setProperty('--pitch',(8+27*smooth)+'deg');
  stage.style.setProperty('--label-opacity',clamp((smooth-.5)*2).toFixed(3));
  stage.dispatchEvent(new CustomEvent('controllerprogress',{detail:progress}));
  chapter(Math.min(3,Math.floor(progress*4)));
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(render)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request);motion.addEventListener('change',request);
 new MutationObserver(request).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 steps.forEach((step,i)=>step.addEventListener('click',()=>{
  manual=(i+.35)/4;
  if(section.classList.contains('rc-static'))render();
  else {const y=scrollY+runway.getBoundingClientRect().top+manual*(runway.offsetHeight-innerHeight);scrollTo({top:y,behavior:'smooth'})}
 }));
 render();
})();
