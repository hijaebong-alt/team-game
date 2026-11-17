/* 운 시험 */
registerGame({
 id:"luck",
 order:10,
 name:"운 시험",
 story:"AI는 모든 것을 계산하지만 인간의 운만은 예측하지 못합니다. 행운의 버튼을 눌러 AI의 계산을 뒤흔드세요. 우리 팀의 행운을 한데 모아 보세요!",
 desc:"버튼을 눌러 0~100점 무작위 점수를 뽑습니다. 5번 기회의 합계가 점수입니다. (높을수록 좋음)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'점',
 run(c){c.ready(()=>{let n=0,sum=0,last=0;const draw=()=>{c.ga.innerHTML='<p class="mu">'+n+'/5 · 합계 '+sum+'</p><button class="p" id="pad" style="height:140px">뽑기!</button>'+(n?'<p class="big">+'+last+'</p>':'');
  $('#pad').onpointerdown=e=>{e.preventDefault();$('#pad').onpointerdown=null;last=Math.floor(Math.random()*101);sum+=last;n++;if(n>=5)c.submit(sum);else draw()}};draw()})}
});
