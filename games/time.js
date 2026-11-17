/* 타이밍 클릭 */
registerGame({
 id:"time",
 order:3,
 name:"타이밍 클릭",
 story:"AI의 방어막은 5초마다 한 번, 아주 짧은 순간만 열립니다. 정확히 그 순간에 신호를 보내야 방어막에 구멍을 낼 수 있습니다. 인간의 감각으로 AI의 계산을 넘어서세요.",
 desc:"시작 후 정확히 5초가 되었다고 생각될 때 누르세요. 숫자는 2초 뒤에 사라집니다. (오차가 작을수록 좋음)",
 hi:false, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'ms 오차',
 run(c){c.ready(()=>{const t0=performance.now();c.ga.innerHTML='<p class="mu">목표: 5.00초</p><p class="big" id="tl">0.00</p><button class="p" id="pad">멈추기</button>';
  const t=c.every(()=>{const e=performance.now()-t0;$('#tl').textContent=e<2000?(e/1000).toFixed(2):'?'},30);
  $('#pad').onpointerdown=e=>{e.preventDefault();$('#pad').onpointerdown=null;clearInterval(t);c.submit(Math.round(Math.abs(performance.now()-t0-5000)))}})}
});
