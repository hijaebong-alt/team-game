/* 균형 잡기 */
registerGame({
 id:"bal",
 order:9,
 name:"균형 잡기",
 story:"AI가 조종하는 레이저가 움직이는 안전 구역을 비추고 있습니다. 폰을 기울여 파란 공을 안전 구역 안에 계속 머물게 하세요. 균형을 잃으면 AI에게 들킵니다.",
 desc:"15초 동안 스마트폰을 좌우로 기울여 파란 공을 움직이는 초록 영역 안에 머무르세요. 센서가 안 되면 ◀ ▶ 버튼으로 조작합니다. (오래 머물수록 좋음)",
 hi:true, // true: 높은 값이 우승, false: 낮은 값이 우승
 fmt:v=>(v/10)+'초',
 run(c){c.ready(async()=>{const ok=await askMotion('orient');let pos=0,started=false,ms=0,t0=0,fb=false;
  const run=m=>{started=true;fb=m==='touch';
   c.ga.innerHTML='<p class="big" id="tl">15</p><div style="position:relative;height:70px;background:var(--bg);border:1px solid var(--bd);border-radius:12px;overflow:hidden"><div id="zn" style="position:absolute;top:0;bottom:0;width:30%"></div><div id="dt" style="position:absolute;top:15px;width:40px;height:40px;border-radius:50%;background:var(--pr)"></div></div>'+(fb?'<div class="row" style="margin-top:12px"><button id="bl" style="height:90px;font-size:26px">◀</button><button id="br" style="height:90px;font-size:26px">▶</button></div>':'<p class="mu">좌우로 기울이세요</p>');
   if(fb){$('#bl').onpointerdown=e=>{e.preventDefault();pos=Math.max(-1,pos-.15)};$('#br').onpointerdown=e=>{e.preventDefault();pos=Math.min(1,pos+.15)}}
   t0=performance.now();let left=15;
   c.every(()=>{left--;$('#tl').textContent=left;if(left<=0){c.stop();c.submit(Math.round(ms/100))}},1000);
   c.every(()=>{const t=(performance.now()-t0)/1000,z=Math.sin(t*.9)*.5+Math.sin(t*2.3)*.2,inz=Math.abs(pos-z)<.3;if(inz)ms+=50;
    const zn=$('#zn'),dt=$('#dt');if(!zn)return;zn.style.left=(50+z*50-15)+'%';zn.style.background=inz?'#2f9e5599':'#2f9e5533';dt.style.left='calc(50% - 20px + '+pos+' * (50% - 20px))'},50)};
  if(ok){c.ga.innerHTML='<p class="mu">기울기 센서 확인 중…</p>';
   c.listen('deviceorientation',e=>{if(e.gamma==null)return;if(!started)run('motion');pos=Math.max(-1,Math.min(1,e.gamma/30))});
   c.after(()=>{if(!started)run('touch')},1300)}else run('touch')})}
});
