/********************
 * Morse Typing Game
 ********************/

/* --- Morse mapping --- */
const morseMap = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
  F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
  P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

/* --- 固定題庫順序 --- */
const letters = ["L", "O", "I", "D"];
let letterIndex = 0;
let currentLetter = "";

let timer;
let timeLeft = 30;
let correct = 0;
let wrong = 0;

/* --- DOM 快取 --- */
const gameArea = document.getElementById("gameArea"); // 這個在 HTML script 裡有，獨立JS檔需要補上
const timerEl = document.getElementById("timer");
const morseEl = document.getElementById("morse");
const answerEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const correctEl = document.getElementById("correct");
const wrongEl = document.getElementById("wrong");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const playBtn = document.getElementById("playBtn"); // 【修正1】補上對 playBtn 的 DOM 快取

/* ---------- 遊戲流程 ---------- */
function startGame() {
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("startBtn").style.display = 'none'; // 也可以隱藏開始按鈕
  resetScore();
  letterIndex = 0;
  newQuestion();
}

function resetGame() {
  location.reload();       // 最簡重置
}

function resetScore() {
  correct = 0;
  wrong   = 0;
  correctEl.textContent = 0;
  wrongEl.textContent   = 0;
}

/* ----- 題目產生與計時 ----- */
function newQuestion() {
  // UI 初始化
  nextBtn.disabled   = true;
  submitBtn.disabled = false;
  feedbackEl.textContent = "";
  answerEl.value     = "";
  answerEl.disabled  = false;
  answerEl.focus();

  // Timer
  clearInterval(timer);
  timeLeft = 30;
  updateTimer();
  timer = setInterval(handleTick, 1000);

  // 依順序取題
  currentLetter = letters[letterIndex];
  letterIndex   = (letterIndex + 1) % letters.length;

  const code = morseMap[currentLetter];
  morseEl.textContent = code;
  playMorseAudio(code);   // 題目出現即播放一次
}

function handleTick() {
  timeLeft--;
  updateTimer();
  if (timeLeft <= 0) {
    clearInterval(timer);
    handleAnswer(null, true);   // timeout
  }
}

function updateTimer() {
  timerEl.textContent = `Time Left: ${timeLeft}s`;
}

/* ----- 互動 ----- */
function playCurrentMorse() {
  playMorseAudio(morseMap[currentLetter]);
}

function checkAnswer() {
  const userInput = answerEl.value.trim().toUpperCase();
  handleAnswer(userInput === currentLetter, false);
}

/* ----- 結果處理 ----- */
function handleAnswer(isCorrect, isTimeout) {
  clearInterval(timer);

  submitBtn.disabled = true;
  answerEl.disabled  = true;
  nextBtn.disabled   = false;

  if (isTimeout) {
    wrong++;
    showFeedback(`⏰ Time's up! Correct answer: ${currentLetter}`, "orange");
  } else if (isCorrect) {
    correct++;
    playSoundSafely("bingo");
    showFeedback("✔ Correct!", "green");
  } else {
    wrong++;
    playSoundSafely("wrongSound");
    showFeedback(`✘ Wrong! Correct answer: ${currentLetter}`, "red");
  }

  correctEl.textContent = correct;
  wrongEl.textContent   = wrong;
}

function showFeedback(msg, color) {
  feedbackEl.textContent = msg;
  feedbackEl.style.color = color;
}

/* ---------- 音訊 ---------- */
function playSoundSafely(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0; // 確保可以重播
    if (audio.readyState >= 3) {
        audio.play().catch(e => console.error("Audio play failed:", e));
    } else {
        audio.oncanplaythrough = () => audio.play().catch(e => console.error("Audio play failed:", e));
    }
  }
}

/* Morse 點線播放 */
function playMorseAudio(code) {
  let i = 0;
  playBtn.disabled = true; // 播放時禁用按鈕，防止重疊播放

   function playNext() {
    if (i >= code.length) {
      playBtn.disabled = false; // 播放完畢，重新啟用按鈕
      return;
    }
    const char  = code[i++];
    const soundId = char === "." ? "dot" : "dash";
    const sound = document.getElementById(soundId);
    
    sound.onended = () => {
      // 播放完畢後，等待一小段時間再播下一個
      setTimeout(playNext, 150);
    };
    
    sound.currentTime = 0;
    sound.play().catch(e => console.error("Morse audio failed:", e));
  }
  playNext();
}

/* ---------- 事件綁定 ---------- */
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
submitBtn.addEventListener("click", checkAnswer);
playBtn.addEventListener("click", playCurrentMorse);
nextBtn.addEventListener("click", newQuestion);

// 【修正2】為輸入框加入鍵盤事件，實現 Enter 提交
answerEl.addEventListener("keydown", function(event) {
  // 檢查是否按下 Enter 鍵且提交按鈕是可用的
  if (event.key === "Enter" && !submitBtn.disabled) {
    event.preventDefault(); // 防止表單預設提交行為 (如果有的話)
    checkAnswer();
  }
});