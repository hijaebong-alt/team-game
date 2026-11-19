/* 줄다리기: "하나·둘·셋·영차!" 박자에 팀원 모두가 같이 당기면 줄이 우리 편으로 끌려오는 협동 게임 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
registerGame({
 id:'tugofwar',
 order:15,
 name:'줄다리기',
 story:"AI와 인류의 운명을 건 거대한 줄다리기가 시작되었습니다! 팀원 모두가 하나가 되어 같은 순간에 당겨야 가장 큰 힘이 나옵니다. 중앙의 리본을 우리 편으로 끌어오세요!",
 desc:'진행자 화면에 줄다리기 줄과 중앙 리본이 나옵니다. "하나·둘·셋·영차!" 박자의 영차! 순간에 팀원 모두가 스마트폰을 줄을 당기듯 앞에서 내 몸쪽으로 확 당기세요. 많이, 그리고 동시에 당길수록 세게 당겨져 리본이 우리 편으로 움직입니다. 혼자 당기거나 타이밍이 제각각이면 약합니다. 리본을 끝까지 끌어오면 승리, 20번이 끝나면 리본이 더 가까운 팀이 이깁니다. (팀 결과가 팀원 모두의 점수)',
 hi:true,
 fmt:v=>(v>=1000?'승리 · ':'')+'진행도 '+(((v%1000)/100-2)*100).toFixed(0)+'%',

 /* ---- 진행자 화면: 줄, 중앙 리본, 박자 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const PRE=10,CYCLE=1600,CUES=20,STEP=0.1;      // 시작 전 준비(초), 한 번 당기는 주기(ms), 당기는 횟수, 한 번에 움직이는 정도
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const DIRS={2:[[-1,0],[1,0]],3:[[-.87,.5],[.87,.5],[0,-1]],4:[[-1,0],[1,0],[0,-1],[0,1]]}[c.n]||[[-1,0],[1,0]];
  const size=DIRS.map((_,t)=>c.players.filter(p=>p.team===t).length);
  const CX=210,CY=190,R=120;
  const t0=NOW()+PRE*1000;
  let pos=[0,0],dp=[0,0],resolved=0,ended=false,winner=-1,lastBeat=-1;
  const presses={},seen={},fb=DIRS.map(()=>({txt:'',until:0}));
  const score=()=>DIRS.map(d=>pos[0]*d[0]+pos[1]*d[1]);
  const pub=end=>({t0,cycle:CYCLE,cues:CUES,end:!!end,pos:[+pos[0].toFixed(3),+pos[1].toFixed(3)],dirs:DIRS.map(d=>({x:d[0],y:d[1]})),
   sc:end?score().map((s,t)=>Math.round((s+2)*100)+(winner===t?1000:0)):[]});
  c.el.innerHTML='<div style="text-align:center"><p class="big" id="hl" style="margin:0">'+PRE+'</p>'
   +'<svg viewBox="0 0 420 380" style="width:100%;max-width:640px;background:var(--bg);border:1px solid var(--bd);border-radius:16px">'
   +DIRS.map((d,t)=>{const ex=CX+d[0]*R,ey=CY+d[1]*R,lx=CX+d[0]*(R+32),ly=CY+d[1]*(R+32),fx=CX+d[0]*(R+56),fy=CY+d[1]*(R+56);
     return '<line x1="'+CX+'" y1="'+CY+'" x2="'+ex+'" y2="'+ey+'" stroke="#a0763c" stroke-width="9" stroke-linecap="round"/>'
      +'<circle cx="'+ex+'" cy="'+ey+'" r="16" fill="none" stroke="'+COL[t]+'" stroke-width="4" stroke-dasharray="5 4"/>'
      +'<text x="'+lx+'" y="'+ly+'" text-anchor="middle" dominant-baseline="middle" font-size="20" font-weight="800" fill="'+COL[t]+'">'+TN[t]+'</text>'
      +'<text id="fb'+t+'" x="'+fx+'" y="'+fy+'" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="var(--tx)"></text>'}).join('')
   +'<circle cx="'+CX+'" cy="'+CY+'" r="12" fill="none" stroke="var(--mu)" stroke-width="2" stroke-dasharray="3 3"/>'
   +'<g id="rb"><text text-anchor="middle" dominant-baseline="middle" font-size="44">🎀</text></g></svg></div>';
  const q=s=>c.el.querySelector(s);
  let ac=window.__wac;if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  try{ac&&ac.resume()}catch(e){}
  const tick=hi=>{if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=hi?880:520;g.gain.value=.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+(hi?.18:.08))}catch(e){}};
  const setHead=t=>{const e=q('#hl');if(e&&e.textContent!==t)e.textContent=t};
  const finishGame=()=>{
   if(ended)return;ended=true;
   if(winner<0){const s=score();let b=0;s.forEach((v,t)=>{if(v>s[b])b=t});if(s[b]>0.02)winner=-2;}   // -2: 승리 보너스 없이 앞선 팀만 표시
   c.set(pub(true));
   const s=score();let b=0;s.forEach((v,t)=>{if(v>s[b])b=t});
   setHead(s[b]>0.02?TN[b]+' 팀 승리! 🎉':'무승부!');
  };
  const resolve=i=>{
   const pr=presses[i]||{},f=[];
   DIRS.forEach((d,t)=>{
    const arr=Object.values(pr).filter(p=>p.team===t&&p.ph>=950&&p.ph<=1550).map(p=>p.ph);
    const n=Math.min(arr.length,size[t]),spread=n>1?Math.max(...arr)-Math.min(...arr):0,tight=1-Math.min(1,spread/300);
    f[t]=size[t]?(n/size[t])*(0.5+0.5*tight):0;
    fb[t]={txt:n+'/'+size[t]+'명 · 싱크 '+Math.round(tight*100)+'%',until:performance.now()+1300};
   });
   DIRS.forEach((d,t)=>{pos[0]+=f[t]*d[0]*STEP;pos[1]+=f[t]*d[1]*STEP});
   score().forEach((s,t)=>{if(s>=1&&winner<0)winner=t});
   if(winner>=0)finishGame();else c.set(pub(false));
  };
  c.set(pub(false));
  c.onResults(rs=>rs.forEach(r=>{
   if(typeof r.k!=='number'||r.ci==null||r.k<=(seen[r.uid]||0))return;
   seen[r.uid]=r.k;(presses[r.ci]=presses[r.ci]||{})[r.uid]={team:r.team,ph:r.pt-(t0+r.ci*CYCLE)};
  }));
  c.every(()=>{
   const rb=q('#rb');if(!rb)return;
   dp[0]+=(pos[0]-dp[0])*.15;dp[1]+=(pos[1]-dp[1])*.15;
   rb.setAttribute('transform','translate('+(CX+dp[0]*R)+' '+(CY+dp[1]*R)+')');
   const now=performance.now();DIRS.forEach((d,t)=>{const e=q('#fb'+t);if(e)e.textContent=now<fb[t].until?fb[t].txt:''});
   const tt=NOW()-t0;
   if(tt<0){setHead(String(Math.ceil(-tt/1000)));return}
   if(ended)return;
   const ci=Math.floor(tt/CYCLE),bi=Math.min(3,Math.floor((tt-ci*CYCLE)/400));
   if(ci<CUES){const key=ci*4+bi;if(key!==lastBeat){lastBeat=key;setHead(['하나','둘','셋','영차!'][bi]);tick(bi===3)}}
   while(!ended&&resolved<CUES&&tt>resolved*CYCLE+1500+700){resolve(resolved);resolved++}
   if(!ended&&resolved>=CUES)finishGame();
  },16);
 },

 /* ---- 참가자 화면: 스마트폰을 몸쪽으로 당기기 (센서가 안 되면 버튼 터치로 대체) ---- */
 run(c){
  const PULL=6,RATIO=.6;                   // 당김으로 인정되는 앞뒤 가속도(m/s²). 인식이 안 되면 낮추세요
  c.ready(async()=>{
   const ok=await askMotion('motion');
   let g=null,k=0,sent=false,got=false,mode='';const pressed={};
   c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">진행자 화면을 보세요!</p>'
    +'<p class="big" id="bt" style="height:48px;margin:4px 0"></p>'
    +'<div style="height:14px;background:var(--bd);border-radius:7px;overflow:hidden"><div id="bf" style="height:100%;width:0;background:var(--pr)"></div></div>'
    +'<div id="pl" style="margin:12px 0;height:190px;border-radius:16px;border:2px dashed var(--bd);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:manipulation;user-select:none"><div style="font-size:64px;line-height:1">📱</div><div id="pt" style="font-size:20px;font-weight:700;margin-top:6px">영차! 에 몸쪽으로 당기세요</div></div>'
    +'<div style="height:8px;background:var(--bd);border-radius:6px"><div id="lv" style="height:100%;width:0;background:var(--pr);border-radius:6px"></div></div>'
    +'<p class="big" id="fb" style="font-size:22px;height:32px;margin:6px 0"></p><p class="mu" id="pg" style="text-align:center"></p>';
   c.live(0);
   const say=t=>{const f=$('#fb');if(f){f.textContent=t;c.after(()=>{const e=$('#fb');if(e&&e.textContent===t)e.textContent=''},900)}};
   const finish=()=>{if(sent)return;sent=true;const v=g&&g.sc&&g.sc[c.team];c.stop();c.submit(v==null?0:v)};
   c.watch(gg=>{g=gg;if(g&&g.end)finish()});
   /* 당긴 순간 처리: t는 서버 기준 시각 */
   const pull=t=>{
    if(!g||!g.t0||g.end)return;
    const tt=t-g.t0;if(tt<0)return;
    const ci=Math.floor(tt/g.cycle),ph=tt-ci*g.cycle;
    if(ph<1000)return;                                  // 준비 동작(뒤로 뻗기 등)은 무시
    if(ph>1500){if(!pressed[ci])say('늦었어요!');return}
    if(pressed[ci])return;
    pressed[ci]=1;k++;c.live(0,{k,ci,pt:t});
    try{navigator.vibrate(40)}catch(x){}
    const off=Math.round(ph-1200);
    say(Math.abs(off)<=80?'✔ 딱 맞아요!':Math.abs(off)<=180?'좋아요!':(off<0?'조금 빨랐어요 ':'조금 늦었어요 ')+Math.abs(off)+'ms');
   };
   c.every(()=>{
    if(!g||!g.t0)return;
    const tt=NOW()-g.t0,st=$('#st'),bt=$('#bt'),bf=$('#bf'),pl=$('#pl');if(!st)return;
    if(tt<0){st.textContent=Math.ceil(-tt/1000)+'초 뒤 시작! 폰을 앞으로 들고 준비';return}
    const ci=Math.floor(tt/g.cycle),ph=tt-ci*g.cycle;
    st.textContent=Math.min(ci+1,g.cues)+' / '+g.cues+' · 영차!에 팀원과 함께 당기기';
    bt.textContent=['하나','둘','셋','영차!'][Math.min(3,Math.floor(ph/400))];
    bf.style.width=(ph/g.cycle*100)+'%';
    pl.style.background=(ph>=1000&&ph<=1500)?'#2f9e5544':'';
    const d=g.dirs&&g.dirs[c.team],pg=$('#pg');
    if(d&&g.pos&&pg){const s=g.pos[0]*d.x+g.pos[1]*d.y;pg.textContent='우리 팀 진행도 '+(s>=0?'+':'')+Math.round(s*100)+'%'}
   },33);
   /* 센서가 없을 때: 터치로 대체 */
   const useTouch=()=>{mode='touch';const pl=$('#pl');if(pl){$('#pt').textContent='센서가 없어요 · 영차!에 여기를 터치';pl.onpointerdown=e=>{e.preventDefault();pull(NOW())}}};
   if(!ok){useTouch();return}
   /* 센서: 앞뒤(z축) 가속도의 큰 봉우리 = 몸쪽으로 당기는 순간 */
   let lp=null,p1=null,p2=null,lastPeak=0,warm=0;
   c.listen('devicemotion',e=>{
    let ax,ay,az;const a=e.acceleration,gr=e.accelerationIncludingGravity;
    if(a&&a.z!=null&&(a.x!==0||a.y!==0||a.z!==0)){ax=a.x||0;ay=a.y||0;az=a.z}
    else if(gr&&gr.z!=null){if(!lp)lp={x:gr.x||0,y:gr.y||0,z:gr.z};lp.x=lp.x*.8+(gr.x||0)*.2;lp.y=lp.y*.8+(gr.y||0)*.2;lp.z=lp.z*.8+gr.z*.2;ax=(gr.x||0)-lp.x;ay=(gr.y||0)-lp.y;az=gr.z-lp.z}
    else return;
    got=true;if(mode==='touch'||++warm<10)return;
    const m=Math.abs(az),lv=$('#lv');if(lv)lv.style.width=Math.min(100,m/(PULL*2)*100)+'%';
    const cur={m:(m>=RATIO*Math.hypot(ax,ay)?m:0),t:NOW()};     // 앞뒤 움직임이 좌우·상하보다 커야 인정
    if(p1&&p2&&p1.m>=p2.m&&p1.m>cur.m&&p1.m>=PULL&&p1.t-lastPeak>250){lastPeak=p1.t;pull(p1.t)}
    p2=p1;p1=cur;
   });
   c.after(()=>{if(!got)useTouch()},2000);
  });
 }
});
})();
