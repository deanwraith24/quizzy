const quizBox = document.getElementById('quiz-box');

let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const totalQuestions = 5;
const timePerQuestion = 15; // 15 seconds per question

// Fetch questions from Open Trivia DB API
async function fetchQuestions() {
  const response = await fetch(`https://opentdb.com/api.php?amount=${totalQuestions}&type=multiple`);
  const data = await response.json();
  return data.results;
}

// Render question
function renderQuestion(questions) {
  if (currentQuestionIndex >= totalQuestions) {
    return renderResults();
  }

  const question = questions[currentQuestionIndex];
  const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);

  quizBox.innerHTML = `
    <h2 class="mb-4">${decodeHTML(question.question)}</h2>
    <div id="answers" class="d-grid gap-3">
      ${answers.map(answer => `<button class="btn btn-primary">${decodeHTML(answer)}</button>`).join('')}
    </div>
    <div class="mt-3">
      <div class="progress">
        <div id="progress-bar" class="progress-bar" role="progressbar" style="width: 0%;"></div>
      </div>
      <p class="mt-2">Time left: <span id="timer">${timePerQuestion}</span>s</p>
    </div>
  `;

  const buttons = document.querySelectorAll('#answers button');
  buttons.forEach(button => {
    button.addEventListener('click', () => handleAnswer(button, question.correct_answer, questions));
  });

  startTimer();
}

// Handle answer selection
function handleAnswer(button, correctAnswer, questions) {
  const userAnswer = button.textContent;
  const isCorrect = userAnswer === decodeHTML(correctAnswer);

  clearInterval(timerInterval);

  // Add feedback message
  const feedbackMessage = document.createElement('div');
  feedbackMessage.classList.add('alert', 'mt-3');
  feedbackMessage.innerHTML = isCorrect
    ? '<strong>Correct!</strong> Good Job!'
    : `<strong>Sorry, that was wrong.</strong> The correct answer was: <em>${decodeHTML(correctAnswer)}</em>.`;
  feedbackMessage.classList.add(isCorrect ? 'alert-success' : 'alert-danger');

  quizBox.appendChild(feedbackMessage);

  button.classList.add(isCorrect ? 'correct' : 'wrong');
  if (isCorrect) score++;

  // Proceed to the next question after a delay
  setTimeout(() => {
    currentQuestionIndex++;
    renderQuestion(questions);
  }, 2000);
}

// Start timer
function startTimer() {
  let timeLeft = timePerQuestion;
  const timer = document.getElementById('timer');
  const progressBar = document.getElementById('progress-bar');

  timerInterval = setInterval(() => {
    timeLeft--;
    timer.textContent = timeLeft;
    progressBar.style.width = `${(timeLeft / timePerQuestion) * 100}%`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      currentQuestionIndex++;
      renderQuestion(questions);
    }
  }, 1000);
}

// Render final results
function renderResults() {
  quizBox.innerHTML = `
    <h2 class="mb-4">Quiz Complete!</h2>
    <p class="mb-4">Your score is <strong>${score}/${totalQuestions}</strong>.</p>
    <button class="btn btn-success" onclick="window.location.reload()">Play Again</button>
    <a href="https://twitter.com/intent/tweet?text=I scored ${score}/${totalQuestions} on this quiz! Try it yourself!" target="_blank" class="btn btn-info mt-3">Share Score</a>
  `;
}

// Utility to decode HTML entities
function decodeHTML(html) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
}

// Initialize the quiz
fetchQuestions().then(renderQuestion);