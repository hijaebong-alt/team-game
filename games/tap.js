/* 화면 연속 터치: 10초 동안 최대한 많이 누르기. 진행자 화면에는 팀별 벽돌 탑의 높이로 현재 진행 상태를 비교해서 보여 줌 */
(function(){
registerGame({
 id:"tap",
 order:6,
 name:"화면 연속 터치",
 story:"AI가 세운 거대한 방벽이 인류를 가두고 있습니다. 모두가 힘을 모아 벽돌을 쌓아 방벽 위로 올라서야 합니다. 팀원 모두가 쉬지 않고 눌러 우리 팀의 탑을 가장 높이 쌓으세요!",
 desc:"10초 동안 버튼을 최대한 많이 누르세요. 진행자 화면에서는 팀별 벽돌 탑이 누른 만큼 높아집니다. (많을수록 좋음)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'회',

 /* ---- 진행자 화면: 팀 평균 터치 횟수에 따라 벽돌 탑이 높아짐 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);let maxv=60;               // maxv: 탑이 가장 높아지는 평균 횟수(넘으면 자동으로 늘어남)
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">힘껏 눌러 벽돌 탑을 높이 쌓으세요! 🧱</p>'
   +'<div style="display:flex;justify-content:space-around;gap:10px;margin-top:8px">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1;text-align:center"><div style="position:relative;height:340px;border-bottom:4px solid var(--bd);background:var(--bg);border-radius:10px 10px 0 0;overflow:hidden">'
     +'<div id="cr'+t+'" style="position:absolute;top:4px;left:0;right:0;font-size:26px"></div>'
     +'<div id="tw'+t+'" style="position:absolute;left:18%;right:18%;bottom:0;height:6%;transition:height .4s ease;background:repeating-linear-gradient(0deg,'+COL[t]+' 0 22px,#ffffff66 22px 24px),'+COL[t]+';border-radius:6px 6px 0 0">'
     +'<div style="position:absolute;top:-30px;left:0;right:0;font-size:26px;line-height:1">🚩</div></div></div>'
     +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b><div id="v'+t+'" class="mu" style="font-size:16px">평균 0.0회</div></div>').join('')
   +'</div></div>';
  const q=s=>c.el.querySelector(s);
  const draw=()=>{
   const mx=Math.max(...avg);if(mx*1.1>maxv)maxv=mx*1.1;
   avg.forEach((a,t)=>{
    const w=q('#tw'+t);if(w)w.style.height=(6+82*Math.min(1,a/maxv))+'%';           // 최대 88% 높이
    const v=q('#v'+t);if(v)v.textContent='평균 '+a.toFixed(1)+'회';
    const cr=q('#cr'+t);if(cr)cr.textContent=(mx>0&&a===mx&&avg.filter(x=>x===mx).length===1)?'👑':'';
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 },

 /* ---- 참가자 화면 ---- */
 run(c){
  c.ready(()=>{
   let n=0,left=10,ll=-1000;
   const lv=()=>{const t=performance.now();if(t-ll>400){ll=t;c.live(n)}};     // 진행자 화면 비교용: 0.4초에 한 번만 현재 기록 전송
   c.ga.innerHTML='<p class="big" id="tl">10</p><button class="p" id="pad">터치!</button>';
   $('#pad').onpointerdown=e=>{e.preventDefault();n++;$('#pad').textContent=n;lv()};
   c.every(()=>{left--;$('#tl').textContent=left;if(left<=0){c.stop();c.submit(n)}},1000);
  });
 }
});
})();
