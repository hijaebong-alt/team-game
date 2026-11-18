/* 암산 스피드전 */
registerGame({
 id:"math",
 order:18,
 name:"암산 스피드전",
 story:"AI의 계산 속도에 맞서 인간의 암산 실력을 보여 주세요. 빠르고 정확한 계산으로 팀의 점수를 모으세요!",
 desc:"30초 동안 암산 문제를 풀어 보세요. 정답은 10점에 빠른 풀이 보너스가 더해집니다. 오답은 감점 없이 다음 문제로 넘어갑니다. (높을수록 좋음)",
 hi:true,
 fmt:v=>v+'점',
 run(c){c.ready(()=>{
  let score=0,correct=0,streak=0,round=0,left=30,locked=false,questionStart=0,answer=0;
  const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const makeQuestion=()=>{
   const level=Math.floor(round/4),ops=level===0?['+','-']:level===1?['+','-','×']:['+','-','×','÷'];
   const op=ops[rand(0,ops.length-1)];let a,b;
   if(op==='+'){a=rand(level===0?2:10,level===0?20:99);b=rand(level===0?2:10,level===0?20:99);answer=a+b}
   else if(op==='-'){a=rand(level===0?2:10,level===0?20:99);b=rand(level===0?2:10,level===0?20:99);if(b>a)[a,b]=[b,a];answer=a-b}
   else if(op==='×'){a=rand(2,12);b=rand(2,12);answer=a*b}
   else{b=rand(2,12);answer=rand(2,12);a=b*answer}
   return a+' '+op+' '+b+' = ?';
  };
  const finish=()=>{c.stop();c.submit(score)};
  const next=()=>{
   if(left<=0){finish();return}
   locked=false;questionStart=performance.now();const problem=makeQuestion();
   c.ga.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><span class="badge">남은 시간 <b id="mt">'+left+'</b>초</span><span class="mu">정답 '+correct+'개 · 연속 '+streak+'회</span></div>'
    +'<p class="big" id="mq" style="font-size:clamp(38px,11vw,58px);margin:24px 0">'+problem+'</p>'
    +'<p class="mu" style="margin:0 0 8px">현재 점수 <b id="ms">'+score+'</b>점</p>'
    +'<input id="ma" type="number" inputmode="numeric" autocomplete="off" placeholder="정답 입력" aria-label="정답 입력">'
    +'<button class="p w" id="mb">확인</button><p class="mu" id="mf" style="min-height:24px;margin:6px 0 0">빠르게 풀수록 보너스 점수!</p>';
   const submit=()=>{
    if(locked)return;const input=c.ga.querySelector('#ma'),raw=input?input.value.trim():'';
    if(!/^-?\d+$/.test(raw)){const f=c.ga.querySelector('#mf');if(f)f.textContent='정수를 입력해 주세요.';return}
    locked=true;round++;
    if(Number(raw)===answer){const elapsed=(performance.now()-questionStart)/1000,bonus=Math.max(0,5-Math.floor(elapsed/2));score+=10+bonus;correct++;streak++;const f=c.ga.querySelector('#mf');if(f)f.textContent='정답! +'+(10+bonus)+'점'+(bonus?' (빠른 풀이 +'+bonus+')':'')}
    else{streak=0;const f=c.ga.querySelector('#mf');if(f)f.textContent='아쉬워요! 정답은 '+answer+' 입니다.'}
    const s=c.ga.querySelector('#ms');if(s)s.textContent=score;c.live(score);
    c.after(next,550);
   };
   c.ga.querySelector('#mb').onclick=submit;
   c.ga.querySelector('#ma').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit()}};
   c.ga.querySelector('#ma').focus();
  };
  next();
  c.every(()=>{left--;const t=c.ga.querySelector('#mt');if(t)t.textContent=left;if(left<=0)finish()},1000);
 })}
});

