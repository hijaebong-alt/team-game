/* 환영하기: 진행자 화면의 박자에 맞춰 스마트폰을 크게 좌우로 흔들어 진행자를 환영하는 게임 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
registerGame({
 id:'welcome',
 order:0.5,                    // 숫자가 작을수록 목록 앞쪽 (이 게임이 맨 앞)
 name:'환영하기',
 desc:'진행자 화면의 손이 좌우로 움직이는 박자에 맞춰, 스마트폰을 세로로 잡고 크게 좌우로 흔드세요. 손이 맨 끝에 닿는 순간 폰도 한쪽 끝에서 방향이 바뀌게 흔들면 박자가 맞습니다. 박자에 딱 맞으면 2점, 조금 어긋나면 1점입니다. (24박자 · 높을수록 좋음)',
 hi:true,
 fmt:v=>v+'점',

 /* ---- 진행자 화면: 환영 손짓과 박자 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const BPM=84,BEATS=24,PRE=10,T=60000/BPM;     // 박자 속도, 박자 수, 시작 전 준비(초)
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const t0=NOW()+PRE*1000;
  c.set({t0,T,beats:BEATS});
  c.el.innerHTML='<div style="text-align:center">'
   +'<div style="font-size:30px;font-weight:800" id="bn">환영합니다!</div>'
   +'<div style="position:relative;height:230px;overflow:hidden;background:var(--bg);border:1px solid var(--bd);border-radius:16px;margin:8px 0">'
   +'<div id="hd" style="position:absolute;top:40px;left:50%;font-size:130px;line-height:1;transform:translateX(-50%)">👋</div>'
   +'<div style="position:absolute;left:12px;bottom:8px;font-size:26px;color:var(--mu)">◀</div><div style="position:absolute;right:12px;bottom:8px;font-size:26px;color:var(--mu)">▶</div></div>'
   +'<p class="big" id="bc">'+PRE+'</p><div id="tb" style="text-align:left"></div></div>';
  const q=s=>c.el.querySelector(s);
  let ac=window.__wac;if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  try{ac&&ac.resume()}catch(e){}
  const tick=hi=>{if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=hi?880:660;g.gain.value=.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.08)}catch(e){}};
  const avg=[],cnt=[];
  const bars=()=>{q('#tb').innerHTML=Array.from({length:c.n},(_,t)=>'<div style="margin:6px 0"><b style="color:'+COL[t]+'">'+TN[t]+'</b> <span class="mu">'+(avg[t]||0).toFixed(1)+'점</span><div style="height:12px;background:var(--bd);border-radius:6px"><div style="height:100%;width:'+Math.min(100,(avg[t]||0)/(BEATS*2)*100)+'%;background:'+COL[t]+';border-radius:6px"></div></div></div>').join('')};
  bars();
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const v=rs.filter(r=>r.team===t&&typeof r.v==='number').map(r=>r.v);avg[t]=v.length?v.reduce((a,b)=>a+b,0)/v.length:0}
   if(q('#tb'))bars();
  });
  let lastBeat=-1,done=false;
  c.every(()=>{
   const tt=NOW()-t0,hd=q('#hd'),bc=q('#bc');if(!hd)return;
   if(tt<0){bc.textContent=Math.ceil(-tt/1000);hd.style.left='50%';hd.style.transform='translateX(-50%)';return}
   if(tt>BEATS*T+T/2){
    if(!done){done=true;c.set({t0,T,beats:BEATS,done:true});hd.textContent='🎉';hd.style.left='50%';hd.style.transform='translateX(-50%)';bc.textContent='환영 끝!';q('#bn').textContent='감사합니다!'}
    return;
   }
   const pos=-Math.cos(Math.PI*tt/T);                       // 박자마다 한쪽 끝에 닿음
   hd.style.left=(50+pos*34)+'%';hd.style.transform='translateX(-50%) rotate('+(pos*28)+'deg)';
   const b=Math.floor(tt/T+0.5);
   if(b!==lastBeat&&b>=0&&b<BEATS){lastBeat=b;bc.textContent=(b+1)+' / '+BEATS;tick(b%2===0)}
  },16);
 },

 /* ---- 참가자 화면: 박자에 맞춰 크게 흔들기 ---- */
 run(c){
  const BIG=7,GOOD=250,PERF=120,MINGAP=200;      // 크게 흔든 것으로 인정되는 세기(m/s²), 인정 오차(ms), 완벽 오차(ms)
  c.ready(async()=>{
   const ok=await askMotion('motion');
   let g=S&&S.g,score=0,sent=false;const credited={};
   c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">진행자 화면을 보세요!</p><p class="big" id="sc">0</p>'
    +'<div id="hd" style="font-size:80px;text-align:center;line-height:1.2">👋</div>'
    +'<p class="big" id="fb" style="font-size:30px;height:44px"></p><p class="mu" id="bt" style="text-align:center"></p>'
    +'<div id="pd" style="display:none;height:140px;border:2px dashed var(--bd);border-radius:14px;align-items:center;justify-content:center;color:var(--mu);touch-action:manipulation;user-select:none">센서가 없어요 · 박자에 맞춰 여기를 터치</div>';
   c.live(0);
   const say=t=>{const f=$('#fb');if(f){f.textContent=t;c.after(()=>{const e=$('#fb');if(e&&e.textContent===t)e.textContent=''},500)}};
   const credit=tp=>{
    if(!g||!g.t0)return;
    const b=Math.round((tp-g.t0)/g.T);if(b<0||b>=g.beats)return;
    const off=Math.abs(tp-(g.t0+b*g.T));
    if(off>GOOD){say('박자가 달라요');return}
    const pts=off<=PERF?2:1,old=credited[b]||0;
    if(pts>old){score+=pts-old;credited[b]=pts;c.live(score);const e=$('#sc');if(e)e.textContent=score;say(pts===2?'PERFECT! 👏':'GOOD 👍');try{navigator.vibrate(30)}catch(x){}}
   };
   const finish=()=>{if(sent)return;sent=true;c.stop();c.submit(score)};
   c.watch(gg=>{g=gg;if(g&&g.done)finish()});
   /* 안내용 손 움직임 + 종료 확인 */
   c.every(()=>{
    if(!g||!g.t0)return;
    const tt=NOW()-g.t0,hd=$('#hd'),st=$('#st'),bt=$('#bt');if(!hd)return;
    if(tt<0){if(st)st.textContent=Math.ceil(-tt/1000)+'초 뒤 시작! 폰을 세로로 잡으세요';hd.style.transform='';return}
    if(st)st.textContent='크게 좌우로 흔드세요!';
    hd.style.transform='translateX('+(-Math.cos(Math.PI*tt/g.T)*60)+'px) rotate('+(-Math.cos(Math.PI*tt/g.T)*25)+'deg)';
    if(bt)bt.textContent=Math.min(g.beats,Math.floor(tt/g.T+.5)+1)+' / '+g.beats+' 박자';
    if(tt>g.beats*g.T+g.T/2+300)finish();
   },33);
   /* 센서: 좌우 가속도의 큰 봉우리 = 흔들림이 방향을 바꾸는 순간 */
   let lp=null,p1=null,p2=null,lastPeak=0,got=false;
   const useTouch=()=>{const pd=$('#pd');if(pd){pd.style.display='flex';pd.onpointerdown=e=>{e.preventDefault();credit(NOW())}}};
   if(!ok){useTouch();return}
   c.listen('devicemotion',e=>{
    let ax;const a=e.acceleration,gr=e.accelerationIncludingGravity;
    if(a&&a.x!=null&&(a.x!==0||a.y!==0||(a.z||0)!==0))ax=a.x;
    else if(gr&&gr.x!=null){if(lp==null)lp=gr.x;lp=lp*.8+gr.x*.2;ax=gr.x-lp}
    else return;
    got=true;
    const cur={m:Math.abs(ax),t:NOW()};
    if(p1&&p2&&p1.m>=p2.m&&p1.m>cur.m&&p1.m>3&&p1.t-lastPeak>MINGAP){
     lastPeak=p1.t;
     if(p1.m>=BIG)credit(p1.t);else say('더 크게!');
    }
    p2=p1;p1=cur;
   });
   c.after(()=>{if(!got)useTouch()},2000);
  });
 }
});
})();
