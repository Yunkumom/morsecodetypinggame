/********************
 * Morse Typing Game
 ********************/
const morseMap = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

// 【修改1】設定4個基礎字母和總題數
const baseLetters = ["S", "A", "V", "E"]; // 4個字母將產生8題
const totalQuestions = 8;

let letterIndex = 0; // 代表當前是第幾題 (從 0 到 7)
let currentLetter = "";
let timer;
let timeLeft = 30;
let correct = 0;
let wrong = 0;

/* --- DOM 快取 --- */
const gameArea = document.getElementById("gameArea");
const gamePromptEl = document.querySelector("#gameArea p"); // 快取提示文字元素
const timerEl = document.getElementById("timer");
const morseEl = document.getElementById("morse");
const answerEl = document.getElementById("answer");
const feedbackEl = document.getElementById("feedback");
const correctEl = document.getElementById("correct");
const wrongEl = document.getElementById("wrong");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const playBtn = document.getElementById("playBtn");
const questionCounterEl = document.getElementById("questionCounter");

const audioElements = {
    dot: document.getElementById("dot"),
    dash: document.getElementById("dash"),
    bingo: document.getElementById("bingo"),
    wrongSound: document.getElementById("wrongSound")
};

/* ---------- 遊戲流程 ---------- */
function startGame() {
    try {
        for (const key in audioElements) { audioElements[key].load(); }
    } catch (e) { console.error("Audio loading failed:", e); }
    gameArea.style.display = "block";
    document.getElementById("startBtn").style.display = 'none';
    resetScore();
    letterIndex = 0;
    newQuestion();
}

function resetGame() { location.reload(); }
function resetScore() { correct = 0; wrong = 0; correctEl.textContent = 0; wrongEl.textContent = 0; }


// 【修改2】重寫整個 newQuestion 函式以符合新規則
function newQuestion() {
  // 檢查遊戲是否結束
  if (letterIndex >= totalQuestions) {
    endGame();
    return;
  }

  questionCounterEl.textContent = `Question ${letterIndex + 1} / ${totalQuestions}`;

  // 決定當前題目使用的字母
  // 題 0,1 都用 baseLetters[0]
  // 題 2,3 都用 baseLetters[1], 以此類推
  currentLetter = baseLetters[Math.floor(letterIndex / 2)];

  // 根據奇數題/偶數題來設定顯示
  const isFirstOfPair = (letterIndex % 2 === 0);

  if (isFirstOfPair) {
    // 這是奇數題 (1, 3, 5, 7) - 聽力挑戰
    gamePromptEl.textContent = "Listen carefully and guess the letter!";
    morseEl.textContent = "???";
    morseEl.style.color = '#999'; // 讓 '???' 顏色淡一點
  } else {
    // 這是偶數題 (2, 4, 6, 8) - 視覺確認
    gamePromptEl.textContent = "What letter is this? (Same as the last round)";
    morseEl.textContent = morseMap[currentLetter];
    morseEl.style.color = '#0056b3'; // 恢復正常顏色
  }
  
  // UI 初始化
  nextBtn.disabled   = true;
  submitBtn.disabled = false;
  playBtn.disabled   = false;
  feedbackEl.textContent = "";
  answerEl.value     = "";
  answerEl.disabled  = false;
  answerEl.focus();

  // Timer
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

function updateTimer() { timerEl.textContent = `Time Left: ${timeLeft}s`; }

/* ----- 互動 ----- */
function playCurrentMorse() { if (!playBtn.disabled) { playMorseAudio(morseMap[currentLetter]); } }
function checkAnswer() { const userInput = answerEl.value.trim().toUpperCase(); handleAnswer(userInput === currentLetter, false); }

/* ----- 結果處理 ----- */
function handleAnswer(isCorrect, isTimeout) {
  clearInterval(timer);
  submitBtn.disabled = true;
  answerEl.disabled  = true;
  nextBtn.disabled   = false;
  playBtn.disabled   = true;

  // 答完最後一題後，將 Next 按鈕文字改為 Finish
  if (letterIndex === totalQuestions - 1) {
    nextBtn.textContent = "Finish";
  }

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

  // 準備進入下一題
  letterIndex++;
}

function showFeedback(msg, color) { feedbackEl.textContent = msg; feedbackEl.style.color = color; }

// 【修改3】新增遊戲結束函式
function endGame() {
  feedbackEl.innerHTML = `🎉 Game Over! <br> Your final score is ${correct} / ${totalQuestions}.`;
  feedbackEl.style.color = 'blue';
  
  // 禁用所有遊戲互動按鈕
  answerEl.disabled = true;
  submitBtn.disabled = true;
  nextBtn.disabled = true;
  playBtn.disabled = true;
  timerEl.textContent = "Finished!";
  questionCounterEl.textContent = "All questions completed!";
}


/* ---------- 音訊 ---------- */
function playSoundSafely(id) {
  const audio = audioElements[id];
  if (audio) { audio.currentTime = 0; audio.play().catch(e => console.error(`Audio play failed for ${id}:`, e)); }
}

function playMorseAudio(code) {
  let i = 0;
  playBtn.disabled = true;
  function playNext() {
    if (i >= code.length) { playBtn.disabled = false; return; }
    const char = code[i++];
    const soundId = char === "." ? "dot" : "dash";
    const sound = audioElements[soundId];
    sound.onended = () => { setTimeout(playNext, 150); };
    sound.currentTime = 0;
    sound.play().catch(e => { console.error(`Morse audio failed for '${char}':`, e); playBtn.disabled = false; });
  }
  playNext();
}

/* ---------- 事件綁定 ---------- */
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("resetBtn").addEventListener("click", resetGame);
submitBtn.addEventListener("click", checkAnswer);
playBtn.addEventListener("click", playCurrentMorse);
nextBtn.addEventListener("click", newQuestion);
answerEl.addEventListener("keydown", function(event) { if (event.key === "Enter" && !submitBtn.disabled) { event.preventDefault(); checkAnswer(); } });