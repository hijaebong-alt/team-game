/* 떨어지는 돈 받기: 바구니를 움직여 떨어지는 돈을 받는 게임 */
registerGame({
 id:'money',
 order:13,
 name:'떨어지는 돈 받기',
 story:"AI가 보급선을 폭파해 인류의 자금이 하늘에서 쏟아지고 있습니다. 바구니로 최대한 많이 받아 인류의 반격 자금을 모으세요. 폭탄은 반드시 피해야 합니다!",
 desc:'20초 동안 하늘에서 떨어지는 돈을 바구니로 받으세요. 폰을 좌우로 기울이거나 손가락으로 끌어서 움직입니다. 🪙 +1점, 💵 +3점, 폭탄 💣 -3점입니다. (점수가 높을수록 좋음)',
 hi:true,
 fmt:v=>v+'점',
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const avg=Array(c.n).fill(0);
  const q=s=>c.el.querySelector(s);
  const lead=t=>{const mx=Math.max(...avg);return(mx>0&&avg[t]===mx&&avg.filter(x=>x===mx).length===1)?'👑':''};
  let maxv=60;                                              // 금고가 가득 차는 평균 점수(넘으면 자동으로 늘어남)
  c.el.innerHTML='<div style="text-align:center"><p class="big" style="margin:0">인류의 반격 자금을 모으세요! 💰</p>'
   +'<div style="display:flex;gap:12px;margin-top:10px">'
   +Array.from({length:c.n},(_,t)=>'<div style="flex:1;text-align:center"><div style="position:relative;height:330px;border-bottom:4px solid var(--bd);background:var(--bg);border-radius:10px 10px 0 0;overflow:hidden">'
    +'<div id="cr'+t+'" style="position:absolute;top:4px;left:0;right:0;font-size:26px"></div>'
    +'<div id="bf'+t+'" style="position:absolute;left:16%;right:16%;bottom:0;height:6%;background:linear-gradient(#ffe27a,#d99a00);border-radius:8px 8px 0 0;transition:height .4s ease"><div style="position:absolute;top:-34px;left:0;right:0;font-size:30px;line-height:1">💰</div></div></div>'
    +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b><div id="v'+t+'" class="mu" style="font-size:16px">평균 0.0점</div></div>').join('')+'</div></div>';
  const draw=()=>{
   const mx=Math.max(...avg);if(mx*1.1>maxv)maxv=mx*1.1;
   avg.forEach((a,t)=>{
    const b=q('#bf'+t);if(b)b.style.height=(6+82*Math.min(1,Math.max(0,a)/maxv))+'%';
    const v=q('#v'+t);if(v)v.textContent='평균 '+a.toFixed(1)+'점';
    const cr=q('#cr'+t);if(cr)cr.textContent=lead(t);
   });
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);avg[t]=size[t]?sum/size[t]:0}
   draw();
  });
 },
 run(c){
  const TIME=20;                                   // 게임 시간(초)
  const ITEMS=[{e:'🪙',p:1,w:55},{e:'💵',p:3,w:30},{e:'💣',p:-3,w:15}];  // w: 나오는 비율
  c.ready(async()=>{
   const ok=await askMotion('orient');
   c.ga.innerHTML='<p class="mu" style="text-align:center;margin:0">남은 시간 <b id="tl">'+TIME+'</b>초 · 점수 <b id="sc">0</b></p>'
    +'<canvas id="cv" style="width:100%;height:420px;border-radius:14px;background:var(--bg);border:1px solid var(--bd);touch-action:none;display:block;margin-top:8px"></canvas>'
    +'<p class="mu" style="text-align:center">'+(ok?'폰을 좌우로 기울이거나 손가락으로 끌어 움직이세요':'손가락으로 끌어 바구니를 움직이세요')+'</p>';
   const cv=$('#cv'),W=cv.clientWidth,H=cv.clientHeight,dpr=window.devicePixelRatio||1;
   cv.width=W*dpr;cv.height=H*dpr;
   const g=cv.getContext('2d');g.scale(dpr,dpr);
   const BW=64;
   let bx=W/2,touching=false,score=0,items=[],pops=[],spawn=0.5;
   const t0=performance.now();let last=t0,lastLive=0;
   const mv=e=>{e.preventDefault();const r=cv.getBoundingClientRect();bx=Math.max(BW/2,Math.min(W-BW/2,e.clientX-r.left))};
   cv.onpointerdown=e=>{touching=true;try{cv.setPointerCapture(e.pointerId)}catch(x){}mv(e)};
   cv.onpointermove=e=>{if(touching)mv(e)};
   cv.onpointerup=cv.onpointercancel=()=>{touching=false};
   if(ok)c.listen('deviceorientation',e=>{
    if(touching||e.gamma==null)return;
    const p=Math.max(-1,Math.min(1,e.gamma/25));       // 좌우 기울기 25도면 끝까지 이동
    bx=W/2+p*(W/2-BW/2);
   });
   const pick=()=>{let r=Math.random()*100;for(const it of ITEMS){if((r-=it.w)<0)return it}return ITEMS[0]};
   c.every(()=>{
    const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
    const el=(now-t0)/1000,left=Math.max(0,TIME-el);
    spawn-=dt;
    if(spawn<=0){const it=pick();items.push({e:it.e,p:it.p,x:20+Math.random()*(W-40),y:-20,v:150+el*8+Math.random()*60});spawn=Math.max(.28,.65-el*.02)}
    items.forEach(i=>i.y+=i.v*dt);
    const by=H-34;
    items=items.filter(i=>{
     if(i.y>=by-14&&i.y<=by+18&&Math.abs(i.x-bx)<BW/2+8){
      score+=i.p;pops.push({x:i.x,y:by-30,t:.6,s:(i.p>0?'+':'')+i.p,c:i.p>0?'#2f9e55':'#e24b4a'});
      if(i.p<0){try{navigator.vibrate(80)}catch(x){}}
      return false;
     }
     return i.y<H+20;
    });
    pops.forEach(p=>{p.t-=dt;p.y-=40*dt});pops=pops.filter(p=>p.t>0);
    g.clearRect(0,0,W,H);
    g.font='30px serif';g.textAlign='center';g.textBaseline='middle';
    items.forEach(i=>g.fillText(i.e,i.x,i.y));
    g.fillText('🧺',bx,by);
    g.font='bold 18px sans-serif';
    pops.forEach(p=>{g.fillStyle=p.c;g.fillText(p.s,p.x,p.y)});
    if(now-lastLive>500){lastLive=now;c.live(score)}const sc=$('#sc'),tl=$('#tl');if(sc)sc.textContent=score;if(tl)tl.textContent=Math.ceil(left);
    if(left<=0){c.stop();c.submit(score)}
   },16);
  });
 }
});
