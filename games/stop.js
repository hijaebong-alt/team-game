/* 멈추기 게임: 폭탄의 카운트다운이 5초에서 사라지고, 0초(폭발)에 맞춰 멈추는 게임. 진행자 화면에는 폭탄과 폭발 효과가 나옴 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
const TOTAL=10000,HIDE=5000;                 // 전체 카운트다운(ms), 숫자가 사라지는 시점(남은 ms): 10초부터 시작해 5초에서 사라짐
registerGame({
 id:"stop",
 order:5,
 name:"멈추기 게임",
 story:"AI가 폭탄의 카운트다운을 시작했습니다. 숫자가 사라져도 0초가 되는 바로 그 순간에 멈춰야 폭발을 막을 수 있습니다. 눈이 아니라 감각으로 시간을 읽으세요.",
 desc:"진행자 화면의 폭탄이 10초부터 카운트다운을 시작하고, 숫자는 5초에서 사라집니다. 폭탄이 터지는 0초라고 생각될 때 폰의 멈추기 버튼을 누르세요. 0초와의 차이가 작을수록 좋습니다. (오차가 작을수록 좋음)",
 hi:false, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'ms 오차',

 /* ---- 진행자 화면: 폭탄과 폭발 효과 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const PRE=12;                                              // 카운트다운 시작 전 준비(초)
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const t0=NOW()+PRE*1000;
  c.set({t0,total:TOTAL,hide:HIDE});
  const bomb='<svg viewBox="0 0 220 240" width="230" height="250" style="max-width:100%">'
   +'<defs><radialGradient id="sgb" cx="35%" cy="30%"><stop offset="0" stop-color="#666"/><stop offset="1" stop-color="#101010"/></radialGradient></defs>'
   +'<circle id="sgglow" cx="110" cy="150" r="90" fill="#ff2d2d" opacity="0"/>'
   +'<circle cx="110" cy="150" r="76" fill="url(#sgb)" stroke="#333" stroke-width="3"/>'
   +'<ellipse cx="82" cy="118" rx="16" ry="26" fill="#ffffff22" transform="rotate(25 82 118)"/>'
   +'<rect x="94" y="64" width="32" height="22" rx="4" fill="#666"/>'
   +'<path id="sgfz" d="M110 66 Q118 30 160 24" fill="none" stroke="#c9a66b" stroke-width="6" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100"/>'
   +'<g id="sgsp"><circle r="11" fill="#ff9f1a"/><circle r="6" fill="#fff4b0"/></g>'
   +'<text id="sgtm" x="110" y="166" text-anchor="middle" font-size="44" font-family="monospace" font-weight="700" fill="#ff5252">10.00</text></svg>';
  c.el.innerHTML='<style>@keyframes sgPop{0%{transform:translate(-50%,-50%) scale(.1);opacity:1}55%{transform:translate(-50%,-50%) scale(1.7);opacity:1}100%{transform:translate(-50%,-50%) scale(2.3);opacity:0}}'
   +'@keyframes sgFlash{0%{opacity:.95}100%{opacity:0}}'
   +'@keyframes sgShake{0%,100%{transform:translate(0,0)}20%{transform:translate(-14px,8px)}40%{transform:translate(12px,-10px)}60%{transform:translate(-10px,-6px)}80%{transform:translate(8px,10px)}}'
   +'@keyframes sgFly{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.4);opacity:0}}</style>'
   +'<div style="text-align:center"><div id="sgstg" style="position:relative;height:330px;border-radius:16px;overflow:hidden;background:radial-gradient(circle at 50% 40%,#2a3b8f,#0b1230)">'
   +'<div id="sgbw" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">'+bomb+'</div>'
   +'<div id="sgfx" style="position:absolute;inset:0;pointer-events:none"></div></div>'
   +'<p class="big" id="sgmsg" style="margin:8px 0 0"></p><div id="sgtb" style="text-align:left;margin-top:10px"></div></div>';
  const q=s=>c.el.querySelector(s);
  const msg=t=>{const e=q('#sgmsg');if(e&&e.textContent!==t)e.textContent=t};
  /* 소리 */
  let ac=window.__wac;if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  try{ac&&ac.resume()}catch(e){}
  const beep=f=>{if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.12;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.07)}catch(e){}};
  const boom=()=>{if(!ac)return;try{const len=ac.sampleRate*1.3,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
    const s=ac.createBufferSource();s.buffer=buf;const g=ac.createGain();g.gain.value=.7;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;
    s.connect(f);f.connect(g);g.connect(ac.destination);s.start()}catch(e){}};
  /* 팀별 결과 막대 */
  const errs=Array.from({length:c.n},()=>[]);let exploded=false;
  const bars=()=>{
   const avg=errs.map(a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null);
   const best=exploded?avg.reduce((b,v,t)=>v!=null&&(b<0||v<avg[b])?t:b,-1):-1;
   const e=q('#sgtb');if(!e)return;
   e.innerHTML=errs.map((a,t)=>'<div style="margin:6px 0"><b style="color:'+COL[t]+'">'+TN[t]+'</b> <span class="mu">'+a.length+'/'+size[t]+'명 제출'
     +(exploded&&avg[t]!=null?' · 평균 오차 '+Math.round(avg[t])+'ms':'')+(t===best?' 👑':'')+'</span>'
     +'<div style="height:12px;background:var(--bd);border-radius:6px"><div style="height:100%;width:'+(exploded&&avg[t]!=null?Math.max(4,100-avg[t]/30):(size[t]?a.length/size[t]*100:0))+'%;background:'+COL[t]+';border-radius:6px;transition:width .5s"></div></div></div>').join('');
  };
  bars();
  c.onResults(rs=>{for(let t=0;t<c.n;t++)errs[t]=rs.filter(r=>r.team===t&&typeof r.v==='number').map(r=>r.v);bars()});
  /* 폭발 */
  const explode=()=>{
   exploded=true;q('#sgbw').style.display='none';
   const fx=q('#sgfx');let p='';
   for(let i=0;i<22;i++){const a=Math.random()*Math.PI*2,d=90+Math.random()*130,em=['🔥','💥','✨','⚡'][i%4];
    p+='<span style="position:absolute;left:50%;top:50%;font-size:'+(22+Math.random()*30)+'px;--dx:'+Math.cos(a)*d+'px;--dy:'+Math.sin(a)*d+'px;animation:sgFly '+(.8+Math.random()*.7)+'s ease-out forwards">'+em+'</span>'}
   fx.innerHTML='<div style="position:absolute;inset:0;background:#fff;animation:sgFlash .9s ease-out forwards"></div>'
    +'<div style="position:absolute;left:50%;top:50%;font-size:150px;line-height:1;animation:sgPop 1.1s ease-out forwards">💥</div>'+p;
   q('#sgstg').style.animation='sgShake .6s linear';
   boom();msg('💥 쾅! 폭탄이 터졌습니다!');
   c.after(()=>{const f=q('#sgfx');if(f)f.innerHTML='<div style="position:absolute;left:50%;top:60%;transform:translate(-50%,-50%);font-size:84px;opacity:.85">🔥</div><div style="position:absolute;left:50%;top:32%;transform:translate(-50%,-50%);font-size:56px;opacity:.6">💨</div>';msg('0초와 가장 가까웠던 팀은?')},1500);
   bars();
  };
  /* 매 프레임: 카운트다운, 도화선, 떨림 */
  const fz=q('#sgfz'),sp=q('#sgsp'),tm=q('#sgtm'),glow=q('#sgglow'),bw=q('#sgbw');
  const L=fz.getTotalLength?fz.getTotalLength():60;
  let lastSec=-1;
  c.every(()=>{
   if(exploded)return;
   const tt=NOW()-t0,rem=TOTAL-tt,f=Math.max(0,Math.min(1,rem/TOTAL));
   fz.setAttribute('stroke-dasharray',(f*100)+' 100');
   const pt=fz.getPointAtLength(f*L);sp.setAttribute('transform','translate('+pt.x+' '+pt.y+')');
   if(tt<0){tm.textContent='10.00';msg('폭탄 설치 중… '+Math.ceil(-tt/1000)+'초 뒤 카운트다운 시작');return}
   if(rem<=0){explode();return}
   tm.textContent=rem>HIDE?(rem/1000).toFixed(2):(Math.floor(Date.now()/350)%2?'??.??':'');
   msg('0초에 맞춰 멈추세요!'+(rem>HIDE?'':' (숫자가 사라졌어요)'));
   const danger=1-f,j=danger*danger*7;
   bw.style.transform='translate(calc(-50% + '+((Math.random()-.5)*j)+'px),calc(-50% + '+((Math.random()-.5)*j)+'px))';
   glow.setAttribute('opacity',rem<3000?String(.15+.2*Math.abs(Math.sin(Date.now()/160))):'0');
   const sec=Math.ceil(rem/1000);if(sec!==lastSec){lastSec=sec;beep(sec<=3?1100:700)}
  },16);
 },

 /* ---- 참가자 화면: 0초에 맞춰 멈추기 ---- */
 run(c){
  c.ready(()=>{
   let g=null,done=false,mode='',tl0=0;
   c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">진행자 화면의 폭탄을 보세요!</p><p class="big" id="tl">…</p>'
    +'<button class="p" id="pad" style="width:100%;height:150px;font-size:30px;margin-top:10px">멈추기</button>';
   c.watch(gg=>{g=gg});
   const T=(id,t)=>{const e=$(id);if(e&&e.textContent!==t)e.textContent=t};
   const send=err=>{if(done)return;done=true;c.stop();c.submit(Math.round(err))};
   c.after(()=>{if(!(g&&g.t0)&&!mode){mode='local';tl0=performance.now();T('#st','10초 카운트다운 (5초에서 사라져요)')}},2500);   // 진행자 연동이 없으면 개인 타이머로
   c.every(()=>{
    if(done)return;
    if(!mode&&g&&g.t0)mode='sync';
    if(mode==='sync'){
     const tt=NOW()-g.t0,rem=g.total-tt;
     if(tt<0){T('#tl',Math.ceil(-tt/1000)+'초 뒤');T('#st','곧 카운트다운! 진행자 화면의 폭탄을 보세요');return}
     T('#st','0초(폭발)에 맞춰 멈추기!');
     T('#tl',rem>g.hide?(rem/1000).toFixed(2):'?');
     if(rem<-6000)send(6000);                                   // 끝까지 안 누르면 최대 오차
    }else if(mode==='local'){
     const rem=TOTAL-(performance.now()-tl0);T('#tl',rem>HIDE?(rem/1000).toFixed(2):'?');
     if(rem<-6000)send(6000);
    }
   },30);
   $('#pad').onpointerdown=e=>{
    e.preventDefault();
    if(mode==='sync'){const tt=NOW()-g.t0;if(tt<0)return;send(Math.abs(g.total-tt))}
    else if(mode==='local')send(Math.abs(TOTAL-(performance.now()-tl0)));
   };
  });
 }
});
})();
