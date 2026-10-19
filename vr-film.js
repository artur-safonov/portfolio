'use strict';
(()=>{
 const visual=document.querySelector('.vr-experience'),image=visual?.querySelector('.vr-hmd-film');if(!image)return;
 const count=60,frames=[];let desired=0,started=false;
 const url=n=>`assets/vr-hmd-frames/${String(n).padStart(3,'0')}.webp`;
 function paint(){let best=-1;for(let i=0;i<count;i++)if(frames[i]?.complete&&frames[i].naturalWidth&&(best<0||Math.abs(i-desired)<Math.abs(best-desired)))best=i;if(best>=0&&image.getAttribute('src')!==url(best))image.src=url(best)}
 visual.addEventListener('hmdprogress',e=>{desired=Math.round(e.detail*(count-1));paint()});
 const order=[0,59,30,15,45,...Array.from({length:count},(_,i)=>i)].filter((n,i,a)=>a.indexOf(n)===i);
 async function worker(){while(order.length){const n=order.shift(),im=new Image();frames[n]=im;await new Promise(r=>{im.onload=()=>{paint();r()};im.onerror=r;im.src=url(n)})}}
 const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)&&!started){started=true;io.disconnect();for(let i=0;i<3;i++)worker()}},{rootMargin:'800px'});io.observe(visual);
})();
