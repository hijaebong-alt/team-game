/*
 새 게임 만드는 법
 1) 이 파일을 복사해 games/ 폴더에 새 이름으로 저장합니다. 예: games/color.js
    (파일 이름 = 게임 id. 영문 소문자·숫자만, 맨 앞에 _ 를 붙이면 목록에서 제외됩니다)
 2) GitHub 저장소의 games 폴더에 업로드(Commit)하면 끝입니다.
    진행자 대기실의 "이번에 할 게임" 목록에 자동으로 나타납니다.
    (자동으로 안 보이면 games/list.json 에 "color.js" 한 줄을 추가하세요)

 c(게임 도우미)에서 쓸 수 있는 것
   c.ga          게임 화면 영역 (innerHTML 로 화면을 그립니다)
   c.ready(fn)   "준비됐어요" 버튼을 보여 주고 누르면 fn 실행
   c.every(f,ms) 반복 타이머 / c.after(f,ms) 한 번 타이머 (게임이 끝나면 자동 정리)
   c.listen(이벤트,f) window 이벤트 등록 (게임이 끝나면 자동 해제)
   c.stop()      타이머·이벤트 정리
   c.submit(값)  기록 제출 (게임당 1번). 이 값이 점수 계산에 쓰입니다.
 진행자 화면과 연동하는 게임(예: watermelon.js)은 아래를 추가로 씁니다.
   host(c)     진행자 화면에 그림을 그리는 함수. c.el(영역), c.set(값)(참가자에게 전달), c.every, c.after
   c.watch(fn) (참가자) 진행자가 보낸 값을 받는 함수.  c.live(값) 진행 중 기록을 미리 저장
 공용 도구: $('#id'), askMotion('motion'|'orient'), shakeGame(...)
*/
registerGame({
 id:'template',            // 파일 이름과 같게
 order:99,                 // 목록 순서(작을수록 앞)
 name:'예시 게임',
 desc:'버튼을 5번 누르세요. (빠를수록 좋음)',
 hi:false,                 // true: 값이 클수록 우승 / false: 값이 작을수록 우승
 fmt:v=>v+'ms',            // 기록 표시 방식
 run(c){
  c.ready(()=>{
   let n=0;const t0=performance.now();
   c.ga.innerHTML='<button class="p" id="pad" style="height:160px">0/5</button>';
   $('#pad').onpointerdown=e=>{
    e.preventDefault();n++;$('#pad').textContent=n+'/5';
    if(n>=5)c.submit(Math.round(performance.now()-t0));
   };
  });
 }
});
