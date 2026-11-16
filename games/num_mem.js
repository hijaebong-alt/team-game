/* 숫자를 기억하라! — 팀 대항 숫자 입력 기억력 게임 (총 10라운드) */
registerGame({
 id: "num_mem",
 order: 1,
 name: "숫자를 기억하라!",
 desc: "화면의 숫자를 기억해 제한 시간 내에 정확히 입력하세요. 총 10라운드(4~10자리), 라운드당 정답 10점(만점 100점)입니다.",
 hi: true, // 높은 점수가 우승
 fmt: v => v + "점 (" + Math.floor(v / 10) + "/10 정답)",
 run(c) {
  // 라운드별 난이도 구성 (총 10라운드)
  // 1~3R: 4자리 / 공개 5초 / 입력 6초
  // 4~6R: 6자리 / 공개 4초 / 입력 7초
  // 7~8R: 8자리 / 공개 3초 / 입력 8초
  // 9~10R: 10자리 / 공개 2초 / 입력 10초
  const ROUNDS = [
   { len: 4, showSec: 5, inputSec: 6 },
   { len: 4, showSec: 5, inputSec: 6 },
   { len: 4, showSec: 5, inputSec: 6 },
   { len: 6, showSec: 4, inputSec: 7 },
   { len: 6, showSec: 4, inputSec: 7 },
   { len: 6, showSec: 4, inputSec: 7 },
   { len: 8, showSec: 3, inputSec: 8 },
   { len: 8, showSec: 3, inputSec: 8 },
   { len: 10, showSec: 2, inputSec: 10 },
   { len: 10, showSec: 2, inputSec: 10 }
  ];

  const makeDigits = len => {
   let s = "";
   for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
   return s;
  };

  c.ready(() => {
   let idx = 0;
   let score = 0;

   const nextRound = () => {
    if (idx >= ROUNDS.length) {
     c.submit(score);
     return;
    }

    const cfg = ROUNDS[idx];
    const target = makeDigits(cfg.len);
    const rNum = idx + 1;

    // 1단계: 숫자 공개
    let showLeft = cfg.showSec;
    c.ga.innerHTML =
     '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="mu"><b>' + rNum + ' / 10 라운드</b> (' + cfg.len + '자리)</span>' +
      '<span class="mu">현재 점수: <b>' + score + '점</b></span>' +
     '</div>' +
     '<p class="mu" style="text-align:center;margin:12px 0 4px">숫자를 기억하세요! (<b id="st">' + showLeft + '</b>초)</p>' +
     '<div class="card" style="background:var(--bg);margin:8px 0;padding:20px 8px">' +
      '<div class="big" style="letter-spacing:4px;font-size:32px;word-break:break-all">' + target + '</div>' +
     '</div>';

    const showTimer = c.every(() => {
     showLeft--;
     const st = $('#st');
     if (st) st.textContent = Math.max(0, showLeft);
     if (showLeft <= 0) {
      clearInterval(showTimer);
      waitPhase();
     }
    }, 1000);

    // 2단계: 숫자 사라짐 및 잠시 대기 시간 (1초)
    const waitPhase = () => {
     c.ga.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
       '<span class="mu"><b>' + rNum + ' / 10 라운드</b> (' + cfg.len + '자리)</span>' +
       '<span class="mu">현재 점수: <b>' + score + '점</b></span>' +
      '</div>' +
      '<p class="big" style="margin:28px 0;color:var(--mu)">준비...</p>' +
      '<p class="mu" style="text-align:center">곧 입력창이 열립니다</p>';

     c.after(inputPhase, 1000);
    };

    // 3단계: 정답 입력 (제한 시간 적용)
    const inputPhase = () => {
     let inLeft = cfg.inputSec;
     let done = false;

     c.ga.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
       '<span class="mu"><b>' + rNum + ' / 10 라운드</b> (' + cfg.len + '자리)</span>' +
       '<span class="mu">남은 시간: <b id="it" style="color:#e24b4a">' + inLeft + '</b>초</span>' +
      '</div>' +
      '<p class="mu" style="margin:10px 0 4px">기억한 ' + cfg.len + '자리 숫자를 입력하세요</p>' +
      '<input id="ans" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="' + cfg.len + '" placeholder="' + cfg.len + '자리 숫자 입력" autocomplete="off" style="font-size:24px;text-align:center;letter-spacing:4px;font-weight:700">' +
      '<button class="p w" id="sub">정답 제출</button>';

     const inp = $('#ans');
     const btn = $('#sub');
     inp.focus();

     // 숫자만 입력되도록 필터링
     inp.oninput = () => {
      inp.value = inp.value.replace(/[^0-9]/g, '');
     };

     const finishRound = isTimeout => {
      if (done) return;
      done = true;
      clearInterval(inTimer);

      const val = inp.value.trim();
      const isCorrect = !isTimeout && val === target;
      if (isCorrect) score += 10;

      // 4단계: 정답 확인 및 점수 획득 피드백 (1.3초 후 다음 라운드)
      c.ga.innerHTML =
       '<div style="text-align:center;padding:12px 0">' +
        '<p class="big" style="color:' + (isCorrect ? '#2f9e55' : '#e24b4a') + ';margin:8px 0">' +
         (isCorrect ? '정답! (+10점)' : (isTimeout ? '시간 초과! (0점)' : '오답! (0점)')) +
        '</p>' +
        '<p class="mu">제시 숫자: <b>' + target + '</b></p>' +
        '<p class="mu">입력 숫자: <b>' + (val || '(미입력)') + '</b></p>' +
        '<p class="mu" style="margin-top:10px">누적 점수: <b>' + score + '점</b></p>' +
       '</div>';

      idx++;
      c.after(nextRound, 1300);
     };

     const inTimer = c.every(() => {
      inLeft--;
      const it = $('#it');
      if (it) it.textContent = Math.max(0, inLeft);
      if (inLeft <= 0) finishRound(true);
     }, 1000);

     btn.onclick = () => finishRound(false);
     inp.onkeydown = e => {
      if (e.key === 'Enter') {
       e.preventDefault();
       finishRound(false);
      }
     };
    };
   };

   nextRound();
  });
 }
});
