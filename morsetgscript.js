/********************
 * Morse Typing Game
 ********************/
const morseMap = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

const baseLetters = ["L", "O", "I", "D"];
const totalQuestions = 8;

let letterIndex = 0;
let currentLetter = "";
let timer;
let timeLeft = 30;
let correct = 0;
let wrong = 0;

/* --- DOM 快取 --- */
const gameArea = document.getElementById("gameArea");
const gamePromptEl = document.querySelector("#gameArea p");
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
    // 【最終音訊解鎖方案】
    // 遍歷所有音訊元素，嘗試播放並立即暫停它們。
    // 這是目前最可靠的、用來「喚醒」瀏覽器音訊系統的方法。
    Object.values(audioElements).forEach(audio => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                audio.pause();
                audio.currentTime = 0; // 歸零，以便下次從頭播放
            }).catch(error => {
                // 這個 catch 很重要，可以防止瀏覽器在控制台顯示不必要的錯誤。
                // 即使這裡報錯，使用者互動也已經最大程度地嘗試解鎖音訊了。
            });
        }
    });

    gameArea.style.display = "block";
    document.getElementById("startBtn").style.display = 'none';
    resetScore();
    letterIndex = 0;
    newQuestion();
}

function resetGame() { location.reload(); }
function resetScore() { correct = 0; wrong = 0; correctEl.textContent = 0; wrongEl.textContent = 0; }

function newQuestion() {
  if (letterIndex >= totalQuestions) {
    endGame();
    return;
  }

  questionCounterEl.textContent = `Question ${letterIndex + 1} / ${totalQuestions}`;
  currentLetter = baseLetters[Math.floor(letterIndex / 2)];
  const isFirstOfPair = (letterIndex % 2 === 0);

  if (isFirstOfPair) {
    gamePromptEl.textContent = "Listen carefully and guess the letter!";
    morseEl.textContent = "???";
    morseEl.style.color = '#999';
  } else {
    gamePromptEl.textContent = "What letter is this? (Same as the last round)";
    morseEl.textContent = morseMap[currentLetter];
    morseEl.style.color = '#0056b3';
  }
  
  nextBtn.disabled   = true;
  nextBtn.textContent = "Next";
  submitBtn.disabled = false;
  playBtn.disabled   = false;
  feedbackEl.textContent = "";
  answerEl.value     = "";
  answerEl.disabled  = false;
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
  letterIndex++;
}

function showFeedback(msg, color) { feedbackEl.textContent = msg; feedbackEl.style.color = color; }

function endGame() {
  feedbackEl.innerHTML = `🎉 Game Over! <br> Your final score is ${correct} / ${totalQuestions}.`;
  feedbackEl.style.color = 'blue';
  
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
  if (audio) { audio.currentTime = 0; audio.play().catch(e => { /* 忽略單一音效播放錯誤 */ }); }
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
answerEl.addEventListener("keydown", function(event) { if (event.key === "Enter" && !submitBtn.disabled) { event.preventDefault(); checkAnswer(); } });