// Right-edge section rail. Markup: nav.section-rail > a[href="#id"] > span.rail-label
(()=>{
  const rail=document.querySelector('.section-rail');
  if(!rail)return;
  const MINOR=3;
  const items=[...rail.querySelectorAll('a[href^="#"]')]
    .map(a=>({a,el:document.getElementById(a.hash.slice(1))}))
    .filter(item=>item.el);
  items.forEach((item,i)=>{
    if(i===items.length-1)return;
    const minor=document.createElement('span');
    minor.className='rail-minor';
    minor.setAttribute('aria-hidden','true');
    minor.innerHTML='<i></i>'.repeat(MINOR);
    item.a.after(minor);
    item.ticks=[...minor.children];
  });
  let queued=false;
  let chosen=-1;
  items.forEach((item,i)=>item.a.addEventListener('click',()=>{chosen=i;request()}));
  const release=()=>{if(chosen>=0){chosen=-1;request()}};
  ['wheel','touchstart','keydown'].forEach(type=>addEventListener(type,release,{passive:true}));
  const update=()=>{
    queued=false;
    const line=innerHeight*.45;
    const tops=items.map(item=>item.el.getBoundingClientRect().top);
    let active=0;
    tops.forEach((top,i)=>{if(top<=line)active=i});
    if(scrollY+innerHeight>=document.documentElement.scrollHeight-2)active=items.length-1;
    if(chosen>=0)active=chosen;
    items.forEach((item,i)=>{
      if(i===active)item.a.setAttribute('aria-current','location');
      else item.a.removeAttribute('aria-current');
      item.a.classList.toggle('near',Math.abs(i-active)===1);
      if(!item.ticks)return;
      let progress=i<active?1:0;
      if(i===active){
        const span=tops[i+1]-tops[i];
        progress=span>0?Math.min(1,Math.max(0,(line-tops[i])/span)):0;
      }
      item.ticks.forEach((tick,t)=>tick.classList.toggle('lit',progress>(t+.5)/MINOR));
    });
  };
  const request=()=>{if(!queued){queued=true;requestAnimationFrame(update)}};
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request);
  addEventListener('load',request);
  update();
})();
