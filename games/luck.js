/* 운 시험 */
registerGame({
 id:"luck",
 order:10,
 name:"운 시험",
 story:"AI는 모든 것을 계산하지만 인간의 운만은 예측하지 못합니다. 행운의 버튼을 눌러 AI의 계산을 뒤흔드세요. 우리 팀의 행운을 한데 모아 보세요!",
 desc:"버튼을 눌러 0~100점 무작위 점수를 뽑습니다. 5번 기회의 합계가 점수입니다. (높을수록 좋음)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'점',
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);
  const q=s=>c.el.querySelector(s);
  const lead=t=>{const mx=Math.max(...avg);return(mx>0&&avg[t]===mx&&avg.filter(x=>x===mx).length===1)?'👑':''};
  const MAXV=500;                                           // 5번 뽑기 최대 합계
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">인간의 행운을 모으세요! 🍀</p><div style="margin-top:12px">'
   +Array.from({length:c.n},(_,t)=>'<div style="margin:14px 0;text-align:left"><b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span> <span id="v'+t+'" class="mu">평균 0점</span>'
    +'<div style="position:relative;height:38px;border-radius:19px;overflow:hidden;background:var(--bg);border:1px solid var(--bd);margin-top:4px">'
    +'<div id="bf'+t+'" style="height:100%;width:0;background:linear-gradient(90deg,#ffd54a,#ff9ecf,#8fd3ff);transition:width .6s"></div>'
    +'<div id="sh'+t+'" style="position:absolute;top:0;left:0;font-size:24px;line-height:38px;transition:left .6s">🍀</div></div></div>').join('')+'</div>'
   +'<div style="margin-top:24px;text-align:left"><h2 style="margin:0 0 4px">🍀 행운 랭킹</h2><p class="mu" style="margin:0 0 10px">점수를 뽑을 때마다 순위가 실시간으로 바뀝니다.</p><div id="luckRank"></div></div></div>';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const draw=()=>{
   avg.forEach((a,t)=>{
    const w=Math.min(100,a/MAXV*100);
    const b=q('#bf'+t);if(b)b.style.width=w+'%';
    const s=q('#sh'+t);if(s)s.style.left='calc('+w+'% - '+(w>6?30:0)+'px)';
    const v=q('#v'+t);if(v)v.textContent='행운 평균 '+Math.round(a)+'점';
    const cr=q('#cr'+t);if(cr)cr.textContent=lead(t);
   });
  };
  const drawRanking=rs=>{
   const scoreById=new Map(rs.filter(r=>typeof r.v==='number').map(r=>[r.uid,r.v]));
   const ranked=c.players.map(p=>({player:p,score:scoreById.has(p.id)?scoreById.get(p.id):null}));
   ranked.sort((a,b)=>{if(a.score==null&&b.score!=null)return 1;if(a.score!=null&&b.score==null)return -1;if(a.score!=null&&b.score!=null&&a.score!==b.score)return b.score-a.score;return String(a.player.name).localeCompare(String(b.player.name),'ko')});
   let place=0,lastScore=null;
   const rows=ranked.map((x,i)=>{
    const p=x.player,team=p.team,col=COL[team]||'#888',score=x.score;
    if(score!=null&&score!==lastScore){place=i+1;lastScore=score}
    const medal=place===1?'🥇':place===2?'🥈':place===3?'🥉':(score==null?'–':place+'위');
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin:6px 0;border:1px solid var(--bd);border-radius:12px;background:var(--card)">'
     +'<span style="width:34px;text-align:center;font-weight:800;font-size:16px">'+medal+'</span>'
     +'<span style="width:9px;height:30px;border-radius:8px;background:'+col+';flex:none"></span>'
     +'<span style="flex:1;min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p.name)+'</b><span class="mu" style="font-size:12px">'+esc(TN[team]||'팀 없음')+' 팀</span></span>'
     +'<b style="font-size:18px;white-space:nowrap">'+(score==null?'<span class="mu" style="font-size:13px">기록 대기</span>':score+'점')+'</b></div>';
   }).join('');
   const el=q('#luckRank');if(el)el.innerHTML=rows||'<p class="mu">참가자가 없습니다.</p>';
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();drawRanking(rs);
  });
 },
 run(c){c.ready(()=>{let n=0,sum=0,last=0;const draw=()=>{c.ga.innerHTML='<p class="mu">'+n+'/5 · 합계 '+sum+'</p><button class="p" id="pad" style="height:140px">뽑기!</button>'+(n?'<p class="big">+'+last+'</p>':'');
  $('#pad').onpointerdown=e=>{e.preventDefault();$('#pad').onpointerdown=null;last=Math.floor(Math.random()*101);sum+=last;n++;c.live(sum);if(n>=5)c.submit(sum);else draw()}};draw()})}
});

