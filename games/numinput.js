/* 숫자 입력 게임: 진행자 화면에 잠깐 나온 숫자를 기억했다가, 입력창이 열리면 정확히 입력하는 게임 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
registerGame({
 id:'numinput',
 order:16,
 name:'숫자 입력 게임',
 desc:'진행자 화면에 숫자가 잠깐 나타났다 사라집니다. 잠시 뒤 내 폰에 입력창이 열리면 방금 본 숫자를 정확히 입력하세요. 8라운드를 하며 숫자는 점점 길어집니다. 한 자리라도 틀리면 오답이고, 팀원 평균으로 정답을 많이 맞힌 팀이 승리합니다. (높을수록 좋음)',
 hi:true,
 fmt:v=>(v/10).toFixed(1)+'개 정답',

 /* ---- 진행자 화면: 숫자 보여주기 → 숨기기 → 입력 → 정답 공개 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const ROUNDS=8,PRE=6,GAP=1500,INPUT=10000,REVEAL=3000;     // 라운드 수, 시작 전(초), 숨김(ms), 입력 시간(ms), 정답 공개(ms)
  const lenOf=r=>3+Math.floor(r/2);                          // 3,3,4,4,5,5,6,6자리
  const showMs=len=>1000+len*350;                            // 숫자가 보이는 시간
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const mem=c.players.filter(p=>p.team!=null&&p.team<c.n);
  const cnt={},seen={};mem.forEach(p=>cnt[p.id]=0);
  const ans={};let round=-1,num='',phase='wait',open=false,dl=0,tIn=0;
  const pub=x=>Object.assign({r:round,ph:phase,len:num.length,cnt:Object.assign({},cnt),end:false},x||{});
  c.el.innerHTML='<div style="text-align:center"><p class="mu" id="rd" style="margin:0"></p>'
   +'<div id="nm" style="font-size:88px;font-weight:800;letter-spacing:8px;min-height:120px;line-height:120px"></div>'
   +'<p class="big" id="msg" style="margin:0"></p>'
   +'<div style="height:14px;background:var(--bd);border-radius:7px;overflow:hidden;margin:12px 0"><div id="bf" style="height:100%;width:0;background:var(--pr)"></div></div>'
   +'<div id="tb" style="text-align:left"></div></div>';
  const q=s=>c.el.querySelector(s);
  const T=(id,t)=>{const e=q(id);if(e)e.textContent=t};
  const bars=()=>{const h=Array.from({length:c.n},(_,t)=>{const m=mem.filter(p=>p.team===t),sum=m.reduce((a,p)=>a+(cnt[p.id]||0),0),av=m.length?sum/m.length:0;
    return '<div style="margin:6px 0"><b style="color:'+COL[t]+'">'+TN[t]+'</b> <span class="mu">평균 '+av.toFixed(1)+'개 정답</span><div style="height:12px;background:var(--bd);border-radius:6px"><div style="height:100%;width:'+Math.min(100,av/ROUNDS*100)+'%;background:'+COL[t]+';border-radius:6px"></div></div></div>'}).join('');
    const e=q('#tb');if(e)e.innerHTML=h};
  const submitted=()=>Object.keys(ans[round]||{}).length;
  const judge=()=>{
   if(!open)return;open=false;
   const ok={};mem.forEach(p=>{const a=(ans[round]||{})[p.id];const g=a!==undefined&&a.trim()===num;ok[p.id]=g;if(g)cnt[p.id]=(cnt[p.id]||0)+1});
   phase='reveal';T('#nm',num);
   const n=Object.values(ok).filter(Boolean).length;
   T('#msg','정답! '+n+' / '+mem.length+'명 맞혔어요');q('#bf').style.width='100%';
   c.set(pub({ans:num,ok}));bars();
   c.after(next,REVEAL);
  };
  const next=()=>{
   round++;
   if(round>=ROUNDS){phase='end';open=false;T('#nm','🎉');T('#msg','끝! 결과 공개를 누르세요');T('#rd','');q('#bf').style.width='100%';c.set(pub({end:true}));bars();return}
   const len=lenOf(round);num=String(1+Math.floor(Math.random()*9));for(let i=1;i<len;i++)num+=Math.floor(Math.random()*10);
   phase='show';T('#rd','라운드 '+(round+1)+' / '+ROUNDS+' · '+len+'자리');T('#nm',num);T('#msg','숫자를 기억하세요! 👀');q('#bf').style.width='0%';
   c.set(pub());
   c.after(()=>{
    phase='gap';T('#nm','·  ·  ·');T('#msg','잠깐… 기억하세요');c.set(pub());
    c.after(()=>{
     phase='input';open=true;dl=NOW()+INPUT;T('#nm','❓');T('#msg','입력하세요!');c.set(pub({dl}));
     tIn=c.after(judge,INPUT+700);
    },GAP);
   },showMs(len));
  };
  bars();
  let pre=PRE;T('#msg','시작까지 '+pre+'초');
  const tk=c.every(()=>{pre--;if(pre>0){T('#msg','시작까지 '+pre+'초');return}clearInterval(tk);next()},1000);
  c.every(()=>{if(phase==='input'&&open){const left=dl-NOW();q('#bf').style.width=Math.max(0,Math.min(100,100-left/INPUT*100))+'%'}},100);
  c.onResults(rs=>rs.forEach(r=>{
   if(typeof r.k!=='number'||r.r==null||r.k<=(seen[r.uid]||0))return;
   seen[r.uid]=r.k;
   if(open&&r.r===round){(ans[round]=ans[round]||{})[r.uid]=String(r.ans==null?'':r.ans);
    if(submitted()>=mem.length){clearTimeout(tIn);c.after(judge,300)}}      // 모두 제출하면 바로 마감
  }));
 },

 /* ---- 참가자 화면: 입력창에 숫자 입력 ---- */
 run(c){
  let g=null,k=0,sent=false;const mine={};
  c.ga.innerHTML='<div id="bx"></div>';
  c.live(0);
  const box=()=>$('#bx');
  const submit=()=>{
   const el=$('#an');if(!g||g.ph!=='input'||mine[g.r]!==undefined)return;
   const a=el?el.value.trim():'';mine[g.r]=a;k++;c.live(0,{r:g.r,ans:a,k});
   try{navigator.vibrate(30)}catch(x){}
   draw();
  };
  const draw=()=>{
   const b=box();if(!b)return;
   if(!g||g.r<0){b.innerHTML='<p class="mu" style="text-align:center">진행자 화면의 숫자를 잘 보세요!</p>';return}
   const head='<p class="mu" style="text-align:center">라운드 '+(g.r+1)+' · 지금까지 '+((g.cnt&&g.cnt[c.uid])||0)+'개 맞힘</p>';
   if(g.ph==='show'){b.innerHTML=head+'<p class="big">👀</p><p class="mu" style="text-align:center">진행자 화면의 숫자를 기억하세요! ('+g.len+'자리)</p>';return}
   if(g.ph==='gap'){b.innerHTML=head+'<p class="big">🤔</p><p class="mu" style="text-align:center">곧 입력창이 열려요…</p>';return}
   if(g.ph==='input'){
    if(mine[g.r]!==undefined){b.innerHTML=head+'<p class="big">✓</p><p class="mu" style="text-align:center">제출했어요: '+esc(mine[g.r])+'<br>다른 친구를 기다리는 중…</p>';return}
    b.innerHTML=head+'<input id="an" inputmode="numeric" pattern="[0-9]*" maxlength="'+g.len+'" autocomplete="off" placeholder="'+g.len+'자리 숫자" style="font-size:32px;text-align:center;letter-spacing:6px"><button class="p w" id="sb" style="padding:16px;font-size:20px">제출</button><p class="mu" id="cd" style="text-align:center"></p>';
    const el=$('#an');el.focus();$('#sb').onclick=submit;el.onkeydown=e=>{if(e.key==='Enter')submit()};
    return;
   }
   if(g.ph==='reveal'){
    const a=mine[g.r],ok=g.ok&&g.ok[c.uid];
    b.innerHTML=head+'<p class="mu" style="text-align:center;margin:0">정답</p><p class="big" style="letter-spacing:6px;margin:0">'+g.ans+'</p>'
     +'<p class="big" style="font-size:26px">'+(a===undefined?'제출하지 않았어요':ok?'✔ 맞았어요!':'✘ 틀렸어요 ('+esc(a)+')')+'</p>';
    return;
   }
  };
  const finish=()=>{if(sent)return;sent=true;c.stop();c.submit(((g&&g.cnt&&g.cnt[c.uid])||0)*10)};
  c.watch(gg=>{g=gg;if(g&&g.end){finish();return}draw()});
  c.every(()=>{
   if(!g||g.ph!=='input'||!g.dl)return;
   const left=g.dl-NOW(),cd=$('#cd');
   if(cd)cd.textContent='남은 시간 '+Math.max(0,Math.ceil(left/1000))+'초';
   if(left<=0&&mine[g.r]===undefined)submit();                 // 시간이 끝나면 입력한 값을 자동 제출
  },200);
 }
});
})();
