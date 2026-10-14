'use strict';
document.documentElement.classList.add('js');
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches;
document.documentElement.classList.toggle('paused',paused);
const motionButton=$('#motion-toggle');
function updateMotion(){motionButton.setAttribute('aria-pressed',String(paused));motionButton.innerHTML=paused?'Resume motion <span>▷</span>':'Pause motion <span>Ⅱ</span>';document.documentElement.classList.toggle('paused',paused)}
updateMotion();motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();drawBulb(performance.now())});
reduced.addEventListener('change',e=>{paused=e.matches;updateMotion()});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.07});
$$('.reveal').forEach(el=>observer.observe(el));
let scrollTick=false;
addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';scrollTick=false})},{passive:true});

// A projected point sculpture. No model files, tracking or remote renderer.
const canvas=$('#bulb'),ctx=canvas.getContext('2d');
let cw=0,ch=0,dpr=1,hue=264,brightness=.85,lightOn=true,rot=.15,targetRot=.15,tilt=-.13,targetTilt=-.13,phase=0,lastTime=0,visible=true;
let bulbPoints=[];
for(let j=0;j<58;j++){
 const v=j/57, y=-1.08+v*1.77;
 // round glass globe tapering into the neck
 const shoulder=.76*Math.sin(2.55);
 let r=v<.62?.76*Math.sin(v/.62*2.55):shoulder-(shoulder-.15)*Math.sin((v-.62)/.38*Math.PI/2);
 if(v<.015)r=.015;
 for(let k=0;k<70;k++){let a=k/70*Math.PI*2;bulbPoints.push({x:Math.cos(a)*r,y,z:Math.sin(a)*r,bright:(j%6===0||k%10===0),size:(k%10===0?1.2:.7)})}
}
const ringPoints=[];
for(let ring=0;ring<3;ring++){let ar=[];for(let k=0;k<=160;k++){let a=k/160*Math.PI*2;ar.push({x:Math.cos(a)*(1.42+ring*.21),y:Math.sin(a)*(.32+ring*.09),z:Math.sin(a)*(1.3+ring*.13)})}ringPoints.push(ar)}
const resize=()=>{const box=canvas.getBoundingClientRect();cw=box.width;ch=box.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);drawBulb(performance.now())};
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:0}).observe(canvas);
$('#hero-art').addEventListener('pointermove',e=>{let r=canvas.getBoundingClientRect();targetRot=((e.clientX-r.left)/r.width-.5)*1.25;targetTilt=((e.clientY-r.top)/r.height-.5)*.3-.13});
$('#hero-art').addEventListener('pointerleave',()=>{targetRot=.15;targetTilt=-.13});
function project(p,rotation=rot){let x=p.x*Math.cos(rotation)+p.z*Math.sin(rotation),z=-p.x*Math.sin(rotation)+p.z*Math.cos(rotation),y=p.y*Math.cos(tilt)-z*Math.sin(tilt);z=p.y*Math.sin(tilt)+z*Math.cos(tilt);let perspective=4.8/(4.8+z);const scale=Math.min(cw*.235,ch*.22);return{x:cw*.51+x*scale*perspective,y:ch*.46+y*scale*perspective,z,s:perspective}}
function line3(points,color,width=1){ctx.beginPath();points.forEach((p,i)=>{const q=project(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function drawBulb(time){
 if(!cw||!ch)return;
 const delta=lastTime?Math.min(time-lastTime,50):16;lastTime=time;
 if(!paused){phase+=delta*.00035;rot+=(targetRot-rot)*.045;tilt+=(targetTilt-tilt)*.045}
 ctx.clearRect(0,0,cw,ch);
 const strength=lightOn?brightness:.08,scale=Math.min(cw*.235,ch*.22),center=project({x:0,y:-.2,z:0});
 const halo=ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,scale*2.1);
 halo.addColorStop(0,'hsla('+hue+',75%,70%,'+(.22*strength)+')');halo.addColorStop(.45,'hsla('+hue+',60%,48%,'+(.08*strength)+')');halo.addColorStop(1,'hsla('+hue+',70%,40%,0)');
 ctx.fillStyle=halo;ctx.fillRect(0,0,cw,ch);
 // faint architectural marks
 ctx.strokeStyle='#9682b522';ctx.lineWidth=.7;
 for(const [x,y] of [[cw*.15,ch*.26],[cw*.88,ch*.69]]){ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x+5,y);ctx.moveTo(x,y-5);ctx.lineTo(x,y+5);ctx.stroke()}
 ringPoints.forEach((ring,i)=>{
  const transformed=ring.map(p=>({x:p.x,y:p.y+(.14*i),z:p.z}));
  line3(transformed,'hsla('+hue+',40%,70%,'+(.10+strength*.09)+')',.7);
  const a=phase*(.5+i*.1)+i*2.1;
  const node=project({x:Math.cos(a)*(1.42+i*.21),y:Math.sin(a)*(.32+i*.09)+i*.14,z:Math.sin(a)*(1.3+i*.13)});
  ctx.beginPath();ctx.arc(node.x,node.y,2.7,0,Math.PI*2);ctx.fillStyle='hsla('+(hue+i*35)+',80%,80%,.9)';ctx.shadowColor='hsl('+hue+',90%,75%)';ctx.shadowBlur=12*strength;ctx.fill();ctx.shadowBlur=0;
 });
 // a glass silhouette, then its projected lattice
 const sorted=bulbPoints.map(p=>({...project(p,rot+Math.sin(phase*.3)*.15),bright:p.bright,size:p.size})).sort((a,b)=>b.z-a.z);
 for(const p of sorted){const a=(p.z<0?.56:.13)*(p.bright?1:.45)*(lightOn?.5+strength:.3);ctx.fillStyle='hsla('+hue+',50%,'+(p.bright?82:70)+'%,'+a+')';ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.s,0,Math.PI*2);ctx.fill()}
 // core made of two electric paths
 for(let n=0;n<2;n++){const points=[];for(let i=0;i<=100;i++){let t=i/100;points.push({x:Math.sin(t*Math.PI*6+n*Math.PI)*.16,y:.48-t*.72,z:Math.cos(t*Math.PI*6+n*Math.PI)*.16})}ctx.shadowColor='hsl('+hue+',90%,75%)';ctx.shadowBlur=12*strength;line3(points,'hsla('+hue+',70%,87%,'+(.2+strength*.7)+')',1.4);ctx.shadowBlur=0}
 // screw threads
 for(let j=0;j<8;j++){const points=[];for(let i=0;i<=50;i++){let a=i/50*Math.PI*2;points.push({x:Math.cos(a)*(.18-j*.006),y:.66+j*.055,z:Math.sin(a)*(.18-j*.006)})}line3(points,'hsla('+hue+',20%,70%,'+(j%2?.45:.25)+')',2)}
 const base=project({x:0,y:1.12,z:0});ctx.fillStyle='#9e8cb4';ctx.beginPath();ctx.ellipse(base.x,base.y,scale*.08,scale*.026,0,0,Math.PI*2);ctx.fill();
 // a deliberately restrained orbit annotation
 const cursor=project({x:1.52,y:-.45,z:0});ctx.fillStyle='#91879f';ctx.font='8px Consolas,monospace';ctx.fillText(lightOn?'LIGHT / ON':'LIGHT / OFF',cursor.x-22,cursor.y);
}
function frame(t){if(visible&&!document.hidden&&!paused)drawBulb(t);requestAnimationFrame(frame)}requestAnimationFrame(frame);
function setHue(h){hue=Number(h);const swatch=$('[data-hue="'+h+'"]');$$('.swatch').forEach(b=>{const active=b===swatch;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});document.documentElement.style.setProperty('--accent','hsl('+h+',75%,78%)');drawBulb(performance.now())}
$$('.swatch').forEach(b=>b.addEventListener('click',()=>setHue(b.dataset.hue)));
$('#brightness').addEventListener('input',e=>{brightness=e.target.value/100;$('#brightness-value').textContent=e.target.value+'%';drawBulb(performance.now())});
$('#light-power').addEventListener('click',()=>{lightOn=!lightOn;$('#light-power').setAttribute('aria-pressed',String(lightOn));drawBulb(performance.now())});

// The home lab: intentionally a self-contained demonstration.
const scenes={
 focus:{color:'#b39afa',name:'FOCUS MODE',media:'Display ready · sound off',state:'STANDBY',log:'scene.focus → desk lighting · quiet mode'},
 cinema:{color:'#7484f7',name:'CINEMA MODE',media:'TV scene · surround ambience',state:'PLAYING',log:'scene.cinema → dim lights · TV · audio'},
 evening:{color:'#edb17a',name:'EVENING MODE',media:'Warm lights · relaxed listening',state:'AMBIENT',log:'scene.evening → warm light · gentle audio'}
};
let scene='focus',roomOn=true;
function setScene(name){scene=name;const s=scenes[name];$('.home-lab').style.setProperty('--scene-color',s.color);$('.room-mode').textContent=s.name;$('#media-label').textContent=s.media;$('#media-state').textContent=s.state;$('#room-log').textContent=s.log;$$('[data-scene]').forEach(b=>{const active=b.dataset.scene===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});$('.room-tv').style.opacity=name==='evening'?.22:1;$('.speaker-ring').style.opacity=name==='focus'?.25:1;roomOn=true;setRoomLight()}
function setRoomLight(){$('.room-display').classList.toggle('lights-off',!roomOn);$('#room-power').classList.toggle('on',roomOn);$('#room-power').setAttribute('aria-pressed',String(roomOn));if(!roomOn)$('#room-log').textContent='lights.off → ambient lighting disabled';else $('#room-log').textContent=scenes[scene].log}
$$('[data-scene]').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.scene)));
$('#room-power').addEventListener('click',()=>{roomOn=!roomOn;setRoomLight()});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
$('#voice-run').addEventListener('click',async()=>{
 const b=$('#voice-run'),result=$('#voice-result');b.disabled=true;
 result.textContent='Recognized: “Hey Hina, movie time.”';
 await delay(600);result.textContent='Intent → activate the cinema scene.';
 await delay(650);setScene('cinema');result.textContent='Done. Lights dimmed, TV scene selected, audio ready. Demo complete.';b.disabled=false;
});
const workflows={
 commerce:[['REQUEST','Prepare a marketplace product feed.'],['FETCH','Load the sample product catalog.'],['CHECK','Validate price, stock and required fields.'],['TRANSFORM','Map product fields into marketplace XML.'],['REVIEW','Flag incomplete entries for a human.'],['DONE','Draft feed prepared. Ready for review.']],
 vision:[['REQUEST','Review a generated image set.'],['LOAD','Read the sample image batch.'],['INSPECT','Check consistency and visible artifacts.'],['RANK','Compare candidates against the brief.'],['SELECT','Prepare a shortlist for manual review.'],['DONE','Shortlist prepared. The final choice is human.']],
 home:[['REQUEST','Start an evening routine.'],['INTENT','Map the request to a home scene.'],['CHECK','Resolve the sample lights and media devices.'],['EXECUTE','Apply warm lighting and a quiet media scene.'],['VERIFY','Read the simulated state changes.'],['DONE','Evening scene ready. Demo complete.']]
};
let agent='commerce',agentRunning=false;
$$('[data-agent]').forEach(b=>b.addEventListener('click',()=>{if(agentRunning)return;agent=b.dataset.agent;$$('[data-agent]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});$('#agent-output').replaceChildren();const p=document.createElement('p');p.textContent='→ '+workflows[agent][0][1];$('#agent-output').append(p);$('#agent-badge').textContent='READY'}));
$('#agent-run').addEventListener('click',async()=>{
 if(agentRunning)return;agentRunning=true;$('#agent-run').disabled=true;$$('[data-agent]').forEach(b=>b.disabled=true);$('#agent-badge').textContent='RUNNING';const out=$('#agent-output');out.replaceChildren();
 for(let i=0;i<workflows[agent].length;i++){
  if(i)await delay(reduced.matches?80:550);
  const [type,message]=workflows[agent][i];const p=document.createElement('p');const index=document.createElement('span');index.className='log-time';index.textContent=String(i+1).padStart(2,'0')+' / '+type.toLowerCase();p.append(index,document.createTextNode(' '+message));if(type==='DONE')p.className='log-done';out.append(p);out.scrollTop=out.scrollHeight;
 }
 if(agent==='home')setScene('evening');$('#agent-badge').textContent='COMPLETE';$('#agent-run').disabled=false;$$('[data-agent]').forEach(b=>b.disabled=false);agentRunning=false;
});

// Pinned projects and source links.
const projects={
 spotify:{category:'HOME ASSISTANT APP / PYTHON',title:'Routine Spotify Bridge',description:'A Home Assistant app that brings Spotify to ESPHome wall displays. Released as MIT-licensed source.',architecture:['ESPHome display','Home Assistant app','Spotify'],features:['Search Spotify from the display.','Browse the library.','Control playback.','Switch Spotify Connect devices.'],url:'https://github.com/artur-safonov/routine-spotify-bridge'},
 esp:{category:'ESPHOME DISPLAY / C++',title:'ESPHome Guition ESP32-S3-4848S040',description:'A Home Assistant display for the Guition ESP32-S3-4848S040 with the Routine Controller UI. Forked from PrayerfulDrop/ESPHome-Guition-ESP32-S3-4848S040.',architecture:['One YAML file','ESPHome firmware','Home Assistant'],features:['Lights page.','Devices page.','Music page.','All pages configured from a single YAML file.'],url:'https://github.com/artur-safonov/ESPHome-Guition-ESP32-S3-4848S040'},
 govee:{category:'HOME ASSISTANT ADD-ON / PYTHON',title:'Govee Music Bridge',description:'A Home Assistant add-on that keeps Govee H6076 lamps reacting to music while holding the colour you choose.',architecture:['Home Assistant','Add-on','Bluetooth LE lamps'],features:['Keeps lamps in beat-reactive music mode.','Holds a fixed colour.','Uses Music DreamView.','Talks to the lamps over Bluetooth LE.'],url:'https://github.com/artur-safonov/govee-music-bridge'},
 comfy:{category:'COMFYUI NODES / PYTHON',title:'ComfyUI Character Tag Tools',description:'Custom ComfyUI nodes for character workflows.',architecture:['Character tags','ComfyUI nodes','Images & captions'],features:['Character identity tags.','Image and caption downloads.','Experimental Anima diagnostics.'],url:'https://github.com/artur-safonov/ComfyUI-Character-Tag-Tools'},
 bridge:{category:'SIGNALRGB ADDON / QML',title:'Yeelight Bridge',description:'An addon that connects Yeelight smart bulbs to SignalRGB through a local bridge. It extends PC lighting into the room without treating every bulb as a separate manual task.',architecture:['SignalRGB','Bridge addon','Room lighting'],features:['Add or remove bulbs through the addon UI.','Keep device state synchronized with the bridge server.','Optimize color updates to avoid unnecessary requests.','Reconnect when the bridge server restarts.'],url:'https://github.com/artur-safonov/yeelight-bridge'},
 server:{category:'LOCAL BRIDGE / JAVASCRIPT',title:'Yeelight Bridge Server',description:'The local Node.js service behind the addon. It handles the connection to the bulbs, keeps the device list persistent, and exposes the control endpoints used by SignalRGB.',architecture:['Addon','Node.js bridge','Yeelight LAN'],features:['Local endpoints for device management and color updates.','Persistent devices across server restarts.','Automatic reconnection.','Optional Windows service for startup.'],url:'https://github.com/artur-safonov/yeelight-bridge-server'}
};
const dialog=$('#project-dialog');
$$('[data-project]').forEach(b=>b.addEventListener('click',()=>{const p=projects[b.dataset.project];$('#dialog-category').textContent=p.category;$('#dialog-title').textContent=p.title;$('#dialog-description').textContent=p.description;$('#dialog-architecture').replaceChildren();p.architecture.forEach((part,i)=>{if(i){const arrow=document.createElement('i');arrow.textContent='→';$('#dialog-architecture').append(arrow)}const s=document.createElement('span');s.textContent=part;$('#dialog-architecture').append(s)});$('#dialog-features').replaceChildren(...p.features.map(f=>{const li=document.createElement('li');li.textContent=f;return li}));$('#dialog-link').href=p.url;dialog.showModal()}));
$('.dialog-close').addEventListener('click',()=>dialog.close());
function closeOnBackdrop(d){d.addEventListener('click',e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close()})}
closeOnBackdrop(dialog);
// Keep focus areas intentionally explorable; multiple can stay open.

// Inspectable chart, based on the same dated snapshot as the profile.
const years=[2017,2018,2019,2020,2021,2022,2023,2024,2025,2026],values=[13,0,19,7,71,5,96,77,104,315];
const points=values.map((v,i)=>({x:35+i*64,y:255-v/315*205}));
const chart=$('#history-chart');const ns='http://www.w3.org/2000/svg';
const svg=(tag,attrs={},text)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text!==undefined)n.textContent=text;return n};
const defs=svg('defs');
const fill=svg('linearGradient',{id:'chart-fill',x1:0,y1:0,x2:0,y2:1});fill.append(svg('stop',{offset:0,'stop-color':'#bca4ff','stop-opacity':.22}),svg('stop',{offset:1,'stop-color':'#bca4ff','stop-opacity':0}));defs.append(fill);chart.append(defs);
[0,100,200,300].forEach(v=>{let y=255-v/315*205;chart.append(svg('line',{x1:35,y1:y,x2:611,y2:y,stroke:'#ffffff10','stroke-dasharray':'3 7'}));chart.append(svg('text',{x:5,y:y+4,fill:'#9990ac','font-size':8},v))});
const linePath='M'+points.map(p=>p.x+','+p.y).join(' L');
const area=svg('path',{d:linePath+' L611,255 L35,255 Z',fill:'url(#chart-fill)'});chart.append(area);
chart.append(svg('path',{d:linePath,fill:'none',stroke:'#554964','stroke-width':1.5}));
const progressPath=svg('path',{d:linePath,fill:'none',stroke:'#c3adff','stroke-width':2.5,'stroke-linecap':'round'});chart.append(progressPath);
const crosshair=svg('line',{x1:611,y1:42,x2:611,y2:258,stroke:'#c3adff60','stroke-dasharray':'3 5'});chart.append(crosshair);
points.forEach((p,i)=>{
 const g=svg('g',{'data-year-index':i,role:'button',tabindex:0,'aria-label':years[i]+': '+values[i]+' contributions',style:'cursor:pointer'});
 g.append(svg('rect',{x:p.x-22,y:20,width:44,height:275,fill:'transparent'}),svg('circle',{cx:p.x,cy:p.y,r:3.5,fill:'#17131f',stroke:'#bca4ff','stroke-width':1.5}));
 g.append(svg('text',{x:p.x,y:283,fill:'#aaa1b7','font-size':9,'text-anchor':'middle'},String(years[i]).slice(2)));
 const select=()=>{cancelAnimationFrame(replayFrame);replaying=false;selectYear(i)};g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=Math.max(0,Math.min(9,i+(e.key==='ArrowRight'?1:-1)));selectYear(next);$('[data-year-index="'+next+'"]',chart).focus()}});chart.append(g)
});
const rocket=svg('g',{'aria-hidden':true,'pointer-events':'none'});rocket.innerHTML='<ellipse cx="-20" cy="0" rx="10" ry="4" fill="#eec287" opacity=".75"/><path d="M-12-6-17-12-5-6M-12 6-17 12-5 6" fill="#b69cf5"/><path d="M16 0C8-9-3-8-12-6V6C-3 8 8 9 16 0" fill="#efedf6"/><path d="M16 0 7-6 7 6Z" fill="#b69cf5"/><circle r="3.2" fill="#322844"/>';chart.append(rocket);
let replayFrame=0,replaying=false;
function selectYear(i){$('#timeline').value=i;$('#year-value').textContent=values[i];$('#year-label').textContent=years[i];$('#timeline-year').textContent=years[i];crosshair.setAttribute('x1',points[i].x);crosshair.setAttribute('x2',points[i].x);crosshair.setAttribute('y1',points[i].y);progressPath.setAttribute('d','M'+points.slice(0,i+1).map(p=>p.x+','+p.y).join(' L'));let p=points[i],prev=points[Math.max(0,i-1)];let angle=i?Math.atan2(p.y-prev.y,p.x-prev.x)*180/Math.PI:-25;rocket.setAttribute('transform','translate('+p.x+','+(p.y-23)+') rotate('+angle+')');$$('[data-year-index]',chart).forEach(g=>{g.setAttribute('aria-pressed',String(Number(g.dataset.yearIndex)===i));$('text',g).setAttribute('fill',Number(g.dataset.yearIndex)===i?'#e0d0ff':'#aaa1b7')})}
selectYear(9);
$('#timeline').addEventListener('input',e=>{cancelAnimationFrame(replayFrame);replaying=false;selectYear(Number(e.target.value))});
$('#replay').addEventListener('click',()=>{
 cancelAnimationFrame(replayFrame);if(paused){selectYear(9);return}replaying=true;const start=performance.now();function tick(t){const f=Math.min(9,(t-start)/320);const index=Math.floor(f);selectYear(index);if(index<9){const a=points[index],b=points[index+1],fraction=f-index;rocket.setAttribute('transform','translate('+(a.x+(b.x-a.x)*fraction)+','+(a.y+(b.y-a.y)*fraction-23)+') rotate('+(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI)+')');progressPath.setAttribute('d','M'+points.slice(0,index+1).map(p=>p.x+','+p.y).join(' L')+' L'+(a.x+(b.x-a.x)*fraction)+','+(a.y+(b.y-a.y)*fraction));replayFrame=requestAnimationFrame(tick)}else replaying=false}replayFrame=requestAnimationFrame(tick)
});

// Useful navigation rather than a pretend terminal.
const command=$('#command-dialog'),search=$('#command-search');
const destinations=[['Selected work','Six pinned projects','#work'],['Playground','Try the connected room and an agent','#playground'],['About / focus areas','Explore what I work on','#about'],['GitHub trajectory','Inspect the contribution timeline','#activity'],['Connect','GitHub, LinkedIn, Telegram and Hugging Face','#connect'],['Back to the light','Return to the sculpture','#top']];
function commandResults(){const query=search.value.toLowerCase();const dest=destinations.filter(d=>d.join(' ').toLowerCase().includes(query));$('#command-results').replaceChildren(...dest.map(([title,desc,href])=>{const b=document.createElement('button');const label=document.createElement('span');label.textContent=title;const arrow=document.createElement('span');arrow.textContent='↗';b.title=desc;b.append(label,arrow);b.addEventListener('click',()=>{command.close();const target=$(href);target.scrollIntoView({behavior:paused?'instant':'smooth'});target.setAttribute('tabindex','-1');target.focus({preventScroll:true})});return b}));if(!dest.length){const p=document.createElement('p');p.textContent='No matching section. Try “work”, “home” or “GitHub”.';$('#command-results').append(p)}}
function openCommand(){commandResults();command.showModal();search.focus()}
$('.command-open').addEventListener('click',openCommand);$('.command-close').addEventListener('click',()=>command.close());search.addEventListener('input',commandResults);search.addEventListener('keydown',e=>{if(e.key==='Enter')$('#command-results button')?.click()});closeOnBackdrop(command);
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();command.open?command.close():openCommand()}});

