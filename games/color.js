/* 색깔 맞추기: 글자(예: 노랑)와 같은 색이 나올 때만 누르는 게임 */
registerGame({
 id:'color',
 order:11,
 name:'색깔 맞추기',
 story:"AI가 진짜 신호 사이에 가짜 신호를 섞어 보내고 있습니다. 글자와 색이 같은 진짜 신호에만 반응하세요. 속아서 누르면 우리 팀이 감점됩니다.",
 desc:'화면에 색 이름(예: 노랑)과 색 칸이 잠깐 나타납니다. 글자와 같은 색일 때만 누르세요. 처음엔 1.5초 동안 보이다가 점점 빨라져 마지막엔 0.3초만 보입니다. 맞게 누르면 +1점, 다른 색인데 누르면 -1점입니다. (20번 · 높을수록 좋음)',
 hi:true,
 fmt:v=>v+'점',
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);
  const q=s=>c.el.querySelector(s);
  const lead=t=>{const mx=Math.max(...avg);return(mx>0&&avg[t]===mx&&avg.filter(x=>x===mx).length===1)?'👑':''};
  const MAXV=20;                                            // 점수 범위 -20 ~ +20
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">진짜 신호만 골라내세요! 📡</p><p class="mu" style="margin:2px 0 0">◀ 가짜에 속아 감점 · 진짜를 잡아 득점 ▶</p><div style="margin-top:10px">'
   +Array.from({length:c.n},(_,t)=>'<div style="margin:14px 0;text-align:left"><b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span> <span id="v'+t+'" class="mu">평균 0.0점</span>'
    +'<div style="position:relative;height:38px;border-radius:10px;overflow:hidden;background:var(--bg);border:1px solid var(--bd);margin-top:4px">'
    +'<div style="position:absolute;left:50%;top:0;bottom:0;width:3px;background:var(--mu);z-index:2"></div>'
    +'<div id="bf'+t+'" style="position:absolute;top:0;bottom:0;left:50%;width:0;transition:all .4s"></div></div></div>').join('')+'</div></div>';
  const draw=()=>{
   avg.forEach((a,t)=>{
    const w=Math.min(50,Math.abs(a)/MAXV*50),b=q('#bf'+t);
    if(b){b.style.width=w+'%';b.style.left=(a>=0?50:50-w)+'%';b.style.background=a>=0?'linear-gradient(90deg,#2f9e55,#7be495)':'linear-gradient(270deg,#e24b4a,#ff9a9a)'}
    const v=q('#v'+t);if(v)v.textContent='평균 '+(a>=0?'+':'')+a.toFixed(1)+'점';
    const cr=q('#cr'+t);if(cr)cr.textContent=lead(t);
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 },
 run(c){
  const SLOW=1500,FAST=300;   // 보이는 시간(ms): 처음 1.5초 → 마지막 0.3초로 점점 빨라짐
  const TRIALS=20;            // 문제 수
  const GAP_MIN=500,GAP_MAX=900; // 문제 사이 간격(ms)
  const C=[['빨강','#e24b4a'],['파랑','#378add'],['노랑','#f2c200'],['초록','#2f9e55']];
  c.ready(()=>{
   let i=0,score=0,cur=null,tapped=false;
   c.ga.innerHTML='<p class="mu" style="text-align:center">점수 <b id="sc">0</b> · <span id="no">1</span>/'+TRIALS+'</p>'
    +'<p class="big" id="wd" style="height:56px"></p>'
    +'<div id="pad" style="height:180px;border-radius:16px;background:var(--bg);border:1px solid var(--bd);touch-action:manipulation;user-select:none"></div>'
    +'<p class="mu" id="fb" style="text-align:center;height:24px"></p>';
   const pad=$('#pad');
   const show=()=>{
    if(i>=TRIALS){c.submit(score);return}
    const w=Math.floor(Math.random()*4);
    const col=Math.random()<.5?w:(w+1+Math.floor(Math.random()*3))%4;
    const limit=Math.round(SLOW-(SLOW-FAST)*i/(TRIALS-1));
    cur={match:w===col};tapped=false;
    $('#wd').textContent=C[w][0];pad.style.background=C[col][1];$('#no').textContent=i+1;
    c.after(()=>{
     $('#wd').textContent='';pad.style.background='var(--bg)';cur=null;i++;
     c.after(show,GAP_MIN+Math.random()*(GAP_MAX-GAP_MIN));
    },limit);
   };
   pad.onpointerdown=e=>{
    e.preventDefault();
    if(!cur||tapped)return;
    tapped=true;
    const d=cur.match?1:-1;score+=d;
    $('#sc').textContent=score;c.live(score);
    $('#fb').textContent=d>0?'+1 정답!':'-1 다른 색!';
    c.after(()=>{const f=$('#fb');if(f)f.textContent=''},500);
   };
   c.after(show,800);
  });
 }
});
