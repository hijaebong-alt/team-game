/* 위아래로 움직이기 — 센서(흔들기) 게임. 진행자 화면에는 팀별 로켓 높이로 현재 진행 상태를 비교해서 보여 줌 */
(function(){
const base=shakeGame("updown","위아래로 움직이기","y","위아래","10초 동안 스마트폰을 위아래로 움직이세요. 센서가 안 되면 위/아래 버튼을 번갈아 누르는 방식으로 바뀝니다. 진행자 화면에서는 팀별 로켓이 움직인 만큼 높이 올라갑니다. (많을수록 좋음)",["▲ 위","아래 ▼"]);
registerGame(Object.assign(base,{order:2,
 /* ---- 진행자 화면: 팀 평균 움직인 횟수에 따라 로켓이 올라감 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);let maxv=40;                  // maxv: 로켓이 달에 닿는 평균 횟수(넘으면 자동으로 늘어남)
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">위아래로 움직여 로켓을 높이 쏘아 올리세요! 🚀</p>'
   +'<div style="display:flex;justify-content:space-around;gap:10px;margin-top:8px">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1;text-align:center"><div style="position:relative;height:340px;border-radius:14px;overflow:hidden;background:linear-gradient(#0b1230,#2a3b8f 70%,#5b8cff)">'
     +'<div style="position:absolute;top:6px;left:0;right:0;font-size:30px">🌙</div>'
     +'<div id="cr'+t+'" style="position:absolute;top:44px;left:0;right:0;font-size:24px"></div>'
     +'<div id="rk'+t+'" style="position:absolute;left:0;right:0;bottom:2%;transition:bottom .5s ease"><span style="display:inline-block;font-size:46px;line-height:1;transform:rotate(-45deg)">🚀</span><div style="font-size:26px;line-height:1">🔥</div></div></div>'
     +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b><div id="v'+t+'" class="mu" style="font-size:16px">평균 0.0회</div></div>').join('')
   +'</div></div>';
  const q=s=>c.el.querySelector(s);
  const draw=()=>{
   const mx=Math.max(...avg);if(mx*1.1>maxv)maxv=mx*1.1;
   avg.forEach((a,t)=>{
    const r=q('#rk'+t);if(r)r.style.bottom=(2+68*Math.min(1,a/maxv))+'%';       // 최대 70% 높이까지 상승
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
