/* 수박 자르기: 진행자 화면에 나온 방향대로 스마트폰 화면을 쓱 그어 자르는 게임 */
registerGame({
 id:'watermelon',
 order:12,
 name:'수박 자르기',
 desc:'진행자 화면에 수박을 자르는 방향(가로·세로·대각선 2가지)이 나옵니다. 스마트폰을 세로로 잡고 같은 방향으로 휘두르면 1번 인정되고, 방향이 다르면 세지 않습니다. (예: 위에서 아래로 자르는 그림이면 폰을 위에서 아래로 움직이기) 한 방향당 1번만 인정됩니다. (많을수록 좋음)',
 hi:true,
 fmt:v=>v+'번',

 /* ---- 진행자 화면: 자르는 그림을 순서대로 보여 줌 ---- */
 host(c){
  const ROUNDS=12,MS=3000,PRE=10;          // 12번, 방향당 3초, 시작 전 10초
  const ANG=[0,90,45,-45];                  // 가로, 세로, ↘, ↗
  const NAME=['가로 ↔','세로 ↕','대각선 ↘','대각선 ↗'];
  c.el.innerHTML='<style>@keyframes wmcut{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}</style>'
   +'<div style="text-align:center"><svg viewBox="0 0 300 300" width="240" height="240" style="max-width:100%">'
   +'<circle cx="150" cy="150" r="130" fill="#2f7d3b"/><circle cx="150" cy="150" r="118" fill="#d7ecc8"/><circle cx="150" cy="150" r="108" fill="#e24b4a"/>'
   +[[110,110],[190,120],[130,185],[185,185],[150,150],[100,160],[200,150]].map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="5" ry="9" fill="#222" transform="rotate(25 '+p[0]+' '+p[1]+')"/>').join('')
   +'<g id="cut" transform="translate(150 150) rotate(0)"></g></svg>'
   +'<p class="big" id="hr">준비</p><p class="mu" id="hn"></p></div>';
  const cut=c.el.querySelector('#cut'),hr=c.el.querySelector('#hr'),hn=c.el.querySelector('#hn');
  const draw=d=>{cut.setAttribute('transform','translate(150 150) rotate('+ANG[d]+')');
   cut.innerHTML='<line x1="-140" y1="0" x2="140" y2="0" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="300" style="animation:wmcut .5s ease-out"/>'
    +'<line x1="-140" y1="0" x2="140" y2="0" stroke="#222" stroke-width="3" stroke-linecap="round" stroke-dasharray="300" style="animation:wmcut .5s ease-out"/>'
    +'<polygon points="148,0 124,-13 124,13" fill="#222"/><polygon points="-148,0 -124,-13 -124,13" fill="#222"/>'};
  let r=-1,prev=-1,pre=PRE;
  c.set({r:-1});
  hr.textContent='준비!';hn.textContent=PRE+'초 뒤 시작';
  const t=c.every(()=>{pre--;hn.textContent=pre+'초 뒤 시작';if(pre<=0){clearInterval(t);next()}},1000);
  const next=()=>{
   r++;
   if(r>=ROUNDS){c.set({done:true,r:ROUNDS});hr.textContent='끝!';hn.textContent='진행자 메뉴에서 결과 공개를 누르세요';cut.innerHTML='';return}
   let d;do{d=Math.floor(Math.random()*4)}while(d===prev);prev=d;
   c.set({r,d});draw(d);hr.textContent=(r+1)+' / '+ROUNDS;hn.textContent=NAME[d];
   c.after(next,MS);
  };
 },

 /* ---- 참가자 화면: 스마트폰을 같은 방향으로 휘두르기 (센서가 안 되면 화면 긋기로 대체) ---- */
 run(c){
  const THR=5;                               // 휘두름으로 인정되는 가속도(m/s²). 너무 민감하면 올리세요
  c.ready(async()=>{
   const ok=await askMotion('motion');
   let n=0,dir=-1,cur=-1,counted=-1,done=false,mode='';
   c.live(0);
   const say=t=>{const f=$('#fb');if(f){f.textContent=t;c.after(()=>{const g=$('#fb');if(g)g.textContent=''},700)}};
   const judge=k=>{
    if(done)return;
    if(dir<0){say('아직이에요');return}
    if(k===dir&&counted!==cur){counted=cur;n++;const e=$('#sc');if(e)e.textContent=n;c.live(n);say('✔ 잘랐어요! +1');try{navigator.vibrate(60)}catch(x){}}
    else if(counted===cur)say('이미 잘랐어요');
    else say('✘ 방향이 달라요');
   };
   const frame=inner=>{c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">진행자 화면을 보세요!</p><p class="big" id="sc">'+n+'</p>'+inner+'<p class="mu" id="fb" style="text-align:center;height:24px"></p>';
    if(cur>=0){const s=$('#st');if(s)s.textContent=(cur+1)+'번째 · 진행자 화면의 방향대로!'}};
   c.watch(g=>{
    if(!g)return;
    if(g.done&&!done){done=true;c.submit(n);return}
    if(g.r>=0&&g.r!==cur){cur=g.r;dir=g.d;const s=$('#st');if(s)s.textContent=(cur+1)+'번째 · 진행자 화면의 방향대로!'}
   });
   /* 화면 긋기(대체 방식) */
   const buildTouch=()=>{
    mode='touch';
    frame('<div id="pad" style="height:240px;border-radius:16px;background:var(--bg);border:2px dashed var(--bd);display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;color:var(--mu)">센서를 쓸 수 없어요 · 여기에 쓱 그으세요</div>');
    const pad=$('#pad');let sx=0,sy=0,down=false;
    pad.onpointerdown=e=>{e.preventDefault();down=true;sx=e.clientX;sy=e.clientY;try{pad.setPointerCapture(e.pointerId)}catch(x){}};
    pad.onpointerup=e=>{if(!down)return;down=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)<60)return;
     const o=((Math.atan2(dy,dx)*180/Math.PI)%180+180)%180;
     judge(o<22.5||o>=157.5?0:o<67.5?2:o<112.5?1:3)};
    pad.onpointercancel=()=>{down=false};
   };
   /* 스마트폰 휘두르기 */
   const buildMotion=()=>{mode='motion';frame('<div style="height:220px;display:flex;align-items:center;justify-content:center;font-size:72px">📱</div><p class="mu" style="text-align:center">폰을 세로로 잡고 같은 방향으로 휘두르세요</p>')};
   if(!ok){buildTouch();return}
   c.ga.innerHTML='<p class="mu">움직임 센서 확인 중…</p>';
   let lp=null,warm=0,active=false,sxx=0,syy=0,sxy=0,peak=0,t0=0,low=0,cool=0;
   const finish=(timeout)=>{
    active=false;const now=performance.now();cool=now+450;
    if(timeout||peak<THR*1.3)return;
    const th=0.5*Math.atan2(2*sxy,sxx-syy)*180/Math.PI,o=((th%180)+180)%180;
    // 기기 좌표(y는 위쪽): 45°는 ↗, 135°는 ↘
    judge(o<22.5||o>=157.5?0:o<67.5?3:o<112.5?1:2);
   };
   c.listen('devicemotion',e=>{
    let ax,ay;const a=e.acceleration,g=e.accelerationIncludingGravity;
    if(a&&a.x!=null&&a.y!=null){ax=a.x;ay=a.y}
    else if(g&&g.x!=null){if(!lp)lp={x:g.x,y:g.y};lp.x=lp.x*.9+g.x*.1;lp.y=lp.y*.9+g.y*.1;ax=g.x-lp.x;ay=g.y-lp.y}
    else return;
    if(!mode)buildMotion();
    if(mode!=='motion'||done||++warm<15)return;
    const now=performance.now();if(now<cool)return;
    const m=Math.hypot(ax,ay);
    if(!active&&m>THR){active=true;sxx=syy=sxy=0;peak=0;t0=now;low=0}
    if(active){
     sxx+=ax*ax;syy+=ay*ay;sxy+=ax*ay;peak=Math.max(peak,m);
     if(m<THR/2){if(!low)low=now;if(now-low>120)finish(false)}else low=0;
     if(now-t0>900)finish(true);
    }
   });
   c.after(()=>{if(!mode)buildTouch()},1500);
  });
 }
});
