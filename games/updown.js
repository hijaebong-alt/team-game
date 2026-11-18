/* 위아래로 움직이기 — 센서(흔들기) 게임. 진행자 화면에는 팀별 로켓 높이로 현재 진행 상태를 비교해서 보여 줌 */
(function(){
const base=shakeGame("updown","위아래로 움직이기","y","위아래","스마트폰 화면을 세로로 잡고 10초 동안 빠르게 위아래로 움직이세요. 센서가 추정한 이동이 20cm 이상일 때 인정합니다. 좌우 흔들기는 점수에 포함되지 않습니다.",["▲ 위","아래 ▼"]);
registerGame(Object.assign(base,{order:2,story:"AI가 장악한 감시 위성이 지구 전체를 내려다보고 있습니다. 인류의 로켓을 쏘아 올려 위성을 무력화해야 합니다. 폰을 위아래로 움직여 우리 팀 로켓의 추진력을 모으세요!",
 run(c){
  c.ready(async()=>{
   const allowed=await askMotion('motion');
   if(!allowed||!window.DeviceMotionEvent){
    c.ga.innerHTML='<p class="big">센서를 사용할 수 없어요</p><p>이 게임은 스마트폰 움직임 센서가 필요합니다. 브라우저의 동작 및 방향 권한을 허용한 뒤 다시 참여해 주세요.</p>';
    c.submit(0);return;
   }
   let count=0,lastAt=0,startedAt=0,lastLive=0,gravity=[null,null,null],filtered=[0,0,0],velocity=0,position=0,direction=0,segmentAt=0,waiting=true,finished=false;
   c.ga.innerHTML='<p class="big" id="tl">10</p><p class="big" id="sc">0</p><p class="mu" id="motionHint">움직임 센서 연결 중…</p>';
   const score=()=>{const e=c.ga.querySelector('#sc');if(e)e.textContent=count;const t=performance.now();if(t-lastLive>400){lastLive=t;c.live(count)}};
   const end=()=>{if(finished)return;finished=true;c.stop();c.submit(count)};
   c.listen('devicemotion',e=>{
    if(finished)return;
    const now=performance.now();
    const axes=['x','y','z'];let raw,linear=true;
    if(e.acceleration&&axes.every(k=>Number.isFinite(e.acceleration[k])))raw=axes.map(k=>e.acceleration[k]);
    else if(e.accelerationIncludingGravity&&axes.every(k=>Number.isFinite(e.accelerationIncludingGravity[k]))){raw=axes.map(k=>e.accelerationIncludingGravity[k]);linear=false}
    else return;
    if(waiting){waiting=false;startedAt=now;lastAt=now;segmentAt=now;if(!linear)gravity=raw.slice();const h=c.ga.querySelector('#motionHint');if(h)h.textContent='세로로 잡고 빠르게 위아래로 움직이세요 · 좌우 흔들기는 미인정';return}
    const dt=Math.min(.06,Math.max(.008,(now-lastAt)/1000));lastAt=now;
    const a=raw.map((v,i)=>{
     if(!linear){if(gravity[i]==null)gravity[i]=v;const lin=v-gravity[i];gravity[i]+=((v-gravity[i])*dt)/(.7+dt);return lin}
     return v;
    });
    a.forEach((v,i)=>{filtered[i]+=(v-filtered[i])*Math.min(1,dt/.045);if(Math.abs(filtered[i])<.22)filtered[i]=0});
    const vertical=filtered[1],side=Math.abs(filtered[0]);
    // Keep the vertical axis dominant. Lateral shakes are discarded and cannot build up travel.
    if(Math.abs(vertical)<.35||Math.abs(vertical)<side*1.25){velocity*=Math.exp(-dt*2.5);position=0;direction=0;segmentAt=now}
    const nextVelocity=velocity+vertical*dt;
    position+=(velocity+nextVelocity)*.5*dt;
    const nextDirection=Math.abs(nextVelocity)>.035?Math.sign(nextVelocity):direction;
    if(direction&&nextDirection&&nextDirection!==direction){
     const duration=now-segmentAt;
     if(duration>=100&&duration<=1500&&Math.abs(position)>=.20){count++;score()}
     position=0;velocity=0;segmentAt=now;direction=nextDirection;
    }else{velocity=nextVelocity;if(!direction&&nextDirection){direction=nextDirection;segmentAt=now}}
    if(now-startedAt>=10000){end();return}
    const timer=c.ga.querySelector('#tl');if(timer)timer.textContent=Math.max(0,Math.ceil(10-(now-startedAt)/1000));
   });
   c.after(()=>{if(waiting&&!finished){finished=true;c.stop();c.ga.innerHTML='<p class="big">센서 신호가 없어요</p><p>스마트폰에서 이 페이지를 열고 동작 센서 권한을 허용해 주세요. 이번 기록은 0회로 제출됩니다.</p>';c.submit(0)}},3000);
  });
 },
 /* ---- 진행자 화면: 팀 평균 움직인 횟수에 따라 로켓이 올라감 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);let maxv=40;                  // maxv: 로켓이 달에 닿는 평균 횟수(넘으면 자동으로 늘어남)
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">위아래로 움직여 로켓을 높이 쏘아 올리세요! 🚀</p>'
   +'<div style="display:flex;justify-content:space-around;gap:10px;margin-top:8px">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1;text-align:center"><div style="position:relative;height:340px;border-radius:14px;overflow:hidden;background:linear-gradient(#0b1230,#2a3b8f 70%,#5b8cff)">'
     +'<div style="position:absolute;top:6px;left:0;right:0;font-size:30px">🌙</div>'
     +'<div id="cr'+t+'" style="position:absolute;top:44px;left:0;right:0;font-size:24px"></div>'
     +'<div id="rk'+t+'" style="position:absolute;left:0;right:0;bottom:2%;transition:bottom .5s ease"><span style="display:inline-block;font-size:46px;line-height:1;transform:rotate(-45deg)">🚀</span><div style="font-size:26px;line-height:1">🔥</div></div></div>'
     +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b><div id="v'+t+'" class="mu" style="font-size:16px">평균 0.0회</div></div>').join('')
   +'</div></div>';
  const q=s=>c.el.querySelector(s);
  const draw=()=>{
   const mx=Math.max(...avg);if(mx*1.1>maxv)maxv=mx*1.1;
   avg.forEach((a,t)=>{
    const r=q('#rk'+t);if(r)r.style.bottom=(2+68*Math.min(1,a/maxv))+'%';       // 최대 70% 높이까지 상승
    const v=q('#v'+t);if(v)v.textContent='평균 '+a.toFixed(1)+'회';
    const cr=q('#cr'+t);if(cr)cr.textContent=(mx>0&&a===mx&&avg.filter(x=>x===mx).length===1)?'👑':'';
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 }
}));
})();

