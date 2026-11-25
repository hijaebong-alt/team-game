/* 손가락 이어달리기: 팀별 주자가 화면을 200회 터치해 바통을 이어 달리는 게임. */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
const LEG=200;
const fmtT=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
registerGame({
 id:'finger-relay',
 order:22,
 name:'손가락 이어달리기',
 story:'AI가 인류의 모든 이동 경로를 봉쇄했습니다. 구조 요청이 담긴 비밀 바통을 다음 기지까지 사람의 힘으로 이어 달려 전달해야 합니다! 화면을 빠르게 터치해 다음 주자에게 바통을 넘기고, 팀 전체가 AI의 봉쇄를 뚫으세요.',
 desc:'팀마다 같은 수의 주자(가장 적은 팀의 인원수)가 순서대로 달립니다. 내 차례가 되면 화면의 달리기 영역을 200번 터치하세요. 200회 터치하면 자동으로 다음 주자에게 바통이 넘어갑니다. 진행자 화면에서 이어달리기 모습이 보이고, 마지막 주자까지 가장 먼저 들어온 팀이 승리합니다. 제한시간 안에 완주하지 못하면 달린 거리로 비교합니다. (높을수록 좋음)',
 hi:true,
 fmt:v=>v>=100000?'완주 '+fmtT((1000000-v)*10):'진행 '+(v/10).toFixed(1)+'%',
host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const PRE=12;                                              // 출발 전 준비(초): 참가자가 준비할 시간
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const teams=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t));
  const K=Math.min(...teams.map(m=>m.length));
  if(!(K>=1)){c.el.innerHTML='<p>모든 팀에 참가자가 1명 이상 있어야 합니다. 대기실에서 팀을 다시 배정하세요.</p>';return}
  const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
  const run=teams.map(m=>shuf(m).slice(0,K));                 // 팀별 주자 순서 (인원이 많은 팀은 K명만 달리고 나머지는 응원)
  const LIMIT=Math.max(150,K*100)*1000;                       // 제한시간(ms)
  const t0=NOW()+PRE*1000;
  const cur=run.map(()=>0),fin=run.map(()=>0),cnt=run.map(m=>m.map(()=>0));
  let ended=false;
  const O=a=>{const o={};a.forEach((v,i)=>o[i]=v);return o};
  const prog=t=>cnt[t].reduce((a,x)=>a+Math.min(LEG,x),0)/(K*LEG);
  const pub=end=>({t0,leg:LEG,limit:LIMIT,k:K,ord:O(run.map(m=>m.map(p=>p.id))),cur:O(cur),end:!!end,
    sc:end?run.map((m,t)=>fin[t]?1000000-Math.round(fin[t]/10):Math.round(prog(t)*1000)):[]});
  c.set(pub(false));
  c.el.innerHTML='<div style="text-align:center"><p class="big" id="tm" style="margin:0"></p><p class="mu" style="margin:0">팀당 '+K+'명이 이어달립니다 · 한 구간 = 폰 '+LEG+'번 흔들기</p>'
   +'<div style="margin-top:8px">'+run.map((m,t)=>'<div style="text-align:left;margin:12px 0">'
    +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b> <span id="pg'+t+'" class="mu"></span> <span id="rk'+t+'" style="font-weight:700"></span>'
    +'<div style="position:relative;height:104px;margin-top:4px;border-radius:12px;background:linear-gradient(#d9c796,#c9b680);border:2px solid '+COL[t]+'">'
    +Array.from({length:K+1},(_,i)=>'<div style="position:absolute;top:0;bottom:0;left:'+(i/K*100)+'%;width:0;border-left:2px dashed '+(i===0||i===K?'#fff':'#ffffffaa')+'"></div>').join('')
    +'<div style="position:absolute;right:2px;top:2px;font-size:26px">🏁</div>'
    +m.map((p,i)=>'<div id="rn'+t+'_'+i+'" style="position:absolute;top:18px;left:0;width:64px;margin-left:-32px;text-align:center;transition:left .35s linear">'
      +'<div id="ic'+t+'_'+i+'" style="font-size:36px;line-height:1;display:inline-block">🧍</div>'
      +'<div id="bt'+t+'_'+i+'" style="width:26px;height:7px;border-radius:4px;background:'+COL[t]+';margin:0 auto;visibility:hidden"></div>'
      +'<div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(i+1)+'. '+esc(p.name)+'</div><div id="ct'+t+'_'+i+'" class="mu" style="font-size:11px;min-height:14px"></div></div>').join('')
    +'</div></div>').join('')+'</div></div>';
  const q=s=>c.el.querySelector(s);
  const T=(id,t)=>{const e=q(id);if(e&&e.textContent!==t)e.textContent=t};
  let ac=window.__wac;if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  try{ac&&ac.resume()}catch(e){}
  const tone=(f,len,vol)=>{if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=vol||.12;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+len)}catch(e){}};
  const draw=()=>{
   const order=run.map((m,t)=>t).sort((a,b)=>(fin[b]?2:0)-(fin[a]?2:0)||(fin[a]&&fin[b]?fin[a]-fin[b]:prog(b)-prog(a)));
   run.forEach((m,t)=>{
    m.forEach((p,i)=>{
     const el=q('#rn'+t+'_'+i),ic=q('#ic'+t+'_'+i),bt=q('#bt'+t+'_'+i);if(!el)return;
     let x,icon,baton='hidden';
     if(i<cur[t]){x=(i+1)/K;icon='🙌'}                                   // 구간을 마친 주자는 바통을 넘기고 응원
     else if(i===cur[t]){x=(i+Math.min(LEG,cnt[t][i])/LEG)/K;icon='🏃';baton='visible'}   // 지금 달리는 주자
     else{x=i/K;icon='🧍'}                                                // 순서를 기다리는 주자
     if(fin[t]&&i===K-1){x=1;icon='🙌'}
     el.style.left=(Math.min(x,1)*100)+'%';
     if(ic&&ic.textContent!==icon){ic.textContent=icon;ic.style.transform=icon==='🏃'?'scaleX(-1)':''}
     if(bt)bt.style.visibility=baton;
     T('#ct'+t+'_'+i,i===cur[t]&&!fin[t]?Math.min(LEG,cnt[t][i])+' / '+LEG:i<cur[t]||fin[t]?'✔':'');
    });
    T('#pg'+t,fin[t]?'완주 '+fmtT(fin[t]):'진행 '+(prog(t)*100).toFixed(1)+'%');
    T('#rk'+t,fin[t]?'🏆 '+(order.indexOf(t)+1)+'위':'');
   });
  };
  c.onResults(rs=>{
   let ch=false;
   run.forEach((m,t)=>m.forEach((p,i)=>{
    const r=rs.find(x=>x.uid===p.id&&x.lg===i&&typeof x.v==='number');
    if(r)cnt[t][i]=Math.max(cnt[t][i],Math.min(LEG,r.v));
   }));
   run.forEach((m,t)=>{
    while(cur[t]<K&&cnt[t][cur[t]]>=LEG){
     cur[t]++;ch=true;
     if(cur[t]>=K){fin[t]=Math.max(1000,NOW()-t0);tone(880,.3,.15);tone(1320,.4,.12)}else tone(700,.15,.14)   // 바통 전달 소리
    }
   });
   if(ch)c.set(pub(false));
   draw();
  });
  c.every(()=>{
   const tt=NOW()-t0;
   if(tt<0){T('#tm','출발까지 '+Math.ceil(-tt/1000)+'초');draw();return}
   if(!ended){
    const left=LIMIT-tt;
    T('#tm',run.every((m,t)=>fin[t])?'모든 팀 도착!':'남은 시간 '+fmtT(Math.max(0,left)));
    if(left<=0||run.every((m,t)=>fin[t])){ended=true;c.set(pub(true));T('#tm',left<=0?'⏱ 시간 종료! 결과 공개를 눌러 주세요':'🎉 모든 팀이 도착했어요! 결과 공개를 눌러 주세요')}
   }
   draw();
  },200);
 }, /* ---- 참가자 화면: 화면을 200회 터치 ---- */
 run(c){
  c.ready(()=>{
   let g=null,count=0,doneLeg=false,sent=false,lastLive=-1000;
   c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">진행자 화면을 보세요!</p><p class="big" id="ct" style="margin:2px 0">…</p>'
    +'<div style="height:22px;background:var(--bd);border-radius:11px;overflow:hidden"><div id="bf" style="height:100%;width:0;background:var(--pr);transition:width .1s"></div></div>'
    +'<div id="pd" style="display:flex;margin-top:12px;height:150px;border-radius:16px;background:var(--pr);color:#fff;align-items:center;justify-content:center;font-size:30px;font-weight:700;touch-action:manipulation;user-select:none;-webkit-user-select:none">🏃 달리려면 여기를 연타!</div>'
    +'<p class="mu" id="pg" style="text-align:center;margin-top:10px"></p>';
   const T=(id,t)=>{const e=$(id);if(e&&e.textContent!==t)e.textContent=t};
   const myIdx=()=>{const a=g&&g.ord&&g.ord[c.team];return a?a.indexOf(c.uid):-1};
   const active=()=>!!(g&&g.t0&&!g.end&&NOW()>=g.t0&&myIdx()>=0&&g.cur&&g.cur[c.team]===myIdx()&&!doneLeg);
   const LG=()=>(g&&g.leg)||LEG;
   const finish=()=>{if(sent)return;sent=true;c.stop();if(myIdx()>=0)c.submit((g&&g.sc&&g.sc[c.team])||0)};
   c.watch(gg=>{g=gg;if(g&&g.end)finish()});
   const step=()=>{
    if(!active())return;
    count++;
    const now=performance.now(),idx=myIdx();
    if(count>=LG()){count=LG();doneLeg=true;c.live(count,{lg:idx,done:1});try{navigator.vibrate([80,50,80,50,250])}catch(x){}}
    else if(now-lastLive>350){lastLive=now;c.live(count,{lg:idx})}
   };
   const pd=$('#pd');
   if(pd)pd.onpointerdown=e=>{e.preventDefault();step()};
   c.every(()=>{
    if(!g||!g.ord)return;
    const idx=myIdx(),t=g.t0?NOW()-g.t0:-1,cu=g.cur?g.cur[c.team]:0,L=LG();
    if(idx<0){T('#st','이번 판은 응원! 쉬는 중이에요');T('#ct','📣');T('#pg','우리 팀을 큰 소리로 응원해 주세요');return}
    const mine=cu===idx&&!doneLeg;
    const bf=$('#bf');if(bf)bf.style.width=(mine||doneLeg?count/L*100:idx<cu?100:0)+'%';
    if(t<0){T('#st','곧 출발! 내 순서는 '+(idx+1)+'번째 주자');T('#ct',Math.ceil(-t/1000)+'초');return}
    if(mine){T('#st','🏃 내 차례! 달리기 영역을 연타하세요!');T('#ct',count+' / '+L);T('#pg','화면을 '+L+'번 터치하면 다음 주자에게 바통이 넘어갑니다');}
    else if(doneLeg||idx<cu){T('#st','🏁 내 구간 완료! 바통을 넘겼어요');T('#ct','✔');T('#pg',g.k&&cu>=g.k?'우리 팀 완주!':'다음 주자를 응원하세요');}
    else{T('#st','내 순서는 '+(idx+1)+'번째 주자 · 지금 '+(cu+1)+'번째 주자가 달리는 중');T('#ct','⏳');T('#pg',(idx-cu===1?'다음이 내 차례예요! 준비하세요':(idx-cu)+'명 뒤에 내 차례예요'));}
   },100);
  });
 }
});
})();

