/* 암산 게임: 진행자 화면에 덧셈·곱셈 문제가 나오면 참가자는 폰에 답을 입력. 진행자 화면에는 팀별로 맞힌 참가자 수가 표시됨 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
registerGame({
 id:'mental',
 order:18,
 name:'암산 게임',
 story:'AI의 계산 회로가 숫자 자물쇠로 잠겨 있습니다. 계산기 없이 머릿속으로 풀어내는 인간의 암산만이 자물쇠를 열 수 있습니다. 팀원 모두가 힘을 모아 한 문제라도 더 많이 풀어 AI의 회로를 무너뜨리세요!',
 desc:'진행자 화면에 덧셈·뺄셈·곱셈 문제가 나옵니다. 계산기 없이 머릿속으로 풀어 내 폰에 정답을 입력하세요. 6문제이며 뒤로 갈수록 어려워집니다. 한 문제에 답은 한 번만 제출할 수 있습니다. 진행자 화면에는 팀별로 맞힌 사람 수가 표시되고, 팀원 평균 정답 수가 많은 팀이 승리합니다. (높을수록 좋음)',
 hi:true,
 fmt:v=>(v/10).toFixed(2)+'개 정답',

 /* ---- 진행자 화면: 문제 + 팀별 맞힌 사람 수 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const ROUNDS=6,PRE=6,COUNT=3000,JUDGE=2000,REVEAL=4500;      // 문제 수, 시작 전(초), 문제 나오기 전 카운트다운, 정답 공개 전 대기, 정답 보여 주는 시간(ms)
  const SHOW_ON_PHONE=false;                                   // true면 참가자 폰에도 문제를 함께 보여 줌
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const mem=c.players.filter(p=>p.team!=null&&p.team<c.n);
  const size=Array.from({length:c.n},(_,t)=>mem.filter(p=>p.team===t).length);
  if(!mem.length){c.el.innerHTML='<p>참가자가 없습니다. 대기실에서 팀을 배정하세요.</p>';return}
  const cnt={},seen={};mem.forEach(p=>cnt[p.id]=0);
  let ans={},okSet={},round=-1,prob=null,phase='wait',open=false,dl=0,curSpan=COUNT,tAsk=0;
  const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const gen=r=>{                                               // 6문제 동안 덧셈·뺄셈·곱셈을 모두 출제
   const tier=Math.floor(r/2),op=['+','-','×'][r%3];let q,a,ms;
   if(op==='×'){
    if(tier===0){const x=rnd(3,9),y=rnd(6,15);q=x+' × '+y;a=x*y;ms=10000}
    else if(tier===1){const x=rnd(6,9),y=rnd(12,25);q=x+' × '+y;a=x*y;ms=14000}
    else{const x=rnd(6,9),y=rnd(26,49);q=x+' × '+y;a=x*y;ms=18000}
   }else if(tier===0){
    let x=rnd(11,59),y=rnd(11,59);if(op==='-'&&x<y)[x,y]=[y,x];q=x+' '+op+' '+y;a=op==='+'?x+y:x-y;ms=10000
   }else if(tier===1){
    let x=rnd(101,499),y=rnd(101,499);if(op==='-'&&x<y)[x,y]=[y,x];q=x+' '+op+' '+y;a=op==='+'?x+y:x-y;ms=14000
   }else if(op==='+'){
    const x=rnd(21,89),y=rnd(21,89),z=rnd(21,89);q=x+' + '+y+' + '+z;a=x+y+z;ms=16000
   }else{
    let x=rnd(301,899),y=rnd(301,899);if(x<y)[x,y]=[y,x];q=x+' - '+y;a=x-y;ms=16000
   }
   return{q,a,ms};
  };
  const pub=x=>Object.assign({r:round,ph:phase,cnt:Object.assign({},cnt),end:false},x||{});
  c.el.innerHTML='<div style="text-align:center"><p class="mu" id="rd" style="margin:0"></p>'
   +'<div id="pb" style="font-size:84px;font-weight:800;min-height:120px;line-height:120px"></div>'
   +'<p class="big" id="msg" style="margin:0"></p>'
   +'<div style="height:12px;background:var(--bd);border-radius:6px;overflow:hidden;margin:10px 0"><div id="bf" style="height:100%;width:0;background:var(--pr)"></div></div>'
   +'<div style="display:flex;gap:10px">'+Array.from({length:c.n},(_,t)=>'<div style="flex:1;min-width:0;border:2px solid '+COL[t]+';border-radius:12px;padding:8px">'
    +'<b style="color:'+COL[t]+'">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span>'
    +'<div style="font-size:44px;font-weight:800;line-height:1.1" id="ok'+t+'">0 / '+size[t]+'</div><div class="mu" style="font-size:13px">맞힌 사람</div>'
    +'<div class="mu" id="sb'+t+'" style="font-size:13px;margin-top:4px"></div><div class="mu" id="av'+t+'" style="font-size:13px"></div></div>').join('')+'</div></div>';
  const q=s=>c.el.querySelector(s);
  const T=(id,t)=>{const e=q(id);if(e&&e.textContent!==t)e.textContent=t};
  const cards=()=>{
   const tot=Array.from({length:c.n},(_,t)=>mem.filter(p=>p.team===t).reduce((a,p)=>a+(cnt[p.id]||0),0)/(size[t]||1));
   const mx=Math.max(...tot);
   for(let t=0;t<c.n;t++){
    const ms=mem.filter(p=>p.team===t);
    T('#ok'+t,ms.filter(p=>okSet[p.id]).length+' / '+size[t]);
    T('#sb'+t,'제출 '+ms.filter(p=>ans[p.id]!==undefined).length+' / '+size[t]+'명');
    T('#av'+t,'누적 평균 '+tot[t].toFixed(1)+'개');
    T('#cr'+t,(mx>0&&tot[t]===mx&&tot.filter(x=>x===mx).length===1)?'👑':'');
   }
  };
  const reveal=()=>{
   mem.forEach(p=>{if(okSet[p.id])cnt[p.id]=(cnt[p.id]||0)+1});
   phase='reveal';T('#pb',prob.q+' = '+prob.a);
   T('#msg','정답! '+Object.keys(okSet).length+' / '+mem.length+'명 맞혔어요');q('#bf').style.width='100%';
   const okmap={};mem.forEach(p=>okmap[p.id]=!!okSet[p.id]);
   c.set(pub({ans:String(prob.a),ok:okmap}));cards();
   c.after(next,REVEAL);
  };
  const close=()=>{
   if(!open)return;open=false;
   phase='judging';dl=NOW()+JUDGE;curSpan=JUDGE;
   T('#msg','🔍 정답 공개까지…');q('#bf').style.width='0%';T('#pb','?');
   c.set(pub({dl}));
   c.after(reveal,JUDGE);
  };
  const next=()=>{
   round++;
   if(round>=ROUNDS){phase='end';open=false;T('#pb','🎉');T('#msg','끝! 결과 공개를 누르세요');T('#rd','');q('#bf').style.width='100%';c.set(pub({end:true}));cards();return}
   prob=gen(round);ans={};okSet={};
   T('#rd','문제 '+(round+1)+' / '+ROUNDS+(prob.q.indexOf('×')>=0?' · 곱셈':' · 덧셈'));
   phase='count';dl=NOW()+COUNT;curSpan=COUNT;T('#pb',String(Math.ceil(COUNT/1000)));T('#msg','곧 문제가 나와요! 집중하세요 👀');q('#bf').style.width='0%';
   c.set(pub({dl}));cards();
   c.after(()=>{
    phase='ask';open=true;dl=NOW()+prob.ms;curSpan=prob.ms;
    T('#pb',prob.q+' = ?');T('#msg','암산으로 풀어 폰에 입력하세요!');
    c.set(pub(SHOW_ON_PHONE?{dl,q:prob.q}:{dl}));
    tAsk=c.after(close,prob.ms+700);
   },COUNT);
  };
  cards();
  let pre=PRE;T('#msg','시작까지 '+pre+'초');
  const tk=c.every(()=>{pre--;if(pre>0){T('#msg','시작까지 '+pre+'초');return}clearInterval(tk);next()},1000);
  c.every(()=>{
   const left=dl-NOW();
   if(phase==='ask'&&open)q('#bf').style.width=Math.max(0,Math.min(100,100-left/curSpan*100))+'%';
   else if(phase==='count'||phase==='judging'){T('#pb',phase==='count'?String(Math.max(1,Math.ceil(left/1000))):'?');q('#bf').style.width=Math.max(0,Math.min(100,100-left/curSpan*100))+'%'}
  },100);
  c.onResults(rs=>rs.forEach(r=>{
   if(typeof r.k!=='number'||r.r==null||r.k<=(seen[r.uid]||0))return;
   seen[r.uid]=r.k;
   if(!open||r.r!==round||ans[r.uid]!==undefined||!mem.some(p=>p.id===r.uid))return;     // 한 문제에 한 번만 인정
   const a=String(r.ans==null?'':r.ans).trim();ans[r.uid]=a;
   if(a!==''&&Number(a)===prob.a)okSet[r.uid]=true;
   cards();
   if(mem.every(p=>ans[p.id]!==undefined)){clearTimeout(tAsk);c.after(close,300)}        // 모두 제출하면 바로 마감
  }));
 },

 /* ---- 참가자 화면: 답 입력 ---- */
 run(c){
  let g=null,k=0,sent=false,lastLiveR=-1;const mine={};
  const myScore=()=>((g&&g.cnt&&g.cnt[c.uid])||0)*10;          // 진행자 화면의 실시간 랭킹용: 지금까지 맞힌 개수 × 10
  c.ga.innerHTML='<div id="bx"></div>';
  c.live(0);
  const submit=()=>{
   const el=$('#an');if(!g||g.ph!=='ask'||mine[g.r]!==undefined)return;
   const a=el?el.value.trim():'';mine[g.r]=a;k++;c.live(myScore(),{r:g.r,ans:a,k});
   try{navigator.vibrate(30)}catch(x){}
   draw();
  };
  const draw=()=>{
   const b=$('#bx');if(!b)return;
   if(!g||g.r<0){b.innerHTML='<p class="mu" style="text-align:center">곧 시작합니다. 진행자 화면을 보세요!</p>';return}
   const head='<p class="mu" style="text-align:center">문제 '+(g.r+1)+' · 지금까지 '+((g.cnt&&g.cnt[c.uid])||0)+'개 맞힘</p>';
   if(g.ph==='count'){b.innerHTML=head+'<p class="big">🔔</p><p class="mu" style="text-align:center">곧 문제가 나와요! 진행자 화면을 보세요</p><p class="big" id="cdn" style="font-size:56px"></p>';return}
   if(g.ph==='judging'){b.innerHTML=head+'<p class="big">🔍</p><p class="mu" style="text-align:center">정답 공개까지…</p><p class="big" id="cdn" style="font-size:56px"></p>';return}
   if(g.ph==='ask'){
    if(mine[g.r]!==undefined){b.innerHTML=head+'<p class="big">✓</p><p class="mu" style="text-align:center">제출했어요: '+esc(mine[g.r])+'<br>다른 친구를 기다리는 중…</p>';return}
    b.innerHTML=head+(g.q?'<p class="big" style="font-size:34px">'+esc(g.q)+' = ?</p>':'<p class="mu" style="text-align:center">진행자 화면의 문제를 암산으로 풀어요!</p>')
     +'<input id="an" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" placeholder="정답" style="font-size:32px;text-align:center"><button class="p w" id="sb" style="padding:16px;font-size:20px">제출</button><p class="mu" id="cd" style="text-align:center"></p>';
    const el=$('#an');el.focus();$('#sb').onclick=submit;el.onkeydown=e=>{if(e.key==='Enter')submit()};
    return;
   }
   if(g.ph==='reveal'){
    const a=mine[g.r],ok=g.ok&&g.ok[c.uid];
    b.innerHTML=head+'<p class="mu" style="text-align:center;margin:0">정답</p><p class="big" style="margin:0">'+esc(g.ans)+'</p>'
     +'<p class="big" style="font-size:26px">'+(a===undefined?'제출하지 않았어요':ok?'✔ 맞았어요!':'✘ 틀렸어요 ('+esc(a)+')')+'</p>';
    return;
   }
  };
  const finish=()=>{if(sent)return;sent=true;c.stop();c.submit(((g&&g.cnt&&g.cnt[c.uid])||0)*10)};
  let wj='';c.watch(gg=>{const j=JSON.stringify(gg);if(j===wj)return;wj=j;   // 같은 데이터가 다시 와도 화면을 다시 그리지 않음(입력 중인 값 보호)
   g=gg;if(g&&g.end){finish();return}
   if(g&&g.ph==='reveal'&&lastLiveR!==g.r){lastLiveR=g.r;c.live(myScore(),{r:g.r,ans:mine[g.r]==null?'':mine[g.r],k})}    // 정답 공개 때마다 내 점수 갱신
   draw()});
  c.every(()=>{
   if(g&&(g.ph==='count'||g.ph==='judging')&&g.dl){const e=$('#cdn');if(e)e.textContent=Math.max(1,Math.ceil((g.dl-NOW())/1000))}
   if(!g||g.ph!=='ask'||!g.dl)return;
   const left=g.dl-NOW(),cd=$('#cd');
   if(cd)cd.textContent='남은 시간 '+Math.max(0,Math.ceil(left/1000))+'초';
   if(left<=0&&mine[g.r]===undefined)submit();                 // 시간이 끝나면 입력한 값을 자동 제출
  },200);
 }
});
})();
