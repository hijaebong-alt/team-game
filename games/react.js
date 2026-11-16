/* 반응 속도 */
registerGame({
 id:"react",
 order:4,
 name:"반응 속도",
 desc:"화면이 초록색으로 바뀌면 바로 누르세요. 3번 평균이며, 너무 일찍 누르면 1000ms로 처리됩니다. (짧을수록 좋음)",
 hi:false, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'ms',
 run(c){c.ready(()=>{const res=[];let green=0,w;const round=()=>{green=0;c.ga.innerHTML='<p class="mu">'+(res.length+1)+'/3 · 초록색이 되면 누르세요</p><button id="pad" style="background:#888;color:#fff">기다리세요…</button>';
  const pad=$('#pad');w=c.after(()=>{green=performance.now();pad.style.background='#2f9e55';pad.textContent='지금!'},1500+Math.random()*2500);
  pad.onpointerdown=e=>{e.preventDefault();pad.onpointerdown=null;clearTimeout(w);res.push(green?Math.round(performance.now()-green):1000);
   if(res.length>=3)c.submit(Math.round(res.reduce((a,b)=>a+b,0)/3));else{pad.textContent=green?res[res.length-1]+'ms':'너무 빨랐어요!';c.after(round,1000)}}};round()})}
});
