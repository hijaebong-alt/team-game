/* 숫자 기억하기 */
registerGame({
 id:"mem",
 order:7,
 name:"숫자 기억하기",
 desc:"잠깐 나타나는 숫자를 기억해 입력하세요. 4~8자리 5문제이며, 정답이 많고 빠를수록 높은 점수입니다.",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>Math.floor(v/100)+'개 정답',
 run(c){c.ready(()=>{let r=0,ok=0,tot=0;const next=()=>{if(r>=5){c.submit(ok*100+(ok?Math.max(0,99-Math.round(tot/1000*3)):0));return}
  const len=4+r;let s='';for(let i=0;i<len;i++)s+=Math.floor(Math.random()*10);
  c.ga.innerHTML='<p class="mu">'+(r+1)+'/5</p><p class="big" style="letter-spacing:6px">'+s+'</p>';
  c.after(()=>{c.ga.innerHTML='<p class="mu">'+(r+1)+'/5 · 방금 본 숫자를 입력하세요</p><input id="an" inputmode="numeric" maxlength="'+len+'" autocomplete="off"><button class="p w" id="ok">확인</button>';
   const t=performance.now();$('#an').focus();
   $('#ok').onclick=()=>{tot+=performance.now()-t;if($('#an').value.trim()===s)ok++;r++;next()}},800+len*350)};next()})}
});
