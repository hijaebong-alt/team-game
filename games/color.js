/* 색깔 맞추기: 글자(예: 노랑)와 같은 색이 나올 때만 누르는 게임 */
registerGame({
 id:'color',
 order:11,
 name:'색깔 맞추기',
 desc:'화면에 색 이름(예: 노랑)과 색 칸이 잠깐 나타납니다. 글자와 같은 색일 때만 누르세요. 처음엔 1.5초 동안 보이다가 점점 빨라져 마지막엔 0.3초만 보입니다. 맞게 누르면 +1점, 다른 색인데 누르면 -1점입니다. (20번 · 높을수록 좋음)',
 hi:true,
 fmt:v=>v+'점',
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
    $('#sc').textContent=score;
    $('#fb').textContent=d>0?'+1 정답!':'-1 다른 색!';
    c.after(()=>{const f=$('#fb');if(f)f.textContent=''},500);
   };
   c.after(show,800);
  });
 }
});
