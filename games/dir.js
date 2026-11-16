/* 방향 따라 하기 */
registerGame({
 id:"dir",
 order:8,
 name:"방향 따라 하기",
 desc:"화면에 나온 화살표 순서를 외워 같은 순서로 누르세요. 한 번 틀리면 끝이며, 오래 이어갈수록 높은 점수입니다. (최대 10단계)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'단계',
 run(c){c.ready(()=>{const A=['◀','▲','▼','▶'];let seq=[],lv=0;
  const show=()=>{seq.push(Math.floor(Math.random()*4));c.ga.innerHTML='<p class="mu">'+(lv+1)+'단계 · 순서를 외우세요</p><p class="big" id="ar" style="height:64px"></p>';let i=0;
   const t=c.every(()=>{if(i>=seq.length){clearInterval(t);const e=$('#ar');if(e)e.textContent='';input();return}$('#ar').textContent=A[seq[i]];c.after(()=>{const e=$('#ar');if(e)e.textContent=''},450);i++},800)};
  const input=()=>{let k=0;c.ga.innerHTML='<p class="mu">같은 순서로 누르세요 (<span id="k">0</span>/'+seq.length+')</p><div class="row">'+A.map((a,i)=>'<button data-a="'+i+'" style="height:80px;font-size:28px">'+a+'</button>').join('')+'</div>';
   c.ga.querySelectorAll('[data-a]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(+b.dataset.a!==seq[k]){c.submit(lv);return}k++;$('#k').textContent=k;if(k===seq.length){lv++;if(lv>=10){c.submit(lv);return}c.after(show,500)}})};
  show()})}
});
