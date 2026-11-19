/* 별칭 빨리 누르기: 진행자 화면의 이름 순서대로, 자기 이름 차례에 자기 폰에서 이름을 누르는 팀 게임 */
registerGame({
 id:'nickname',
 order:14,
 name:'별칭 빨리 누르기',
 story:"AI가 우리 팀의 암호명을 하나씩 호출합니다. 내 암호명이 불리는 순간 내 폰에서 내 이름을 눌러 응답해야 합니다. 순서가 엉키면 AI가 암호를 더 길게 만들어 버립니다. 팀의 호흡이 중요합니다!",
 desc:'진행자 화면에 팀별 이름이 순서대로 나옵니다. 내 이름(★)이 맨 앞에 오면 내 폰에서 내 이름을 누르세요. 맞으면 화면에서 이름이 지워지고, 다른 이름을 누르거나 순서가 아닐 때 누르면 이름이 하나 더 늘어납니다. 1분 안에 팀이 모든 이름을 지우면 성공이며, 빠를수록 높은 순위입니다. (팀 인원이 다르면 가장 적은 팀의 인원수만큼만 참여하고 나머지는 응원합니다)',
 hi:true,
 fmt:v=>v>=100000?'성공 · 남은 '+((v-100000)/100).toFixed(1)+'초':Math.floor(v/1000)+'개 지움',

 /* ---- 진행자 화면 ---- */
 host(c){
  const LIMIT=60,PRE=5,MAXPEN=6;            // 제한 시간(초), 시작 전 준비(초), 틀렸을 때 늘어나는 이름 최대 수
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const shuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
  const teams=[];for(let t=0;t<c.n;t++)teams.push(c.players.filter(p=>p.team===t));
  const K=Math.min(...teams.map(m=>m.length));
  if(!(K>=1)){c.el.innerHTML='<p>모든 팀에 참가자가 1명 이상 있어야 합니다. 대기실에서 팀을 다시 배정하세요.</p>';return}
  const st=teams.map(m=>{const mem=shuf(m).slice(0,K).map(p=>({id:p.id,n:p.name}));return{m:mem,seq:shuf(mem.map((_,i)=>i)),i:0,pen:0,done:false,at:0}});
  let started=false,ended=false,t0=0;const seen={};
  const pub=()=>({started,end:ended,teams:st.map(s=>({m:s.m,seq:s.seq,i:s.i,pen:s.pen,done:s.done,sc:s.done?100000+Math.max(0,Math.round((LIMIT*1000-s.at)/10)):s.i*1000}))});
  let head='곧 시작…';
  const draw=()=>{
   let h='<p class="big" id="hl">'+head+'</p>';
   st.forEach((s,t)=>{
    h+='<div style="border:2px solid '+COL[t]+';border-radius:12px;padding:10px;margin:8px 0"><b style="color:'+COL[t]+'">'+TN[t]+' 팀</b> <span class="mu">'+Math.min(s.i,s.seq.length)+'/'+s.seq.length+(s.pen?' · 추가 +'+s.pen:'')+'</span><div>';
    if(s.done)h+='<span style="font-size:22px">✔ 성공! '+(s.at/1000).toFixed(1)+'초</span>';
    else if(started)h+=s.seq.slice(s.i).map((x,j)=>'<span style="display:inline-block;margin:3px;padding:'+(j?'4px 10px':'10px 18px')+';border-radius:99px;background:'+(j?'var(--bg)':COL[t])+';color:'+(j?'var(--tx)':'#fff')+';font-size:'+(j?16:28)+'px;font-weight:700;border:1px solid var(--bd)">'+esc(s.m[x].n)+'</span>').join('')+(ended?' <span class="mu">시간 종료</span>':'');
    else h+='<span class="mu">'+s.m.length+'명 참가</span>';
    h+='</div></div>';
   });
   c.el.innerHTML=h;
  };
  const setHead=t=>{head=t;const e=c.el.querySelector('#hl');if(e)e.textContent=t};
  const finish=()=>{if(ended)return;ended=true;setHead('끝!');c.set(pub());draw()};
  c.set(pub());draw();
  let pre=PRE;setHead('시작까지 '+pre+'초');
  const tk=c.every(()=>{pre--;if(pre>0){setHead('시작까지 '+pre+'초');return}
   clearInterval(tk);started=true;t0=performance.now();c.set(pub());setHead(LIMIT+'초');draw();
   c.every(()=>{if(ended)return;const left=LIMIT-(performance.now()-t0)/1000;if(left<=0){finish();return}setHead(Math.ceil(left)+'초')},250);
  },1000);
  c.onResults(rs=>{
   if(!started||ended)return;
   let ch=false;
   rs.filter(r=>r.k>(seen[r.uid]||0)).sort((a,b)=>(a.at||0)-(b.at||0)).forEach(r=>{
    seen[r.uid]=r.k;
    const s=st[r.team];if(!s||s.done)return;
    if(s.m.findIndex(x=>x.id===r.uid)<0)return;
    const cur=s.m[s.seq[s.i]];
    if(cur.id===r.uid&&r.pn===cur.n){s.i++;if(s.i>=s.seq.length){s.done=true;s.at=performance.now()-t0}}
    else if(s.pen<MAXPEN){s.pen++;s.seq.push(Math.floor(Math.random()*s.m.length))}
    ch=true;
   });
   if(ch){if(st.every(s=>s.done))finish();else{c.set(pub());draw()}}
  });
 },

 /* ---- 참가자 화면 ---- */
 run(c){
  let g=null,k=0,lock=0,pi=0,pp=0,msg='',sent=false;
  const draw=()=>{
   if(!g){c.ga.innerHTML='<p class="mu" style="text-align:center">진행자 화면을 보세요. 곧 시작합니다.</p>';return}
   const t=g.teams&&g.teams[c.team];
   if(!t){c.ga.innerHTML='<p class="mu">팀 정보를 찾을 수 없어요.</p>';return}
   const me=t.m.findIndex(x=>x.id===c.uid);
   if(me<0){c.ga.innerHTML='<p class="big">쉬는 중</p><p class="mu" style="text-align:center">팀 인원이 더 많아 이번 판은 쉽니다. 진행자 화면에서 응원하세요!</p>';return}
   const total=t.seq.length;
   c.ga.innerHTML='<p class="mu" style="text-align:center">'+(g.end?'끝났어요':g.started?'내 이름(★)이 맨 앞에 오면 누르세요!':'곧 시작합니다')+'</p>'
    +'<p class="mu" style="text-align:center;margin:0">우리 팀 '+Math.min(t.i,total)+' / '+total+(t.pen?' (틀려서 +'+t.pen+')':'')+'</p>'
    +'<p class="big" style="font-size:22px;height:32px;margin:6px 0">'+msg+'</p>'
    +t.m.map((x,j)=>'<button data-j="'+j+'" class="'+(j===me?'p':'')+'" style="width:100%;margin:6px 0;padding:18px;font-size:20px">'+(j===me?'★ ':'')+esc(x.n)+'</button>').join('');
   c.ga.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{
    if(!g.started||g.end||Date.now()<lock)return;
    lock=Date.now()+450;k++;
    c.live(0,{k,pn:t.m[+b.dataset.j].n,at:Date.now()});
    try{navigator.vibrate(30)}catch(x){}
    c.ga.querySelectorAll('[data-j]').forEach(z=>z.style.opacity='.4');
    c.after(()=>c.ga.querySelectorAll('[data-j]').forEach(z=>z.style.opacity=''),450);
   });
  };
  c.live(0);
  c.watch(gg=>{
   g=gg;
   const t=g&&g.teams&&g.teams[c.team];
   if(t){
    if(t.pen>pp)msg='✘ 틀렸어요! 이름이 늘었어요';
    else if(t.i>pi)msg='✔ 맞았어요!';
    pp=t.pen;pi=t.i;
    if(g.end&&!sent&&t.m.findIndex(x=>x.id===c.uid)>=0){sent=true;c.submit(t.sc);return}
   }
   draw();
  });
 }
});
