/********************
 * Morse Typing Game – Web‑Audio API 版本
 * (最穩定、最可靠的方案)
 ********************/
const morseMap = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

const baseLetters = ["L", "O", "I", "D"];  // 4 個字母產生 8 道題目
const totalQuestions = 8;

/* --- 遊戲狀態 --- */
let letterIndex = 0; // 範圍: 0–7
let currentLetter = "";
let timer;
let timeLeft = 6000; // 100 分鐘 (6000 秒)
let correct = 0;
let wrong = 0;

/* --- DOM 快取 --- */
const $ = (id) => document.getElementById(id);
const gameArea = $("gameArea");
const gamePromptEl = gameArea.querySelector("p");
const timerEl = $("timer");
const morseEl = $("morse");
const answerEl = $("answer");
const feedbackEl = $("feedback");
const correctEl = $("correct");
const wrongEl = $("wrong");
const nextBtn = $("nextBtn");
const submitBtn = $("submitBtn");
const playBtn = $("playBtn");
const questionCounterEl = $("questionCounter");

const bingoAudio = $("bingo");
const wrongAudio = $("wrongSound");

/* --- Web Audio API 聲音產生器 --- */
// 建立音訊上下文 (AudioContext)，這是 Web Audio API 的入口
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

// 產生嗶聲的函式
function beep(duration = 120, freq = 700) {
  if (!audioCtx) return; // 如果音訊上下文未初始化，則不執行
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine"; // 音色
  osc.frequency.value = freq; // 音高
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);

  osc.stop(audioCtx.currentTime + duration / 1000);
  return new Promise(res => setTimeout(res, duration + 30));
}

// 使用 async/await 來依序播放摩斯電碼
async function playMorseAudio(code) {
  playBtn.disabled = true;
  for (const char of code) {
    if (char === ".") {
      await beep(120, 700); // 短音
    } else if (char === "-") {
      await beep(360, 700); // 長音
    }
    await new Promise(r => setTimeout(r, 80)); // 點劃之間的間隔
  }
  playBtn.disabled = false;
}

function playSoundSafely(el) {
  if (!audioCtx || !el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

/* ---------- 遊戲流程 ---------- */
function startGame() {
  // 在使用者首次互動時，初始化並激活音訊上下文
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  audioCtx.resume();

  gameArea.style.display = "block";
  $("startBtn").style.display = "none";
  resetScore();
  letterIndex = 0;
  newQuestion();
}

function resetGame() { location.reload(); }
function resetScore() { correct = 0; wrong = 0; correctEl.textContent = 0; wrongEl.textContent = 0; }

function newQuestion() {
  if (letterIndex >= totalQuestions) { return endGame(); }

  questionCounterEl.textContent = `Question ${letterIndex + 1} / ${totalQuestions}`;
  currentLetter = baseLetters[Math.floor(letterIndex / 2)];
  const isFirstOfPair = (letterIndex % 2 === 0);

  if (isFirstOfPair) {
    gamePromptEl.textContent = "Listen carefully and guess the letter!";
    morseEl.textContent = "???";
    morseEl.style.color = "#999";
  } else {
    gamePromptEl.textContent = "What letter is this? (Same as the last round)";
    morseEl.textContent = morseMap[currentLetter];
    morseEl.style.color = "#0056b3";
  }

  nextBtn.disabled = true;
  nextBtn.textContent = "Next";
  submitBtn.disabled = false;
  playBtn.disabled = false;
  feedbackEl.textContent = "";
  answerEl.value = "";
  answerEl.disabled = false;
  answerEl.focus();

  clearInterval(timer);
  timeLeft = 30;
  updateTimer();
  timer = setInterval(handleTick, 1000);
}

function handleTick() {
  timeLeft--;
  updateTimer();
  if (timeLeft <= 0) { clearInterval(timer); handleAnswer(null, true); }
}
const updateTimer = () => timerEl.textContent = `Time Left: ${timeLeft}s`;

function checkAnswer() {
  handleAnswer(answerEl.value.trim().toUpperCase() === currentLetter, false);
}

function handleAnswer(isCorrect, isTimeout) {
  clearInterval(timer);
  submitBtn.disabled = true;
  answerEl.disabled = true;
  nextBtn.disabled = false;
  playBtn.disabled = true;

  if (letterIndex === totalQuestions - 1) nextBtn.textContent = "Finish";

  if (isTimeout) {
    wrong++; showFeedback(`⏰ Time's up! Correct answer: ${currentLetter}`, "orange");
  } else if (isCorrect) {
    correct++; playSoundSafely(bingoAudio); showFeedback("✔ Correct!", "green");
  } else {
    wrong++; playSoundSafely(wrongAudio); showFeedback(`✘ Wrong! Correct answer: ${currentLetter}`, "red");
  }
  correctEl.textContent = correct;
  wrongEl.textContent = wrong;
  letterIndex++;
}

function showFeedback(msg, color) { feedbackEl.textContent = msg; feedbackEl.style.color = color; }

function endGame() {
  feedbackEl.innerHTML = `🎉 Game Over!<br>Your final score is ${correct} / ${totalQuestions}.`;
  feedbackEl.style.color = "blue";
  answerEl.disabled = true;
  submitBtn.disabled = true;
  nextBtn.disabled = true;
  playBtn.disabled = true;
  timerEl.textContent = "Finished!";
  questionCounterEl.textContent = "All questions completed!";
}

/* ---------- 事件綁定 ---------- */
$("startBtn").addEventListener("click", startGame);
$("resetBtn").addEventListener("click", resetGame);
submitBtn.addEventListener("click", checkAnswer);
playBtn.addEventListener("click", () => playMorseAudio(morseMap[currentLetter] || ""));
nextBtn.addEventListener("click", newQuestion);
answerEl.addEventListener("keydown", (e) => { if (e.key === "Enter" && !submitBtn.disabled) { e.preventDefault(); checkAnswer(); } });