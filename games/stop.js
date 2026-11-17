/* 멈추기 게임 */
registerGame({
 id:"stop",
 order:5,
 name:"멈추기 게임",
 story:"AI가 폭탄의 카운트다운을 시작했습니다. 숫자가 사라져도 0초가 되는 바로 그 순간에 멈춰야 폭발을 막을 수 있습니다. 눈이 아니라 감각으로 시간을 읽으세요.",
 desc:"10초부터 줄어드는 카운트다운이 3초에서 사라집니다. 0초가 되었다고 생각될 때 누르세요. (오차가 작을수록 좋음)",
 hi:false, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'ms 오차',
 run(c){c.ready(()=>{const t0=performance.now();c.ga.innerHTML='<p class="big" id="tl">10.00</p><button class="p" id="pad">멈추기</button>';
  const t=c.every(()=>{const r=10-(performance.now()-t0)/1000;$('#tl').textContent=r>3?r.toFixed(2):'?'},30);
  $('#pad').onpointerdown=e=>{e.preventDefault();$('#pad').onpointerdown=null;clearInterval(t);c.submit(Math.round(Math.abs(performance.now()-t0-10000)))}})}
});
