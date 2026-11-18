/* 균형 잡기 */
registerGame({
 id:"bal",
 order:9,
 name:"균형 잡기",
 story:"AI가 조종하는 레이저가 움직이는 안전 구역을 비추고 있습니다. 폰을 기울여 파란 공을 안전 구역 안에 계속 머물게 하세요. 균형을 잃으면 AI에게 들킵니다.",
 desc:"15초 동안 스마트폰을 좌우로 기울여 파란 공을 움직이는 초록 영역 안에 머무르세요. 센서가 안 되면 ◀ ▶ 버튼으로 조작합니다. (오래 머물수록 좋음)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>(v/10)+'초',
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);
  const q=s=>c.el.querySelector(s);
  const lead=t=>{const mx=Math.max(...avg);return(mx>0&&avg[t]===mx&&avg.filter(x=>x===mx).length===1)?'👑':''};
  const MAXV=150;                                           // v는 0.1초 단위: 15초 = 150
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">레이저를 피해 안전 구역을 지키세요! 🟢</p><div style="margin-top:12px">'
   +Array.from({length:c.n},(_,t)=>'<div style="margin:14px 0;text-align:left"><b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span> <span id="v'+t+'" class="mu">평균 0.0초</span>'
    +'<div style="position:relative;height:38px;border-radius:19px;overflow:hidden;background:repeating-linear-gradient(90deg,#ff3b3b66 0 8px,#ff3b3b14 8px 16px);border:1px solid var(--bd);margin-top:4px">'
    +'<div id="bf'+t+'" style="height:100%;width:0;background:linear-gradient(90deg,#2f9e55,#7be495);transition:width .5s"></div>'
    +'<div id="sh'+t+'" style="position:absolute;top:0;left:0;font-size:24px;line-height:38px;transition:left .5s">🛡️</div></div></div>').join('')+'</div></div>';
  const draw=()=>{
   avg.forEach((a,t)=>{
    const w=Math.min(100,a/MAXV*100);
    const b=q('#bf'+t);if(b)b.style.width=w+'%';
    const s=q('#sh'+t);if(s)s.style.left='calc('+w+'% - '+(w>6?30:0)+'px)';
    const v=q('#v'+t);if(v)v.textContent='안전 구역 평균 '+(a/10).toFixed(1)+'초';
    const cr=q('#cr'+t);if(cr)cr.textContent=lead(t);
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 },
 run(c){c.ready(async()=>{const ok=await askMotion('orient');let pos=0,started=false,ms=0,t0=0,fb=false,lc=0;
  const run=m=>{started=true;fb=m==='touch';
   c.ga.innerHTML='<p class="big" id="tl">15</p><div style="position:relative;height:70px;background:var(--bg);border:1px solid var(--bd);border-radius:12px;overflow:hidden"><div id="zn" style="position:absolute;top:0;bottom:0;width:30%"></div><div id="dt" style="position:absolute;top:15px;width:40px;height:40px;border-radius:50%;background:var(--pr)"></div></div>'+(fb?'<div class="row" style="margin-top:12px"><button id="bl" style="height:90px;font-size:26px">◀</button><button id="br" style="height:90px;font-size:26px">▶</button></div>':'<p class="mu">좌우로 기울이세요</p>');
   if(fb){$('#bl').onpointerdown=e=>{e.preventDefault();pos=Math.max(-1,pos-.15)};$('#br').onpointerdown=e=>{e.preventDefault();pos=Math.min(1,pos+.15)}}
   t0=performance.now();let left=15;
   c.every(()=>{left--;$('#tl').textContent=left;if(left<=0){c.stop();c.submit(Math.round(ms/100))}},1000);
   c.every(()=>{const t=(performance.now()-t0)/1000,z=Math.sin(t*.9)*.5+Math.sin(t*2.3)*.2,inz=Math.abs(pos-z)<.3;if(inz)ms+=50;if(++lc%10===0)c.live(Math.round(ms/100));
    const zn=$('#zn'),dt=$('#dt');if(!zn)return;zn.style.left=(50+z*50-15)+'%';zn.style.background=inz?'#2f9e5599':'#2f9e5533';dt.style.left='calc(50% - 20px + '+pos+' * (50% - 20px))'},50)};
  if(ok){c.ga.innerHTML='<p class="mu">기울기 센서 확인 중…</p>';
   c.listen('deviceorientation',e=>{if(e.gamma==null)return;if(!started)run('motion');pos=Math.max(-1,Math.min(1,e.gamma/30))});
   c.after(()=>{if(!started)run('touch')},1300)}else run('touch')})}
});
