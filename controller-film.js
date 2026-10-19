'use strict';
(()=>{
 const stage=document.querySelector('.rc-stage'),image=stage?.querySelector('.rc-film');if(!image)return;
 const frames=[],count=48;let desired=0,started=false,active=0,bounds=null,current=0;
 const names=['01 / DISPLAY + ESP32','02 / LiPo + PROTECTION BOARD','03 / PRINTED REAR LID','04 / MAGNETS + WALL DOCK'];
 const focus=document.createElement('div');focus.className='rc-part-focus';focus.setAttribute('aria-hidden','true');
 const label=document.createElement('span');focus.append(label);stage.append(focus);
 const url=n=>`assets/rc-frames-v2/${String(n).padStart(3,'0')}.webp?v=4`;
 function highlight(){
  const b=bounds?.[current]?.bounds?.[active];if(!b)return;
  const frame=image.getBoundingClientRect(),parent=stage.getBoundingClientRect(),scale=Math.min(frame.width/1000,frame.height/1200);
  const width=1000*scale,height=1200*scale,x=frame.left-parent.left+(frame.width-width)/2+b[0]*width,y=frame.top-parent.top+(frame.height-height)/2+b[1]*height;
  focus.style.left=(x-7)+'px';focus.style.top=(y-7)+'px';focus.style.width=(b[2]*width+14)+'px';focus.style.height=(b[3]*height+14)+'px';
  focus.classList.add('is-ready');label.textContent=names[active];
 }
 function paint(){let best=-1;for(let i=0;i<count;i++)if(frames[i]?.complete&&frames[i].naturalWidth&&(best<0||Math.abs(i-desired)<Math.abs(best-desired)))best=i;if(best>=0){current=best;if(image.getAttribute('src')!==url(best))image.src=url(best);highlight()}}
 stage.addEventListener('controllerprogress',event=>{desired=Math.round(event.detail*(count-1));active=Math.min(3,Math.floor(event.detail*4));paint()});
 addEventListener('resize',highlight);
 fetch('assets/rc-frames-v2/bounds.json').then(r=>r.ok?r.json():null).then(data=>{bounds=data;highlight()}).catch(()=>{});
 const order=[0,47,12,24,36,...Array.from({length:count},(_,i)=>i)].filter((n,i,a)=>a.indexOf(n)===i);
 async function worker(){while(order.length){const n=order.shift(),im=new Image();frames[n]=im;await new Promise(resolve=>{im.onload=()=>{paint();resolve()};im.onerror=resolve;im.src=url(n)})}}
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&!started){started=true;observer.disconnect();for(let n=0;n<3;n++)worker()}},{rootMargin:'600px'});observer.observe(stage);
})();
