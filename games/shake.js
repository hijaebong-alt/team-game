/* 빠르게 흔들기 — 센서(흔들기) 게임. 진행자 화면에는 팀별 풍선 크기로 현재 진행 상태를 비교해서 보여 줌 */
(function(){
const base=shakeGame("shake","빠르게 흔들기","x","좌우","10초 동안 스마트폰을 좌우로 힘차게 흔드세요. 센서가 안 되면 좌/우 버튼을 번갈아 누르는 방식으로 바뀝니다. 진행자 화면에서는 팀별 풍선이 흔든 만큼 커집니다. (많을수록 좋음)",["◀ 좌","우 ▶"]);
registerGame(Object.assign(base,{order:1,story:"AI가 도시의 통신망을 마비시키는 방해 신호를 퍼뜨리고 있습니다. 인류의 에너지를 한데 모아 신호를 날려 버려야 합니다! 팀원 모두가 힘껏 흔들어 에너지 풍선을 누구보다 크게 부풀리세요.",
 /* ---- 진행자 화면: 팀 평균 흔든 횟수에 따라 풍선이 커짐 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const MINH=60,MAXH=270;                                   // 풍선 최소·최대 높이(px)
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);let maxv=40;                  // maxv: 풍선이 가장 커지는 평균 횟수(넘으면 자동으로 늘어남)
  const balloon=(t)=>'<svg id="ob'+t+'" viewBox="0 0 100 140" style="height:'+MINH+'px;transition:height .5s ease;display:block;margin:0 auto">'
   +'<path d="M50 118 Q45 128 52 138" stroke="#888" stroke-width="2" fill="none"/>'
   +'<polygon points="50,110 43,122 57,122" fill="'+COL[t]+'"/>'
   +'<ellipse cx="50" cy="55" rx="42" ry="55" fill="'+COL[t]+'"/>'
   +'<ellipse cx="34" cy="34" rx="9" ry="15" fill="#ffffff55" transform="rotate(25 34 34)"/></svg>';
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">흔들어서 풍선을 키우세요! 🎈</p>'
   +'<div style="display:flex;align-items:flex-end;justify-content:space-around;height:320px;margin-top:8px;border-bottom:4px solid var(--bd)">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1;text-align:center"><div id="cr'+t+'" style="height:34px;font-size:28px;line-height:34px"></div>'+balloon(t)+'</div>').join('')
   +'</div><div style="display:flex;justify-content:space-around;margin-top:8px">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1"><b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b><div id="v'+t+'" class="mu" style="font-size:16px">평균 0.0회</div></div>').join('')+'</div></div>';
  const q=s=>c.el.querySelector(s);
  const draw=()=>{
   const mx=Math.max(...avg);if(mx*1.1>maxv)maxv=mx*1.1;
   avg.forEach((a,t)=>{
    const h=MINH+(MAXH-MINH)*Math.min(1,a/maxv);
    const b=q('#ob'+t);if(b)b.style.height=h+'px';
    const v=q('#v'+t);if(v)v.textContent='평균 '+a.toFixed(1)+'회';
    const cr=q('#cr'+t);if(cr)cr.textContent=(mx>0&&a===mx&&avg.filter(x=>x===mx).length===1)?'👑':'';
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 }
}));
})();
