/* 폭탄 돌리기: 상대 팀(또는 설정 시 같은 팀) 참가자에게 폭탄을 넘기고 폭발 시 보유 팀의 횟수를 기록하는 게임. */
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
 desc:'진행자가 폭탄 시간과 라운드 수를 정합니다. 폭탄을 가진 참가자는 화면에 표시된 참가자의 이름을 눌러 폭탄을 넘깁니다. 시간이 끝날 때 폭탄을 가진 팀에 폭발 1회가 기록되며, 폭발 횟수가 적은 팀이 유리합니다.',
 hi:false,
 fmt:v=>v+'회 폭발',

 host(c){
  const roster=c.players.map(p=>({id:p.id,name:p.name,team:p.team}));
  const teams=new Set(roster.map(p=>p.team));
  if(roster.length<2){c.el.innerHTML='<p>폭탄을 주고받으려면 참가자가 2명 이상 있어야 합니다.</p>';return}
  let state=null,ended=false;
  const rosterIndex=new Map(roster.map((p,i)=>[p.id,i]));

  let ac=window.__wac;
  if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  const unlockAudio=()=>{try{ac&&ac.state==='suspended'&&ac.resume()}catch(e){}};
  const playPassSound=()=>{
   if(!ac)return;
   try{
    const o=ac.createOscillator(),g=ac.createGain();
    o.type='triangle';o.frequency.setValueAtTime(520,ac.currentTime);o.frequency.exponentialRampToValueAtTime(780,ac.currentTime+.09);
    g.gain.setValueAtTime(.11,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.1);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.11);
   }catch(e){}
  };
  const playBoomSound=()=>{
   if(!ac)return;
   try{
    const now=ac.currentTime;
    const o=ac.createOscillator(),g=ac.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(150,now);o.frequency.exponentialRampToValueAtTime(36,now+.45);
    g.gain.setValueAtTime(.22,now);g.gain.exponentialRampToValueAtTime(.001,now+.48);
    o.connect(g);g.connect(ac.destination);o.start(now);o.stop(now+.5);

    const bufSize=Math.floor(ac.sampleRate*.35);
    const buf=ac.createBuffer(1,bufSize,ac.sampleRate);
    const data=buf.getChannelData(0);
    for(let i=0;i<bufSize;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/bufSize,1.6);
    const src=ac.createBufferSource(),ng=ac.createGain();
    src.buffer=buf;
    ng.gain.setValueAtTime(.18,now);ng.gain.exponentialRampToValueAtTime(.001,now+.35);
    src.connect(ng);ng.connect(ac.destination);src.start(now);
   }catch(e){}
  };

  const pickHolder=excludeId=>{
   const pool=excludeId!=null?roster.filter(p=>p.id!==excludeId):roster;
   const list=pool.length?pool:roster;
   return list[Math.floor(Math.random()*list.length)];
  };

  const canPassTo=(holder,candidate,allowSameTeam)=>{
   if(!holder||!candidate||candidate.id===holder.id)return false;
   if(!allowSameTeam&&candidate.team===holder.team)return false;
   return true;
  };

  const initial=()=>{
   ended=false;
   const defaultSameTeam=teams.size<2;
   c.el.innerHTML='<div style="max-width:520px;margin:auto;text-align:center">'
    +'<p class="big">💣 폭탄 돌리기 설정</p>'
    +'<label>폭탄 제한시간(초) <input id="fuse" type="number" min="5" max="180" value="30" style="width:90px"></label><br><br>'
    +'<label>반복 라운드 수 <input id="rounds" type="number" min="1" max="20" value="3" style="width:90px"></label><br><br>'
    +'<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer"><input id="sameTeam" type="checkbox" '+(defaultSameTeam?'checked':'')+'> 같은 팀에도 폭탄 전달 허용</label><br><br>'
    +'<button id="start" style="height:48px;font-size:20px">게임 시작</button>'
    +'<p class="mu">시간이 끝날 때 폭탄을 가진 팀마다 폭발 1회가 기록됩니다.</p></div>';
   c.el.querySelector('#start').onclick=()=>{
    unlockAudio();
    const fuse=Math.max(5,Math.min(180,Number(c.el.querySelector('#fuse').value)||30))*1000;
    const rounds=Math.max(1,Math.min(20,Math.floor(Number(c.el.querySelector('#rounds').value)||3)));
    const allowSameTeam=!!c.el.querySelector('#sameTeam').checked;
    if(!allowSameTeam&&teams.size<2){
     alert('다른 팀에게만 전달하려면 팀이 2개 이상이어야 합니다. 같은 팀 전달 허용을 체크해 주세요.');
     return;
    }
    const first=pickHolder(null);
    const now=NOW();
    ended=false;
    state={phase:'running',players:roster,fuse,rounds,round:1,ver:1,allowSameTeam,holder:first,lastFromId:null,startedAt:now,endsAt:now+fuse,penalties:Array(c.n).fill(0),history:[]};
    c.set(state);drawHost();
   };
  };

  const drawHost=()=>{
   if(!state)return;
   const boom=state.phase==='exploded';
   const running=state.phase==='running';
   c.el.innerHTML='<style>@keyframes bombPulse{0%{transform:scale(.94) rotate(-4deg);filter:brightness(.85)}100%{transform:scale(1.08) rotate(4deg);filter:brightness(1.25)}} .bombPulse{display:inline-block;animation:bombPulse .45s infinite alternate}</style>'
    +'<div style="text-align:center"><p class="big" style="margin:0">폭탄 돌리기 · '+state.round+' / '+state.rounds+' 라운드</p>'
    +'<p class="mu" style="margin:2px 0">전달 규칙: '+(state.allowSameTeam?'같은 팀·다른 팀 모두 가능':'다른 팀에만 전달')+' · 직전 발신자 연속 반환 방지</p>'
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
    unlockAudio();
    if(!state||ended)return;
    if(state.round>=state.rounds){
     ended=true;
     state={...state,phase:'end',sc:state.penalties.slice()};
     c.set(state);drawHost();return;
    }
    const first=pickHolder(state.holder.id);
    const now=NOW();
    state={...state,phase:'running',round:state.round+1,ver:state.ver+1,holder:first,lastFromId:null,startedAt:now,endsAt:now+state.fuse};
    c.set(state);drawHost();
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
   const now=NOW();
   if(clock)clock.textContent=state.phase==='running'?fmtTime(state.endsAt-now):state.phase==='exploded'?'00:00':'완료';
   if(bar){const pct=state.phase==='running'?Math.max(0,Math.min(100,(state.endsAt-now)/state.fuse*100)):0;bar.style.width=pct+'%'}
  };

  const lastSeq={};
  c.onResults(rs=>{
   if(!state||ended||state.phase!=='running'||!Array.isArray(rs))return;
   for(const r of rs){
    if(!r||typeof r.v!=='number'||r.v<=(lastSeq[r.uid]||0))continue;
    lastSeq[r.uid]=r.v;
    if(r.uid!==state.holder.id||r.round!==state.round||r.ver!==state.ver)continue;
    if(NOW()>=state.endsAt)continue;
    const to=rosterIndex.get(r.to),target=to==null?null:roster[to];
    if(!canPassTo(state.holder,target,!!state.allowSameTeam))continue;

    const validTargets=roster.filter(p=>canPassTo(state.holder,p,!!state.allowSameTeam));
    const nonPingPongTargets=validTargets.filter(p=>p.id!==state.lastFromId);
    if(state.lastFromId!=null&&target.id===state.lastFromId&&nonPingPongTargets.length>0)continue;

    const prevHolderId=state.holder.id;
    state={...state,holder:target,lastFromId:prevHolderId,ver:state.ver+1};
    playPassSound();
    c.set(state);drawHost();break;
   }
  });

  c.every(()=>{
   if(!state||ended)return;
   if(state.phase==='running'&&NOW()>=state.endsAt){
    const nextPenalties=state.penalties.slice();
    const t=state.holder.team;
    nextPenalties[t]=(nextPenalties[t]||0)+1;
    state={...state,phase:'exploded',penalties:nextPenalties};
    playBoomSound();
    c.set(state);drawHost();return;
   }
   updateClock();
  },100);
  initial();
 },

 run(c){
  c.ready(()=>{
   let g=null,seq=0,sent=false,pending=false,pendingAt=0,lastRound=0,lastVer=0,lastPhase='',lastHolderId='';
   c.ga.style.touchAction='none';c.ga.style.userSelect='none';c.ga.style.webkitUserSelect='none';
   const vibrate=pat=>{try{navigator.vibrate&&navigator.vibrate(pat)}catch(e){}};
   const submitEnd=()=>{
    if(sent||!g||g.phase!=='end')return;
    sent=true;
    const score=Array.isArray(g.sc)?(g.sc[c.team]||0):0;
    c.stop();
    c.submit(score);
   };
   c.watch(gg=>{
    if(!gg)return;
    const roundChanged=gg.round!==lastRound||gg.ver!==lastVer||gg.phase!==lastPhase;
    const holderChanged=gg.holder&&gg.holder.id!==lastHolderId;
    const explodedNow=gg.phase==='exploded'&&lastPhase!=='exploded';
    const wasMineBeforeBoom=explodedNow&&lastHolderId===c.uid;
    g=gg;
    if(roundChanged||holderChanged)pending=false;
    if(wasMineBeforeBoom)vibrate([140,60,140,60,320]);
    lastRound=gg.round||0;
    lastVer=gg.ver||0;
    lastPhase=gg.phase||'';
    lastHolderId=(gg.holder&&gg.holder.id)||'';
    draw();
    submitEnd();
   });
   const isCandidateForMe=p=>{
    if(!g||!p||p.id===c.uid)return false;
    if(!g.allowSameTeam&&p.team===c.team)return false;
    return true;
   };
   const owned=()=>!!(g&&g.phase==='running'&&g.holder&&g.holder.id===c.uid&&NOW()>=g.startedAt&&NOW()<g.endsAt&&!pending);
   const draw=()=>{
    if(!g){c.ga.innerHTML='<p class="mu">진행자가 게임을 시작하면 화면에 폭탄이 표시됩니다.</p>';return}
    const mine=g.phase==='running'&&g.holder&&g.holder.id===c.uid;
    const allCandidates=(g.players||[]).map((p,i)=>({p,i})).filter(x=>isCandidateForMe(x.p));
    const filteredCandidates=(mine&&g.lastFromId!=null&&allCandidates.some(x=>x.p.id!==g.lastFromId))
     ?allCandidates.filter(x=>x.p.id!==g.lastFromId)
     :allCandidates;
    const holderLabel=g.holder?(teamName(g.holder.team)+' 팀 · '+g.holder.name):'미정';
    const status=g.phase==='end'?'게임이 끝났어요.':g.phase==='exploded'?'💥 폭탄이 터졌어요! 다음 라운드를 기다리세요.':mine?(pending?'폭탄 전달 중…':'내가 폭탄을 들고 있어요. 이름을 눌러 넘기세요.'):'폭탄 보유자: '+holderLabel;
    const guideText=g.allowSameTeam?'참가자 이름을 눌러 폭탄을 전달하세요. (직전 전달자 연속 반환 불가)':'다른 팀 참가자 이름을 눌러 폭탄을 전달하세요. (직전 전달자 연속 반환 불가)';
    c.ga.innerHTML='<style>@keyframes bombPulse{0%{transform:scale(.92) rotate(-5deg)}100%{transform:scale(1.08) rotate(5deg)}} .bombPulse{display:inline-block;animation:bombPulse .45s infinite alternate}</style>'
     +'<div style="text-align:center"><p class="big" style="margin:0">폭탄 돌리기 · '+g.round+' / '+g.rounds+' 라운드</p>'
     +'<div id="pBomb" class="bombPulse" style="font-size:58px;margin:5px">💣<span style="font-size:27px">🔥</span></div>'
     +'<p id="pClock" style="font-size:34px;font-weight:800;margin:0"></p>'
     +'<div style="height:14px;background:var(--bd);border-radius:8px;overflow:hidden;margin:5px 8px 10px"><div id="burn" style="height:100%;width:100%;background:linear-gradient(90deg,#e24b4a,#ffbb33);transition:width .15s"></div></div>'
     +'<p id="pStatus" class="big" style="font-size:18px">'+esc(status)+'</p>'
     +'<div id="targets" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px">'
     +filteredCandidates.map(x=>'<button data-to="'+x.i+'" '+(!owned()?'disabled':'')+' style="min-height:54px;font-size:16px;border:2px solid '+teamColor(x.p.team)+';border-radius:10px;opacity:'+(owned()?1:.65)+'">'+teamName(x.p.team)+'<br>'+esc(x.p.name)+'</button>').join('')
     +'</div><p class="mu">'+esc(guideText)+'</p></div>';
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
    const b=e.target&&e.target.closest?e.target.closest('[data-to]'):null;if(!b)return;
    e.preventDefault();if(!owned()||!g||!Array.isArray(g.players))return;
    const to=Number(b.dataset.to),target=g.players[to];if(!isCandidateForMe(target))return;
    pending=true;pendingAt=performance.now();
    vibrate(45);
    c.live(++seq,{to:target.id,round:g.round,ver:g.ver});
    const s=c.ga.querySelector('#pStatus');if(s)s.textContent='폭탄을 '+target.name+'에게 전달 중…';
    c.ga.querySelectorAll('[data-to]').forEach(x=>{x.disabled=true;x.style.opacity='.65'});
   };
   c.ga.addEventListener('pointerdown',pass,{passive:false});
   c.every(()=>{
    if(!g)return;
    if(pending&&g.holder&&g.holder.id!==c.uid){pending=false;draw()}
    else if(pending&&performance.now()-pendingAt>1200){pending=false;draw()}
    updatePlayerClock();
    if(pending&&g.holder&&g.holder.id===c.uid){const s=c.ga.querySelector('#pStatus');if(s)s.textContent='아직 전달되지 않았어요. 이름을 다시 눌러 주세요.'}
   },100);
  });
 }
});
})();
