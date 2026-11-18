/* 방향 따라 하기 */
registerGame({
 id:"dir",
 order:8,
 name:"방향 따라 하기",
 story:"AI의 보안 장치는 화살표 패턴으로 잠겨 있습니다. 나타난 순서를 그대로 따라 눌러야 문이 열리고, 한 번 틀리면 경보가 울립니다. 침착하게 패턴을 기억하세요.",
 desc:"화면에 나온 화살표 순서를 외워 같은 순서로 누르세요. 한 번 틀리면 끝이며, 오래 이어갈수록 높은 점수입니다. (최대 10단계)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>v+'단계',
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);
  const q=s=>c.el.querySelector(s);
  const lead=t=>{const mx=Math.max(...avg);return(mx>0&&avg[t]===mx&&avg.filter(x=>x===mx).length===1)?'👑':''};
  const MAXL=10;
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">AI의 보안 장치를 하나씩 해제하세요! 🔐</p><div style="display:flex;gap:12px;margin-top:10px">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1;min-width:0;border:2px solid '+COL[t]+';border-radius:12px;padding:8px"><b style="color:'+COL[t]+'">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span>'
    +'<div style="display:flex;flex-direction:column-reverse;gap:3px;margin:8px 0">'+Array.from({length:MAXL},(_,i)=>'<div id="lk'+t+'_'+i+'" style="height:24px;line-height:24px;border-radius:6px;background:var(--bg);border:1px solid var(--bd);font-size:15px">🔒 '+(i+1)+'단계</div>').join('')+'</div>'
    +'<div id="v'+t+'" class="mu">평균 0.0단계</div></div>').join('')+'</div></div>';
  const draw=()=>{
   avg.forEach((a,t)=>{
    for(let i=0;i<MAXL;i++){const e=q('#lk'+t+'_'+i);if(!e)continue;const open=a>=i+1,part=!open&&a>i;
     e.textContent=(open?'🔓 ':part?'🔑 ':'🔒 ')+(i+1)+'단계';e.style.background=open?COL[t]+'66':part?COL[t]+'22':'var(--bg)'}
    const v=q('#v'+t);if(v)v.textContent='평균 '+a.toFixed(1)+'단계';
    const cr=q('#cr'+t);if(cr)cr.textContent=lead(t);
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 },
 run(c){c.ready(()=>{const A=['◀','▲','▼','▶'];let seq=[],lv=0;
  const show=()=>{seq.push(Math.floor(Math.random()*4));c.ga.innerHTML='<p class="mu">'+(lv+1)+'단계 · 순서를 외우세요</p><p class="big" id="ar" style="height:64px"></p>';let i=0;
   const t=c.every(()=>{if(i>=seq.length){clearInterval(t);const e=$('#ar');if(e)e.textContent='';input();return}$('#ar').textContent=A[seq[i]];c.after(()=>{const e=$('#ar');if(e)e.textContent=''},450);i++},800)};
  const input=()=>{let k=0;c.ga.innerHTML='<p class="mu">같은 순서로 누르세요 (<span id="k">0</span>/'+seq.length+')</p><div class="row">'+A.map((a,i)=>'<button data-a="'+i+'" style="height:80px;font-size:28px">'+a+'</button>').join('')+'</div>';
   c.ga.querySelectorAll('[data-a]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(+b.dataset.a!==seq[k]){c.submit(lv);return}k++;$('#k').textContent=k;if(k===seq.length){lv++;c.live(lv);if(lv>=10){c.submit(lv);return}c.after(show,500)}})};
  show()})}
});
