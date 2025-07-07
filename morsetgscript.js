const morseMap = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
  F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
  P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

let correct = 0;
let wrong = 0;

let letters = ['L', 'O', 'I', 'D']; // 初期字母可自訂
let currentLetter = '';

function newQuestion() {
  currentLetter = letters[Math.floor(Math.random() * letters.length)];
  document.getElementById("morse").textContent = morseMap[currentLetter];
  document.getElementById("answer").value = '';
  document.getElementById("feedback").textContent = '';
  document.getElementById("answer").focus();
}

function checkAnswer() {
  const userInput = document.getElementById("answer").value.toUpperCase();
  const feedback = document.getElementById("feedback");

  if (userInput === currentLetter) {
    correct++;
    feedback.textContent = "✔ Correct!";
    feedback.style.color = "green";
  } else {
    wrong++;
    feedback.textContent = `✘ Wrong! Correct answer: ${currentLetter}`;
    feedback.style.color = "red";
  }

  document.getElementById("correct").textContent = correct;
  document.getElementById("wrong").textContent = wrong;

  setTimeout(newQuestion, 1000); // 自動出下一題
}

newQuestion();
