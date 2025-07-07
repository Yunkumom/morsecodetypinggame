/********************
 * Morse Typing Game
 ********************/
const morseMap = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

const letters = ["L", "O", "I", "D"];
let letterIndex = 0;
let currentLetter = "";
let timer;
let timeLeft = 30;
let correct = 0;
let wrong = 0;

/* --- DOM 快取 --- */
const gameArea  = document.getElementById("gameArea");
const timerEl   = document.getElementById("timer");
const morseEl   = document.getElementById("morse");
const answerEl  = document.getElementById("answer");
const feedbackEl= document.getElementById("feedback");
const correctEl = document.getElementById("correct");
const wrongEl   = document.getElementById("wrong");
const nextBtn   = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const playBtn   = document.getElementById("playBtn");

const audioElements = {
    dot: document.getElementById("dot"),
    dash: document.getElementById("dash"),
    bingo: document.getElementById("bingo"),
    wrongSound: document.getElementById("wrongSound")
};

/* ---------- 遊戲流程 ---------- */
function startGame() {
    // 首次互動時載入音訊，以獲得瀏覽器播放許可
    try {
        for (const key in audioElements) {
            audioElements[key].load();
        }
    } catch (e) {
        console.error("Audio loading failed:", e);
    }
    gameArea.style.display = "block";
    document.getElementById("startBtn").style.display = 'none';
    resetScore();
    letterIndex = 0;
    newQuestion();
}

function resetGame() {
  location.reload();
}

function resetScore() {
  correct = 0;
  wrong   = 0;
  correctEl.textContent = 0;
  wrongEl.textContent   = 0;
}

function newQuestion() {
  // UI 初始化
  nextBtn.disabled   = true;
  submitBtn.disabled = false;
  playBtn.disabled   = false; // 確保 Play 按鈕在新題目時是可用的
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
  
  // 【核心修改】此處不再自動播放聲音
}

function handleTick() {
  timeLeft--;
  updateTimer();
  if (timeLeft <= 0) {
    clearInterval(timer);
    handleAnswer(null, true);
  }
}

function updateTimer() {
  timerEl.textContent = `Time Left: ${timeLeft}s`;
}

/* ----- 互動 ----- */
function playCurrentMorse() {
  if (!playBtn.disabled) {
    playMorseAudio(morseMap[currentLetter]);
  }
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
  playBtn.disabled   = true; // 回答後禁用 Play 按鈕，直到下一題

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
  const audio = audioElements[id];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.error(`Audio play failed for ${id}:`, e));
  }
}

function playMorseAudio(code) {
  let i = 0;
  playBtn.disabled = true;
  function playNext() {
    if (i >= code.length) {
      playBtn.disabled = false;
      return;
    }
    const char = code[i++];
    const soundId = char === "." ? "dot" : "dash";
    const sound = audioElements[soundId];
    sound.onended = () => {
      setTimeout(playNext, 150);
    };
    sound.currentTime = 0;
    sound.play().catch(e => {
        console.error(`Morse audio failed for '${char}':`, e);
        playBtn.disabled = false;
    });
  }
  playNext();
}

/* ---------- 事件綁定 ---------- */
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
submitBtn.addEventListener("click", checkAnswer);
playBtn.addEventListener("click", playCurrentMorse);
nextBtn.addEventListener("click", newQuestion);

answerEl.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !submitBtn.disabled) {
    event.preventDefault();
    checkAnswer();
  }
});