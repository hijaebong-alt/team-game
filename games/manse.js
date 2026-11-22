/* 만세 게임: 진행자 화면의 "하나·둘·셋 만세!" 구호에 맞춰 폰 마이크에 대고 만세를 외치면, 목소리 크기를 팀별로 비교하는 게임 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
const ROUNDS=3,CYCLE=8000,SHOUT0=3000,SHOUT1=6000;       // 만세 외치는 횟수, 한 번의 길이(ms), 외치는 구간(구호 후 3~6초)
registerGame({
 id:'manse',
 order:19,
 name:'만세 게임',
 story:'AI에게 인류의 승리를 선언할 시간입니다! 사람들의 함성은 AI의 방어 시스템을 흔들 수 있습니다. 팀원 모두의 만세 소리를 하나로 모아 가장 큰 함성을 터뜨리세요!',
 desc:'진행자 화면에 "하나 · 둘 · 셋 · 만세!" 구호가 나옵니다. 만세! 구간(3초) 동안 폰 마이크에 대고 가장 큰 소리로 만세를 외치세요. 3번 외친 최고 소리 크기가 점수(최대 300점)이고, 팀 평균이 높은 팀이 승리합니다. 처음에 마이크 허용 창이 뜨면 허용을 눌러 주세요. 마이크를 입 가까이 대고, 큰 소리일수록 높은 점수입니다. (높을수록 좋음)',
 hi:true,
 fmt:v=>v+'점',

 /* ---- 진행자 화면: 구호와 팀별 함성 미터 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const PRE=12;                                              // 시작 전 준비(초): 참가자가 마이크를 허용할 시간
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const t0=NOW()+PRE*1000;
  c.set({t0,cycle:CYCLE,rounds:ROUNDS});
  const now=Array(c.n).fill(0),tot=Array(c.n).fill(0),lastR=Array(c.n).fill(0);
  let rs0=[],curR=-1,closed={},lastBeat=-1,ended=false;
  c.el.innerHTML='<div style="text-align:center"><p class="mu" id="rd" style="margin:0"></p>'
   +'<div id="cue" style="font-size:76px;font-weight:800;min-height:104px;line-height:104px"></div>'
   +'<div style="display:flex;gap:12px;margin-top:4px">'+Array.from({length:c.n},(_,t)=>'<div style="flex:1;min-width:0">'
    +'<div style="position:relative;height:230px;background:var(--bg);border:1px solid var(--bd);border-radius:12px;overflow:hidden">'
    +'<div id="em'+t+'" style="position:absolute;left:0;right:0;bottom:8px;text-align:center;line-height:1;font-size:40px;transition:bottom .15s,font-size .15s">🙌</div>'
    +'<div id="mt'+t+'" style="position:absolute;left:22%;right:22%;bottom:0;height:2%;background:linear-gradient(0deg,'+COL[t]+','+COL[t]+'88);border-radius:8px 8px 0 0;transition:height .15s"></div></div>'
    +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span>'
    +'<div id="lv'+t+'" style="font-size:30px;font-weight:800;line-height:1.2">0</div><div class="mu" style="font-size:13px">이번 함성 크기</div>'
    +'<div class="mu" id="tt'+t+'" style="font-size:14px">누적 평균 0.0점</div></div>').join('')+'</div></div>';
  const q=s=>c.el.querySelector(s);
  const T=(id,t)=>{const e=q(id);if(e&&e.textContent!==t)e.textContent=t};
  let ac=window.__wac;if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  try{ac&&ac.resume()}catch(e){}
  const tone=(f,len,vol)=>{if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=vol||.12;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+len)}catch(e){}};
  const avgOf=(t,key,rs)=>{const v=rs.filter(r=>r.team===t&&typeof r[key]==='number'&&(key==='v'||r.r===curR)).map(r=>r[key]);return size[t]?v.reduce((a,b)=>a+b,0)/size[t]:0};
  const draw=(win)=>{
   const mx=Math.max(...tot);
   for(let t=0;t<c.n;t++){
    const lv=win?now[t]:lastR[t];
    const m=q('#mt'+t);if(m)m.style.height=(2+96*Math.min(100,lv)/100)+'%';
    const e=q('#em'+t);if(e){e.style.bottom=(8+(230-60)*Math.min(100,lv)/100*0.9)+'px';e.style.fontSize=(40+50*Math.min(100,lv)/100)+'px'}
    T('#lv'+t,String(Math.round(lv)));
    T('#tt'+t,'누적 평균 '+tot[t].toFixed(1)+'점');
    T('#cr'+t,(mx>0&&tot[t]===mx&&tot.filter(x=>x===mx).length===1)?'👑':'');
   }
  };
  c.onResults(rs=>{
   rs0=rs;
   for(let t=0;t<c.n;t++){now[t]=avgOf(t,'lv',rs);tot[t]=avgOf(t,'v',rs)}
  });
  c.every(()=>{
   const tt=NOW()-t0;
   if(tt<0){T('#cue',String(Math.ceil(-tt/1000)));T('#rd','마이크 허용을 눌러 주세요! 곧 시작합니다');draw(false);return}
   const r=Math.floor(tt/CYCLE);
   if(r>=ROUNDS){
    if(!ended){ended=true;T('#cue','🎉 끝!');T('#rd','결과 공개를 눌러 주세요');draw(false);c.set({t0,cycle:CYCLE,rounds:ROUNDS,end:true})}
    return;
   }
   const ph=tt-r*CYCLE,win=ph>=SHOUT0&&ph<SHOUT1;
   if(r!==curR){curR=r;for(let t=0;t<c.n;t++){now[t]=0;lastR[t]=0}}      // 새 만세가 시작되면 미터를 비움
   T('#rd','만세 '+(r+1)+' / '+ROUNDS);
   const beat=ph<1000?0:ph<2000?1:ph<3000?2:win?3:4,key=r*10+beat;
   if(key!==lastBeat){lastBeat=key;
    T('#cue',['하나','둘','셋','🙌 만세!!!','결과'][beat]);
    if(beat<3)tone(600,.08);else if(beat===3){tone(880,.35,.16);tone(1320,.35,.12)}}
   if(ph>=SHOUT1+200&&!closed[r]){closed[r]=true;for(let t=0;t<c.n;t++)lastR[t]=avgOf(t,'pk',rs0)}   // 이번 라운드의 평균 최고 소리 확정
   draw(win);
  },60);
 },

 /* ---- 참가자 화면: 마이크에 대고 만세 외치기 ---- */
 run(c){
  const RANGE=45;                                            // 주변 소음보다 이만큼(dB) 크면 100점
  c.ready(async()=>{
   let g=null,stream=null,an=null,ac=null,buf=null,tap=false,sent=false;
   let baseSum=0,baseN=0,quiet=0;const hist=[],peaks=[];
   let cur=0,curR=-1,lastLive=0,lvl=0,closed={};
   c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">마이크를 준비하는 중…</p><p class="big" id="cue" style="margin:4px 0;height:56px"></p>'
    +'<div style="height:26px;background:var(--bd);border-radius:13px;overflow:hidden"><div id="mt" style="height:100%;width:0;background:linear-gradient(90deg,#2f9e55,#f2c200,#e24b4a);transition:width .08s"></div></div>'
    +'<p class="big" id="lv" style="font-size:44px;margin:8px 0 0">0</p><p class="mu" id="ms" style="text-align:center;margin:0"></p>'
    +'<div id="tp" style="display:none;margin-top:10px;height:130px;border:2px dashed var(--bd);border-radius:14px;align-items:center;justify-content:center;color:var(--mu);touch-action:manipulation;user-select:none">마이크를 쓸 수 없어요 · 만세! 구간에 여기를 연타하세요</div>';
   const T=(id,t)=>{const e=$(id);if(e&&e.textContent!==t)e.textContent=t};
   const stopMic=()=>{try{stream&&stream.getTracks().forEach(t=>t.stop())}catch(e){}try{ac&&ac.close()}catch(e){}};
   const finish=()=>{if(sent)return;sent=true;const total=peaks.reduce((a,b)=>a+b,0);c.stop();stopMic();c.submit(Math.round(total))};
   c.watch(gg=>{g=gg;if(g&&g.end)finish()});
   try{
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    ac=new (window.AudioContext||window.webkitAudioContext)();try{await ac.resume()}catch(e){}
    const src=ac.createMediaStreamSource(stream);an=ac.createAnalyser();an.fftSize=1024;src.connect(an);buf=new Float32Array(an.fftSize);
    T('#st','마이크 준비 완료! 진행자 화면의 구호를 기다리세요');
   }catch(e){
    tap=true;const tp=$('#tp');if(tp){tp.style.display='flex';tp.onpointerdown=ev=>{ev.preventDefault();lvl=Math.min(100,lvl+25)}}
    T('#st','마이크를 쓸 수 없어요 (허용하지 않았거나 지원하지 않는 폰)');
   }
   const sample=()=>{
    an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];
    const db=20*Math.log10(Math.max(Math.sqrt(s/buf.length),1e-6));
    hist.push(db);if(hist.length>3)hist.shift();                // 약 0.15초 평균 (손뼉·충격음 같은 순간 소리 완화)
    return hist.reduce((a,b)=>a+b,0)/hist.length;
   };
   c.every(()=>{
    let db=null;if(an)db=sample();
    if(!g||!g.t0)return;
    const tt=NOW()-g.t0,total=peaks.reduce((a,b)=>a+b,0);
    if(db!==null){
     if(tt<2500){baseSum+=db;baseN++}                            // 시작 전·첫 구호 동안의 주변 소음을 기준으로
     if(quiet===0||db<quiet)quiet=db;
     const base=baseN>=5?baseSum/baseN:quiet;
     lvl=Math.max(0,Math.min(100,(db-base)/RANGE*100));
    }else if(tap)lvl=Math.max(0,lvl-6);
    const mt=$('#mt');if(mt)mt.style.width=lvl+'%';T('#lv',String(Math.round(lvl)));
    if(tt<0){T('#cue',Math.ceil(-tt/1000)+'초 뒤');return}
    const r=Math.floor(tt/g.cycle);
    if(r>=g.rounds){if(tt>g.rounds*g.cycle+1500)finish();return}
    const ph=tt-r*g.cycle,win=ph>=SHOUT0&&ph<SHOUT1;
    if(r!==curR){curR=r;cur=0}
    T('#cue',ph<1000?'하나':ph<2000?'둘':ph<3000?'셋':win?'🙌 만세!!!':'결과');
    if(win){
     cur=Math.max(cur,lvl);
     if(performance.now()-lastLive>300){lastLive=performance.now();c.live(Math.round(total+cur),{r,lv:Math.round(lvl),pk:Math.round(cur)})}   // 진행자 화면의 실시간 비교용
    }else if(ph>=SHOUT1&&!closed[r]){
     closed[r]=true;peaks[r]=Math.round(cur);
     c.live(Math.round(peaks.reduce((a,b)=>a+b,0)),{r,lv:0,pk:peaks[r]});
     T('#ms','만세 '+(r+1)+' 최고 소리: '+peaks[r]+'점');
    }
   },50);
  });
 }
});
})();
