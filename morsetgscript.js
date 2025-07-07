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

/* --- 題庫與狀態 --- */
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

// 快取所有音訊元素，方便管理並提高效能
const audioElements = {
    dot: document.getElementById("dot"),
    dash: document.getElementById("dash"),
    bingo: document.getElementById("bingo"),
    wrongSound: document.getElementById("wrongSound")
};

/* ---------- 遊戲流程 ---------- */
function startGame() {
    // 【關鍵修正】在使用者點擊 Start 後，立即載入所有音訊。
    // 這個動作由使用者直接觸發，可以解鎖瀏覽器的音訊播放權限。
    try {
        for (const key in audioElements) {
            audioElements[key].load();
        }
    } catch (e) {
        console.error("Audio loading failed. This might happen on some mobile browsers.", e);
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

/* ----- 題目產生與計時 ----- */
function newQuestion() {
  nextBtn.disabled   = true;
  submitBtn.disabled = false;
  feedbackEl.textContent = "";
  answerEl.value     = "";
  answerEl.disabled  = false;
  answerEl.focus();

  clearInterval(timer);
  timeLeft = 30;
  updateTimer();
  timer = setInterval(handleTick, 1000);

  currentLetter = letters[letterIndex];
  letterIndex   = (letterIndex + 1) % letters.length;
  const code = morseMap[currentLetter];
  morseEl.textContent = code;
  
  // 延遲一小段時間再播放，確保UI更新完成，讓體驗更流暢
  setTimeout(() => playMorseAudio(code), 100);
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
  playBtn.disabled = true; // 播放時禁用按鈕，防止重疊播放

  function playNext() {
    if (i >= code.length) {
      playBtn.disabled = false; // 播放完畢，重新啟用按鈕
      return;
    }
    const char = code[i++];
    const soundId = char === "." ? "dot" : "dash";
    const sound = audioElements[soundId]; // 使用快取的音訊元素

    // 使用 'ended' 事件來確保一個播完再播下一個，節奏更準確
    sound.onended = () => {
      setTimeout(playNext, 150); // 點和劃之間的短暫間隔
    };
    
    sound.currentTime = 0;
    sound.play().catch(e => {
        console.error(`Morse audio failed for '${char}':`, e);
        playBtn.disabled = false; // 如果播放失敗，也要重新啟用按鈕
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

// 為輸入框加入鍵盤事件，實現 Enter 提交
answerEl.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !submitBtn.disabled) {
    event.preventDefault(); // 防止表單預設提交行為
    checkAnswer();
  }
});