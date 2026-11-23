/* SOS 신호 보내기: 짧게(●)·길게(▬) 눌러 모스 부호 SOS(● ● ● ▬ ▬ ▬ ● ● ●)를 보내는 게임. 진행자 화면에는 팀별 신호탑이 나옴 */
(function(){
const NOW=()=>typeof serverNow==='function'?serverNow():Date.now();
const PATTERN=['S','S','S','L','L','L','S','S','S'];       // S=짧게(점), L=길게(선)
const DUR=40000,DASH=400,TOOLONG=1600,IDLE=3000;             // 게임 시간(ms), 길게로 인정되는 최소 누름(ms), 너무 길게 누른 경우(ms), 중간에 멈추면 처음부터(ms)
registerGame({
 id:'sos',
 order:20,
 name:'SOS 신호 보내기',
 story:'AI가 모든 통신망을 차단했습니다. 마지막 수단은 전파가 아니라 사람의 손으로 보내는 모스 부호입니다! SOS 신호(● ● ● ▬ ▬ ▬ ● ● ●)를 쉬지 않고 보내 구조대에 인류의 위치를 알리세요. 팀원 모두가 많이 보낼수록 신호가 멀리 퍼집니다.',
 desc:'폰 화면의 큰 버튼으로 모스 부호 SOS를 보내세요. 짧게 톡 누르면 점(●), 0.4초 이상 꾹 누르면 선(▬)입니다. ● ● ● ▬ ▬ ▬ ● ● ● 순서대로 누르면 SOS 1회 전송 성공! 틀리거나 3초 이상 멈추면 처음부터 다시 보내야 합니다. 40초 동안 가장 많이 보낸 팀(팀원 평균)이 승리합니다. (높을수록 좋음)',
 hi:true,
 fmt:v=>v+'회 전송',

 /* ---- 진행자 화면: 팀별 신호탑 ---- */
 host(c){
  if(!c.onResults){c.el.innerHTML='<p style="color:#e24b4a">index.html이 예전 버전입니다. 최신 index.html을 올린 뒤 Ctrl+F5로 새로고침하세요.</p>';return}
  const PRE=10;                                              // 시작 전 준비(초)
  const COL=['#e24b4a','#378add','#c98f00','#2f9e55'],TN=['빨강','파랑','노랑','초록'];
  const size=Array.from({length:c.n},(_,t)=>c.players.filter(p=>p.team===t).length);
  const t0=NOW()+PRE*1000;
  c.set({t0,dur:DUR});
  const tot=Array(c.n).fill(0);let maxv=8,ended=false;
  c.el.innerHTML='<style>@keyframes sosPop{0%{opacity:1;transform:translateY(0) scale(.6)}60%{opacity:1;transform:translateY(-14px) scale(1.2)}100%{opacity:0;transform:translateY(-30px) scale(1)}}</style>'
   +'<div style="text-align:center"><p class="big" id="tm" style="margin:0"></p>'
   +'<div style="font-size:40px;font-weight:800;letter-spacing:4px;margin:2px 0 8px">● ● ●　▬ ▬ ▬　● ● ●</div>'
   +'<div style="display:flex;gap:12px">'+Array.from({length:c.n},(_,t)=>'<div style="flex:1;min-width:0">'
    +'<div style="position:relative;height:230px;border-radius:12px;overflow:hidden;background:radial-gradient(circle at 50% 100%,#2a3b8f,#0b1230)">'
    +'<div id="bm'+t+'" style="position:absolute;left:calc(50% - 4px);bottom:70px;width:8px;height:0;background:linear-gradient(0deg,'+COL[t]+',transparent);border-radius:4px;transition:height .5s"></div>'
    +'<div id="sos'+t+'" style="position:absolute;top:16px;left:0;right:0;font-size:30px;font-weight:800;color:#ffd54a;opacity:0">SOS!</div>'
    +'<div style="position:absolute;bottom:6px;left:0;right:0;font-size:62px;line-height:1">🗼</div></div>'
    +'<b style="color:'+COL[t]+';font-size:20px">'+TN[t]+' 팀</b> <span id="cr'+t+'"></span>'
    +'<div id="n'+t+'" style="font-size:42px;font-weight:800;line-height:1.1">0</div><div class="mu" style="font-size:13px">SOS 전송 합계</div>'
    +'<div class="mu" id="av'+t+'" style="font-size:14px">평균 0.0회</div></div>').join('')+'</div></div>';
  const q=s=>c.el.querySelector(s);
  const T=(id,t)=>{const e=q(id);if(e&&e.textContent!==t)e.textContent=t};
  let ac=window.__wac;if(!ac){try{ac=window.__wac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  try{ac&&ac.resume()}catch(e){}
  const blip=(f)=>{if(!ac)return;try{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.1;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.09)}catch(e){}};
  const draw=()=>{
   const avg=tot.map((x,t)=>size[t]?x/size[t]:0),mx=Math.max(...avg);if(mx*1.1>maxv)maxv=mx*1.1;
   for(let t=0;t<c.n;t++){
    T('#n'+t,String(tot[t]));T('#av'+t,'평균 '+avg[t].toFixed(1)+'회');
    const b=q('#bm'+t);if(b)b.style.height=(avg[t]/maxv*150)+'px';
    T('#cr'+t,(mx>0&&avg[t]===mx&&avg.filter(x=>x===mx).length===1)?'👑':'');
   }
  };
  c.onResults(rs=>{
   for(let t=0;t<c.n;t++){
    const sum=rs.filter(r=>r.team===t&&typeof r.v==='number').reduce((a,r)=>a+r.v,0);
    if(sum>tot[t]){const e=q('#sos'+t);if(e){e.style.animation='none';void e.offsetWidth;e.style.animation='sosPop 1s ease-out forwards'}blip(880)}   // 새 SOS가 전송될 때마다 SOS! 표시
    tot[t]=sum;
   }
   draw();
  });
  c.every(()=>{
   const tt=NOW()-t0;
   if(tt<0){T('#tm','시작까지 '+Math.ceil(-tt/1000)+'초');return}
   if(tt<DUR){T('#tm','남은 시간 '+Math.ceil((DUR-tt)/1000)+'초');return}
   T('#tm','🎉 끝! 결과 공개를 눌러 주세요');
   if(!ended&&tt>DUR+1500){ended=true;c.set({t0,dur:DUR,end:true})}
  },100);
 },

 /* ---- 참가자 화면: 짧게·길게 눌러 SOS ---- */
 run(c){
  c.ready(()=>{
   let g=null,i=0,count=0,down=0,lastUp=0,sent=false,local=0;
   c.ga.innerHTML='<p class="mu" id="st" style="text-align:center">진행자 화면을 보세요!</p><p class="big" id="tl" style="margin:0">…</p>'
    +'<div id="sl" style="display:flex;justify-content:center;align-items:center;gap:7px;margin:10px 0;height:34px"></div>'
    +'<div id="pad" style="height:210px;border-radius:50%;margin:6px auto;width:210px;background:#3a3c40;color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;touch-action:none;user-select:none;text-align:center">대기 중</div>'
    +'<p class="big" id="fb" style="font-size:22px;height:30px;margin:6px 0 0"></p><p class="mu" id="sc" style="text-align:center;margin:0">전송한 SOS: 0회</p>';
   const T=(id,t)=>{const e=$(id);if(e&&e.textContent!==t)e.textContent=t};
   const say=t=>{T('#fb',t);c.after(()=>{if($('#fb')&&$('#fb').textContent===t)T('#fb','')},900)};
   const slots=()=>{const e=$('#sl');if(e)e.innerHTML=PATTERN.map((s,k)=>'<span style="display:inline-block;'+(s==='S'?'width:16px;height:16px;border-radius:50%;':'width:36px;height:14px;border-radius:7px;')+'background:'+(k<i?'#2f9e55':'#555')+'"></span>').join('')};
   slots();
   const playing=()=>g&&g.t0&&NOW()>=g.t0&&NOW()<g.t0+g.dur;
   const finish=()=>{if(sent)return;sent=true;c.stop();c.submit(count)};
   c.watch(gg=>{g=gg;if(g&&g.end)finish()});
   const pad=$('#pad');
   const hold=()=>{if(!down)return;const d=performance.now()-down;T('#pad',d>=TOOLONG?'너무 길어요':d>=DASH?'▬':'●')};
   pad.onpointerdown=e=>{
    e.preventDefault();if(!playing())return;
    try{pad.setPointerCapture(e.pointerId)}catch(x){}
    const now=performance.now();if(i>0&&now-lastUp>IDLE){i=0;slots();say('시간이 지났어요. 처음부터!')}
    down=now;pad.style.background='#2f6fed';
   };
   const up=()=>{
    if(!down)return;const d=performance.now()-down;down=0;lastUp=performance.now();pad.style.background='#3a3c40';T('#pad','누르세요');
    if(!playing())return;
    const sym=d>=TOOLONG?'X':d>=DASH?'L':'S';
    try{navigator.vibrate(sym==='L'?120:40)}catch(x){}
    if(sym===PATTERN[i]){
     i++;
     if(i>=PATTERN.length){count++;i=0;c.live(count);T('#sc','전송한 SOS: '+count+'회');say('📡 SOS 전송 성공!');try{navigator.vibrate([60,40,60,40,200])}catch(x){}}
    }else{
     i=(sym==='S')?1:0;say(sym==='X'?'너무 길게 눌렀어요. 처음부터!':'✘ 순서가 달라요. 처음부터!');
    }
    slots();
   };
   pad.onpointerup=up;pad.onpointercancel=up;
   c.every(()=>{
    hold();
    if(!g||!g.t0){if(++local>25&&!g){T('#st','진행자 화면과 연결 중…')}return}
    const tt=NOW()-g.t0;
    if(tt<0){T('#tl',Math.ceil(-tt/1000)+'초 뒤 시작');T('#st','준비! 엄지로 버튼을 눌러 보세요');T('#pad','곧 시작');return}
    if(tt<g.dur){T('#tl','남은 시간 '+Math.ceil((g.dur-tt)/1000)+'초');T('#st','● ● ● ▬ ▬ ▬ ● ● ● 순서로!');if(!down&&$('#pad').textContent==='곧 시작')T('#pad','누르세요');return}
    T('#tl','끝!');finish();
   },50);
  });
 }
});
})();
