/* 화면 연속 터치 */
registerGame({
 id:"tap",
 order:6,
 name:"화면 연속 터치",
 desc:"10초 동안 버튼을 최대한 많이 누르세요. (많을수록 좋음)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'회',
 run(c){c.ready(()=>{let n=0,left=10;c.ga.innerHTML='<p class="big" id="tl">10</p><button class="p" id="pad">터치!</button>';
  $('#pad').onpointerdown=e=>{e.preventDefault();n++;$('#pad').textContent=n};
  c.every(()=>{left--;$('#tl').textContent=left;if(left<=0){c.stop();c.submit(n)}},1000)})}
});
