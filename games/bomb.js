/* 폭탄 돌리기: 상대 팀 참가자에게 폭탄을 넘기고 폭발 시 보유 팀의 횟수를 기록하는 게임. */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
const COL=['#e24b4a','#378add','#c98f00','#2f9e55'];
const TN=['빨강','파랑','노랑','초록'];
const teamName=t=>TN[t]||('팀 '+(t+1));
const teamColor=t=>COL[t]||'#6b7280';
const fmtTime=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
registerGame({
 id:'bomb',
 order:23,
 name:'폭탄 돌리기',
 story:'AI가 경기장 곳곳에 시간제 폭탄을 숨겼습니다. 팀원들과 힘을 합쳐 폭탄을 상대 팀에게 넘기고, 제한시간이 끝나기 전에 우리 팀에서 멀리 보내세요!',
 desc:'진행자가 폭탄 시간과 라운드 수를 정합니다. 폭탄을 가진 참가자는 화면에 표시된 다른 팀 참가자의 이름을 눌러 폭탄을 넘깁니다. 시간이 끝날 때 폭탄을 가진 팀에 폭발 1회가 기록되며, 폭발 횟수가 적은 팀이 유리합니다.',
 hi:false,
 fmt:v=>v+'회 폭발',

 host(c){
  const roster=c.players.map(p=>({id:p.id,name:p.name,team:p.team}));
  const teams=new Set(roster.map(p=>p.team));
  if(teams.size<2||roster.length<2){c.el.innerHTML='<p>폭탄을 주고받으려면 참가자가 있고 팀이 2개 이상이어야 합니다.</p>';return}
  let state=null,ended=false;
  const rosterIndex=new Map(roster.map((p,i)=>[p.id,i]));
  const initial=()=>{
   c.el.innerHTML='<div style="max-width:520px;margin:auto;text-align:center"><p class="big">💣 폭탄 돌리기 설정</p><label>폭탄 제한시간(초) <input id="fuse" type="number" min="5" max="180" value="30" style="width:90px"></label><br><br><label>반복 라운드 수 <input id="rounds" type="number" min="1" max="20" value="3" style="width:90px"></label><br><br><button id="start" style="height:48px;font-size:20px">게임 시작</button><p class="mu">시간이 끝날 때 폭탄을 가진 팀마다 폭발 1회가 기록됩니다.</p></div>';
   c.el.querySelector('#start').onclick=()=>{
    const fuse=Math.max(5,Math.min(180,Number(c.el.querySelector('#fuse').value)||30))*1000;
    const rounds=Math.max(1,Math.min(20,Math.floor(Number(c.el.querySelector('#rounds').value)||3)));
    const first=roster[Math.floor(Math.random()*roster.length)];
    state={phase:'running',players:roster,fuse,rounds,round:1,ver:1,holder:first,startedAt:NOW(),endsAt:NOW()+fuse,penalties:Array(c.n).fill(0),history:[]};
    ended=false;c.set(state);drawHost();
   };
  };
  const drawHost=()=>{
   if(!state)return;
   const boom=state.phase==='exploded';
   const running=state.phase==='running';
   c.el.innerHTML='<style>@keyframes bombPulse{0%{transform:scale(.94) rotate(-4deg);filter:brightness(.85)}100%{transform:scale(1.08) rotate(4deg);filter:brightness(1.25)}} .bombPulse{display:inline-block;animation:bombPulse .45s infinite alternate}</style>'
    +'<div style="text-align:center"><p class="big" style="margin:0">폭탄 돌리기 · '+state.round+' / '+state.rounds+' 라운드</p>'
    +'<div id="bombIcon" class="bombPulse" style="font-size:64px;margin:4px">💣<span style="font-size:30px">🔥</span></div>'
    +'<p id="clock" style="font-size:36px;font-weight:800;margin:0"></p>'
    +'<div style="height:14px;background:var(--bd);border-radius:8px;overflow:hidden;margin:5px auto 10px;max-width:420px"><div id="burn" style="height:100%;width:100%;background:linear-gradient(90deg,#e24b4a,#ffbb33);transition:width .15s"></div></div>'
    +'<p id="holder" class="big" style="margin:4px 0;color:'+teamColor(state.holder.team)+'">'+teamName(state.holder.team)+' 팀 · '+esc(state.holder.name)+'</p>'
    +'<p id="phase" class="mu">'+(running?'폭탄이 타고 있어요!':'💥 폭발! 폭탄을 가진 참가자와 팀을 확인하세요.')+'</p>'
    +(boom?'<p class="big">이번 폭발: <span style="color:'+teamColor(state.holder.team)+'">'+teamName(state.holder.team)+' 팀</span> '+esc(state.holder.name)+'</p>':'')
    +'<div id="scores" style="margin:12px auto;max-width:420px">'+state.penalties.map((v,t)=>'<div style="display:flex;justify-content:space-between;padding:5px;border-bottom:1px solid var(--bd);color:'+teamColor(t)+'"><b>'+teamName(t)+' 팀</b><span>'+v+'회 폭발</span></div>').join('')+'</div>'
    +(boom?'<button id="next" style="height:48px;font-size:18px">'+(state.round<state.rounds?'다음 라운드':'결과 확정')+'</button>':'')
    +'</div>';
   updateClock();
   if(boom)c.el.querySelector('#next').onclick=()=>{
    if(state.round>=state.rounds){state={...state,phase:'end',sc:state.penalties.slice()};ended=true;c.set(state);drawHost();return}
    const prev=state.holder.id,choices=roster.filter(p=>p.id!==prev),first=choices[Math.floor(Math.random()*choices.length)];
    state={...state,phase:'running',round:state.round+1,ver:state.ver+1,holder:first,startedAt:NOW(),endsAt:NOW()+state.fuse};c.set(state);drawHost();
   };
   if(state.phase==='end'){
    const e=c.el.querySelector('#phase');if(e)e.textContent='게임 종료 · 폭발 횟수가 적은 팀이 유리합니다. 결과를 공개하세요.';
    const b=c.el.querySelector('#bombIcon');if(b){b.classList.remove('bombPulse');b.textContent='🏁'}
   }
  };
  const updateClock=()=>{
   if(!state)return;
   const clock=c.el.querySelector('#clock');
   const bar=c.el.querySelector('#burn');
   if(clock)clock.textContent=state.phase==='running'?fmtTime(state.endsAt-NOW()):state.phase==='exploded'?'00:00':'완료';
   if(bar){const pct=state.phase==='running'?Math.max(0,Math.min(100,(state.endsAt-NOW())/state.fuse*100)):0;bar.style.width=pct+'%'}
  };
  const lastSeq={};
  c.onResults(rs=>{
   if(!state||state.phase!=='running')return;
   for(const r of rs){
    if(typeof r.v!=='number'||r.v<=(lastSeq[r.uid]||0))continue;
    lastSeq[r.uid]=r.v;
    if(r.uid!==state.holder.id||r.round!==state.round||r.ver!==state.ver)continue;
    const to=rosterIndex.get(r.to),target=to==null?null:roster[to];
    if(!target||target.team===state.holder.team)continue;
    state={...state,holder:target,ver:state.ver+1};c.set(state);drawHost();break;
   }
  });
  c.every(()=>{
   if(!state){return}
   if(state.phase==='running'&&NOW()>=state.endsAt){
    state.penalties[state.holder.team]=(state.penalties[state.holder.team]||0)+1;
    state={...state,phase:'exploded'};c.set(state);drawHost();return;
   }
   updateClock();
  },100);
  initial();
 },

 run(c){
  c.ready(()=>{
   let g=null,seq=0,sent=false,pending=false,pendingAt=0;
   c.ga.style.touchAction='none';c.ga.style.userSelect='none';c.ga.style.webkitUserSelect='none';
   c.watch(gg=>{g=gg;draw();if(g&&g.phase==='end'&&!sent){sent=true;c.stop();c.submit(g.sc[c.team]||0)}});
   const me=()=>g&&g.players.find(p=>p.id===c.uid);
   const owned=()=>!!(g&&g.phase==='running'&&g.holder&&g.holder.id===c.uid&&NOW()>=g.startedAt&&NOW()<g.endsAt&&!pending);
   const draw=()=>{
    if(!g){c.ga.innerHTML='<p class="mu">진행자가 게임을 시작하면 화면에 폭탄이 표시됩니다.</p>';return}
    const mine=g.phase==='running'&&g.holder.id===c.uid;
    const targets=g.players.map((p,i)=>({p,i})).filter(x=>x.p.team!==c.team);
    const status=g.phase==='end'?'게임이 끝났어요.':g.phase==='exploded'?'💥 폭탄이 터졌어요! 다음 라운드를 기다리세요.':mine?(pending?'폭탄 전달 중…':'내가 폭탄을 들고 있어요. 다른 팀 이름을 눌러 넘기세요.'):'폭탄 보유자: '+teamName(g.holder.team)+' 팀 · '+g.holder.name;
    c.ga.innerHTML='<style>@keyframes bombPulse{0%{transform:scale(.92) rotate(-5deg)}100%{transform:scale(1.08) rotate(5deg)}} .bombPulse{display:inline-block;animation:bombPulse .45s infinite alternate}</style>'
     +'<div style="text-align:center"><p class="big" style="margin:0">폭탄 돌리기 · '+g.round+' / '+g.rounds+' 라운드</p>'
     +'<div id="pBomb" class="bombPulse" style="font-size:58px;margin:5px">💣<span style="font-size:27px">🔥</span></div>'
     +'<p id="pClock" style="font-size:34px;font-weight:800;margin:0"></p>'
     +'<div style="height:14px;background:var(--bd);border-radius:8px;overflow:hidden;margin:5px 8px 10px"><div id="burn" style="height:100%;width:100%;background:linear-gradient(90deg,#e24b4a,#ffbb33);transition:width .15s"></div></div>'
     +'<p id="pStatus" class="big" style="font-size:18px">'+esc(status)+'</p>'
     +'<div id="targets" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">'
     +targets.map(x=>'<button data-to="'+x.i+'" '+(!owned()?'disabled':'')+' style="min-height:54px;font-size:16px;border:2px solid '+teamColor(x.p.team)+';border-radius:10px;opacity:'+(owned()?1:.65)+'">'+teamName(x.p.team)+'<br>'+esc(x.p.name)+'</button>').join('')
     +'</div><p class="mu">다른 팀 참가자 이름을 눌러 폭탄을 전달하세요.</p></div>';
    updatePlayerClock();
   };
   const updatePlayerClock=()=>{
    if(!g)return;
    const clock=c.ga.querySelector('#pClock'),bar=c.ga.querySelector('#burn'),bomb=c.ga.querySelector('#pBomb');
    if(g.phase==='running'){
     const left=Math.max(0,g.endsAt-NOW());if(clock)clock.textContent=fmtTime(left);
     if(bar)bar.style.width=Math.max(0,Math.min(100,left/g.fuse*100))+'%';
     if(bomb)bomb.style.filter='hue-rotate('+(Math.max(0,1-left/g.fuse)*35)+'deg)';
    }else{if(clock)clock.textContent=g.phase==='exploded'?'💥 00:00':'완료';if(bar)bar.style.width='0%'}
   };
   const pass=e=>{
    const b=e.target.closest&&e.target.closest('[data-to]');if(!b)return;
    e.preventDefault();if(!owned())return;
    const to=Number(b.dataset.to),target=g.players[to];if(!target||target.team===c.team)return;
    pending=true;pendingAt=performance.now();
    c.live(++seq,{to:target.id,round:g.round,ver:g.ver});
    const s=c.ga.querySelector('#pStatus');if(s)s.textContent='폭탄을 '+target.name+'에게 전달 중…';
    c.ga.querySelectorAll('[data-to]').forEach(x=>x.disabled=true);
   };
   c.ga.addEventListener('pointerdown',pass,{passive:false});
   c.every(()=>{
    if(pending&&g&&g.holder&&g.holder.id!==c.uid)pending=false;
    else if(pending&&performance.now()-pendingAt>1200){pending=false;draw()}
    if(g){updatePlayerClock();if(pending&&g.holder&&g.holder.id===c.uid){const s=c.ga.querySelector('#pStatus');if(s)s.textContent='아직 전달되지 않았어요. 이름을 다시 눌러 주세요.'}}
   },100);
  });
 }
});
})();
