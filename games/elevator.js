/* 엘리베이터 합의: 폰을 평평하게 들고 화면이 위(하늘)인지 아래(바닥)인지로 선택하는 협동 게임 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
registerGame({
 id:'elevator',
 order:17,
 name:'엘리베이터 합의',
 story:"인류가 AI 타워에 갇혔습니다! 팀원 전원이 말없이 같은 쪽을 골라야만 엘리베이터가 움직입니다. 눈치와 마음을 하나로 모아 함께 탈출하세요.",
 desc:'팀마다 엘리베이터가 있고, 매 라운드 ▲위 / ▼아래 문이 열립니다. 말하지 않고 팀원 모두가 같은 쪽을 고르세요. 폰을 평평하게 들고 화면이 하늘을 보면 "위", 폰을 뒤집어 화면이 바닥을 보면 "아래"입니다. 모두 같은 쪽이면 그쪽 점수를 얻고, 한 명이라도 다르면 엘리베이터가 고장 나 0점입니다. 일부 라운드는 점수가 가려진 "깜깜이"입니다. 9라운드 총점으로 승부합니다.',
 hi:true,
 fmt:v=>v+'점',

 /* ---- 진행자 화면: 팀별 엘리베이터 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const ROUNDS=9,PRE=12,ASK=7000,GRACE=700,REVEAL=3500,NEED=1;      // 라운드 수, 시작 전(초), 선택 시간(ms), 마감 대기(ms), 결과 보기(ms), 필요한 일치 비율(1=전원)
  const BLIND=[2,5,8];                                              // 점수가 가려지는 깜깜이 라운드(0부터)
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
  const teams=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t));
  const K=Math.min(...teams.map(m=>m.length));
  if(!(K>=1)){c.el.innerHTML='<p>모든 팀에 참가자가 1명 이상 있어야 합니다. 대기실에서 팀을 다시 배정하세요.</p>';return}
  const act=teams.map(m=>shuf(m).slice(0,K)),actMap={};act.forEach(m=>m.forEach(p=>actMap[p.id]=1));
  const score=act.map(()=>0),choice={},seen={};
  let round=-1,ph='wait',U=0,D=0,blind=false,dl=0,res=[],tLock=0;
  const pub=x=>Object.assign({r:round,ph,up:(blind&&ph==='ask')?null:U,dn:(blind&&ph==='ask')?null:D,blind,dl,act:actMap,sc:score.slice(),res,end:false},x||{});
  c.el.innerHTML='<div style="text-align:center"><p class="mu" id="rd" style="margin:0"></p><p class="big" id="msg" style="margin:4px 0"></p>'
   +'<div style="height:12px;background:var(--bd);border-radius:6px;overflow:hidden;margin:8px 0"><div id="bf" style="height:100%;width:0;background:var(--pr)"></div></div>'
   +'<div style="display:flex;gap:10px">'+act.map((m,t)=>'<div style="flex:1;min-width:0;border:2px solid '+COL[t]+';border-radius:12px;padding:8px">'
    +'<b style="color:'+COL[t]+'">'+TN[t]+'</b> <span id="sc'+t+'" style="font-weight:700">0점</span>'
    +'<div id="up'+t+'" style="font-weight:800;font-size:22px">▲</div>'
    +'<div style="position:relative;height:140px;background:var(--bg);border:1px solid var(--bd);border-radius:10px"><div id="el'+t+'" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:44px;transition:top .9s ease">🛗</div></div>'
    +'<div id="dn'+t+'" style="font-weight:800;font-size:22px">▼</div>'
    +'<div id="st'+t+'" class="mu" style="font-size:13px"></div><div id="rs'+t+'" style="font-weight:700;min-height:26px"></div></div>').join('')+'</div></div>';
  const q=s=>c.el.querySelector(s);
  const T=(id,t)=>{const e=q(id);if(e)e.textContent=t};
  const latest=id=>{const x=choice[id];return x&&x.r===round?x.ch:null};
  const counts=()=>act.forEach((m,t)=>{const chs=m.map(p=>latest(p.id));const u=chs.filter(x=>x==='u').length,d=chs.filter(x=>x==='d').length;T('#st'+t,'위 '+u+' · 아래 '+d+' · 미정 '+(m.length-u-d))});
  const faces=()=>{act.forEach((m,t)=>{T('#sc'+t,score[t]+'점');T('#up'+t,'▲ '+((blind&&ph==='ask')?'?':'+'+U));T('#dn'+t,'▼ '+((blind&&ph==='ask')?'?':'+'+D))})};
  const resetEl=()=>act.forEach((m,t)=>{const e=q('#el'+t);if(e){e.style.top='50%';e.textContent='🛗'}T('#rs'+t,'')});
  const lock=()=>{
   if(ph!=='ask')return;
   res=act.map((m,t)=>{
    const chs=m.map(p=>latest(p.id)),u=chs.filter(x=>x==='u').length,d=chs.filter(x=>x==='d').length,need=Math.ceil(m.length*NEED);
    let dir=null;if(u>=need&&u>d)dir='u';else if(d>=need&&d>u)dir='d';
    const p=dir?(dir==='u'?U:D):0;score[t]+=p;return{d:dir||'x',p};
   });
   ph='reveal';faces();
   res.forEach((r,t)=>{const e=q('#el'+t);
    if(r.d==='u'){e.style.top='14%';T('#rs'+t,'✅ 위로! +'+r.p)}
    else if(r.d==='d'){e.style.top='86%';T('#rs'+t,'✅ 아래로! +'+r.p)}
    else{e.textContent='🚨';T('#rs'+t,'❌ 의견이 갈렸어요')}});
   T('#msg','결과 공개!');q('#bf').style.width='100%';
   c.set(pub());c.after(startRound,REVEAL);
  };
  const startRound=()=>{
   round++;
   if(round>=ROUNDS){ph='end';T('#rd','');T('#msg','끝! 결과 공개를 누르세요');resetEl();c.set(pub({end:true}));return}
   blind=BLIND.includes(round);
   const pick=()=>10*(1+Math.floor(Math.random()*5));U=pick();do{D=pick()}while(blind&&D===U);
   ph='ask';dl=NOW()+ASK;res=[];resetEl();faces();counts();
   T('#rd','라운드 '+(round+1)+' / '+ROUNDS+(blind?' · 🎲 깜깜이 라운드!':''));
   T('#msg','위? 아래? 팀이 한마음으로!');
   c.set(pub());tLock=c.after(lock,ASK+GRACE);
  };
  faces();
  let pre=PRE;T('#msg','시작까지 '+pre+'초');
  const tk=c.every(()=>{pre--;if(pre>0){T('#msg','시작까지 '+pre+'초');return}clearInterval(tk);startRound()},1000);
  c.every(()=>{if(ph==='ask'){const left=dl-NOW();q('#bf').style.width=Math.max(0,Math.min(100,100-left/ASK*100))+'%'}},100);
  c.onResults(rs=>{
   rs.forEach(r=>{if(typeof r.k==='number'&&r.r!=null&&r.k>(seen[r.uid]||0)){seen[r.uid]=r.k;choice[r.uid]={r:r.r,ch:r.ch||null}}});
   if(ph==='ask')counts();
  });
 },

 /* ---- 참가자 화면: 폰을 평평하게 들고 화면이 위/아래 ---- */
 run(c){
  const HOLD=400;                                   // 한 자세를 이 시간(ms) 유지해야 선택으로 인정
  c.ready(async()=>{
   const ok=await askMotion('orient');
   let g=null,cur=null,raw=null,since=0,k=0,lastR=-2,sent=false,got=false,btn=false;
   const publish=()=>{if(!g||g.ph!=='ask')return;k++;c.live(0,{r:g.r,ch:cur,k})};
   const me=()=>g&&g.act&&g.act[c.uid];
   const selHtml=()=>cur==='u'?'<p class="big" style="margin:0">⬆️ 위 선택!</p><p class="mu" style="text-align:center">화면이 하늘을 보고 있어요</p>'
     :cur==='d'?'<p class="big" style="margin:0">⬇️ 아래 선택!</p><p class="mu" style="text-align:center">화면이 바닥을 보고 있어요</p>'
     :'<p class="big" style="margin:0">📱 …</p><p class="mu" style="text-align:center">'+(btn?'아래 버튼을 눌러 고르세요':'폰을 평평하게 들고 화면을 위(하늘) 또는 아래(바닥)로 하세요')+'</p>';
   const upd=()=>{const e=$('#sel');if(e)e.innerHTML=selHtml()};
   const render=()=>{
    const b=$('#bx');if(!b)return;
    if(!g||g.r<0){b.innerHTML='<p class="mu" style="text-align:center">곧 시작합니다. 진행자 화면을 보세요!</p>';return}
    const total='<p class="mu" style="text-align:center">우리 팀 '+((g.sc&&g.sc[c.team])||0)+'점 · 라운드 '+(g.r+1)+'</p>';
    if(!me()){b.innerHTML=total+'<p class="big">쉬는 중</p><p class="mu" style="text-align:center">팀 인원이 더 많아 이번 판은 쉽니다. 진행자 화면에서 응원하세요!</p>';return}
    if(g.ph==='ask'){
     b.innerHTML=total+'<p class="mu" style="text-align:center">▲ 위 '+(g.up==null?'?':'+'+g.up)+'　　▼ 아래 '+(g.dn==null?'?':'+'+g.dn)+'</p>'
      +'<div id="sel" style="min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center"></div>'
      +(btn?'<div class="row"><button id="bu" style="height:90px;font-size:22px">⬆️ 위</button><button id="bd" style="height:90px;font-size:22px">⬇️ 아래</button></div>':'')
      +'<p class="mu" style="text-align:center">말하지 않고 팀원과 같은 쪽을 고르세요!</p>';
     upd();
     if(btn){$('#bu').onclick=()=>{cur='u';publish();upd()};$('#bd').onclick=()=>{cur='d';publish();upd()}}
     return;
    }
    if(g.ph==='reveal'){
     const r=g.res&&g.res[c.team];
     const t=!r?'':r.d==='u'?'✅ 모두 위! +'+r.p:r.d==='d'?'✅ 모두 아래! +'+r.p:'❌ 의견이 갈렸어요 (고장 +0)';
     b.innerHTML=total+'<p class="mu" style="text-align:center">▲ 위 +'+g.up+'　　▼ 아래 +'+g.dn+'</p><p class="big" style="font-size:26px;margin:14px 0">'+t+'</p>';
     return;
    }
    b.innerHTML=total;
   };
   c.ga.innerHTML='<div id="bx"></div>';
   c.live(0);
   let wj='';c.watch(gg=>{const j=JSON.stringify(gg);if(j===wj)return;wj=j;   // 같은 데이터가 다시 와도 화면을 다시 그리지 않음(입력 중인 값 보호)
   
    g=gg;
    if(g&&g.end){if(!sent){sent=true;c.stop();c.submit((g.sc&&g.sc[c.team])||0)}return}
    render();
    if(g&&g.ph==='ask'&&g.r!==lastR){lastR=g.r;publish()}      // 새 라운드: 현재 자세를 다시 알림
   });
   /* 기울기 센서: 폰의 화면이 향한 방향 (위로 향하면 +1, 아래로 향하면 -1) */
   const useBtn=()=>{btn=true;render()};
   if(!ok){useBtn();return}
   c.listen('deviceorientation',e=>{
    if(e.beta==null||e.gamma==null)return;
    got=true;
    const z=Math.cos(e.beta*Math.PI/180)*Math.cos(e.gamma*Math.PI/180);
    const r=z>0.6?'u':z<-0.6?'d':null,now=performance.now();
    if(r!==raw){raw=r;since=now}
    if(now-since>=HOLD&&r!==cur){cur=r;publish();upd()}
   });
   c.every(()=>{if(raw!==cur&&raw!==null&&performance.now()-since>=HOLD){cur=raw;publish();upd()}},100);
   c.after(()=>{if(!got)useBtn()},2000);
  });
 }
});
})();
