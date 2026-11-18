/* 숫자 기억하기: 5자리부터 12자리까지 한 자리씩 늘어나는 기억력 게임 */
registerGame({
 id:"mem",
 order:7,
 name:"숫자 기억하기",
 story:"AI 서버의 비밀번호가 아주 잠깐 화면에 드러납니다. 길고 복잡한 번호를 정확히 기억해 입력하면 시스템을 해킹할 수 있습니다. 인간의 기억력으로 AI의 보안을 뚫으세요.",
 desc:"잠깐 나타나는 숫자를 기억해 입력하세요. 5자리에서 시작해 12자리까지 한 자리씩 늘어나는 8문제이며, 정답이 많고 빠를수록 높은 점수입니다.",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>Math.floor(v/100)+'개 정답',
 run(c){
  const START=5,END=12,N=END-START+1;     // 시작 자릿수, 마지막 자릿수, 문제 수(8문제)
  c.ready(()=>{
   let r=0,ok=0,tot=0;
   const next=()=>{
    if(r>=N){c.submit(ok*100+(ok?Math.max(0,99-Math.round(tot/1000*1.2)):0));return}   // 정답 수 × 100 + 속도 보너스(최대 99)
    const len=START+r;let s='';
    for(let i=0;i<len;i++)s+=Math.floor(Math.random()*10);
    c.ga.innerHTML='<p class="mu">'+(r+1)+'/'+N+' · '+len+'자리</p><p class="big" style="font-size:'+(len>8?28:40)+'px;letter-spacing:'+(len>8?3:6)+'px;word-break:break-all">'+s+'</p>';
    c.after(()=>{
     c.ga.innerHTML='<p class="mu">'+(r+1)+'/'+N+' · 방금 본 '+len+'자리 숫자를 입력하세요</p><input id="an" inputmode="numeric" maxlength="'+len+'" autocomplete="off"><button class="p w" id="ok">확인</button>';
     const t=performance.now(),el=$('#an');el.focus();
     const go=()=>{tot+=performance.now()-t;if(el.value.trim()===s)ok++;r++;next()};
     $('#ok').onclick=go;el.onkeydown=e=>{if(e.key==='Enter')go()};
    },800+len*350);                         // 숫자가 보이는 시간: 5자리 약 2.6초 ~ 12자리 5초
   };
   next();
  });
 }
});
