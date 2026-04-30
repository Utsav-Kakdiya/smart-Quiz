let question = document.getElementById("question");
let queProgress = document.getElementById("queProgress");
let queNo = document.getElementsByClassName("q-number")[0];
let queLevel = document.getElementById("question-level");
let optionSection = document.getElementsByClassName("options")[0];
let nextBtn = document.getElementById("next");
let submitBtn = document.getElementById("submitBtn");
let previousBtn = document.getElementById("previous");
let attemptMsg = document.getElementById("attemp-message");
let timer = document.getElementById("timerSeconds");
let que;
let quizStartTime = null;
let interval = null;
let seconds;

const options = document.querySelectorAll("input[name='q']");

const storedQuestions = localStorage.getItem("quizQuestions");
const questions = storedQuestions ? JSON.parse(storedQuestions) : [];

let userAnswers = new Array(questions.length).fill(null);
let currentIdx = 0;

if (!questions || questions.length === 0) {
  question.innerText = "No question found!!";
  startTimer();
} else {
  quizStartTime = new Date();
  startTimer();
  // To load the first question
  loadQuestion(currentIdx);
}

function startTimer() {
  clearInterval(interval); // clear previous timer

  if (questions[0].difficulty === "Hard") {
    remaining = document.getElementById("remaining");
    timer.style.fontSize = "1.3rem";
    remaining.innerText = " ";
    timer.innerText = "No Time Limit";
    return;
  }

  const timePerQuestion = questions[0].difficulty === "Medium" ? 60 : 45;

  seconds = questions.length * timePerQuestion;
  let totalTime = seconds;

  timer.style.color = "#000"; // reset color

  interval = setInterval(() => {
    if (seconds <= 10) {
      timer.style.color = "#ff0000";
    }

    if (seconds < 0) {
      clearInterval(interval);
      submitQuiz(true);
      return;
    }

    let progress = ((totalTime - seconds) / totalTime) * 360;

    document.getElementById("timerCircle").style.background =
      `conic-gradient(from 0deg,#e5e7eb ${progress}deg, #0f766e ${progress}deg)`;

    let displayMinute = Math.floor(seconds / 60);
    let displaySeconds = seconds % 60;

    timer.innerText = ` ${displayMinute}: ${displaySeconds}`;
    seconds--;
  }, 1000);
}

function loadQuestion(index) {
  queProgress.innerText = `${index + 1} of ${questions.length}`;
  let percentage = ((index + 1) / questions.length) * 100;
  document.querySelector(".progress-fill").style.width = percentage + "%";
  document.querySelector(".progress-info-second p").innerText =
    `${index + 1}/${questions.length} Complete`;

  que = questions[index];
  question.innerText = que.question;
  queNo.innerText = `${index + 1}`;
  if (que.difficulty == "Hard") {
    queLevel.innerHTML = `<strong style="color: #ff0000" id="question-level">${que.difficulty}</strong>`;
  } else if (que.difficulty == "Easy") {
    queLevel.innerHTML = `<strong style="color: #004643" id="question-level">${que.difficulty}</strong>`;
  } else {
    queLevel.innerHTML = `<strong style="color: #de7b02" id="question-level">${que.difficulty}</strong>`;
  }

  optionSection.innerHTML = "";

  //Reset the time up message
  attemptMsg.style.display = "none";
  attemptMsg.innerText = "";

  // Create options
  que.options.forEach((opt) => {
    const label = document.createElement("label");
    label.className = "option active";

    const isChecked = userAnswers[index] === opt ? "checked" : "";

    label.innerHTML = `
      <input type="radio" name="q" value="${opt}" ${isChecked}>
      <span class="radio-ui"></span>
      <span class="option-text">${opt}</span>
    `;

    if (userAnswers[index] === opt) {
      label.classList.add("selected-option");
    }

    optionSection.appendChild(label);
  });

  const radios = document.querySelectorAll("input[name='q']");
  var totalAttemptedQuestions = 0;

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      userAnswers[currentIdx] = radio.value;

      // Remove selected class from all labels
      document.querySelectorAll(".option").forEach((label) => {
        label.classList.remove("selected-option");
      });

      // Add selected class to clicked one
      radio.closest("label").classList.add("selected-option");

      const totalAttemptedQuestions = userAnswers.filter(
        (ans) => ans !== null,
      ).length;

      if (totalAttemptedQuestions === questions.length) {
        attemptMsg.style.display = "none";
      }
    });
    totalAttemptedQuestions++;
  });

  if (currentIdx == questions.length - 1) {
    submitBtn.style.display = "block";
    nextBtn.style.display = "none";
  } else {
    submitBtn.style.display = "none";
    nextBtn.style.display = "block";
  }
}

options.forEach((radio) => {
  radio.addEventListener("change", () => {
    userAnswers[currentIdx] = radio.value;
    document.querySelectorAll(".option").forEach((label) => {
      label.classList.remove("selected-option");
    });

    radio.closest("label").classList.add("selected-option");
  });
});

nextBtn.addEventListener("click", () => {
  if (currentIdx < questions.length - 1) {
    currentIdx++;
    loadQuestion(currentIdx);
  }
});

previousBtn.addEventListener("click", () => {
  if (currentIdx > 0) {
    currentIdx--;
    loadQuestion(currentIdx);
  }
});

submitBtn.addEventListener("click", () => {
  let totalAttemptedQuestions = userAnswers.filter(
    (ans) => ans !== null,
  ).length;

  if (totalAttemptedQuestions < questions.length) {
    attemptMsg.innerText = "Please attempt all the questions!!";
    attemptMsg.style.display = "block";
    return;
  } else {
    attemptMsg.style.display = "none";
    submitQuiz();
  }
});

async function submitQuiz(isTimeUp = false) {
  let score = 0;
  let notAttempted = 0;
  let wrong = 0;
  let correct = 0;

  let totalAttemptedQuestions = userAnswers.filter(
    (ans) => ans !== null,
  ).length;

  if (isTimeUp) {
    attemptMsg.innerText = "Time Up!!";
    attemptMsg.style.display = "block";
  } else if (totalAttemptedQuestions < questions.length) {
    attemptMsg.innerText = "Please attempt all the questions!!";
    attemptMsg.style.display = "block";
    return;
  } else {
    attemptMsg.style.display = "none";
    clearInterval(interval);
  }

  userAnswers.forEach((userAnswer, i) => {
    const correctAnswer = questions[i].correctAnswer;
    const difficulty = questions[i].difficulty;

    if (userAnswer === correctAnswer) {
      score++;
      correct++;
    } else if (userAnswer !== null) {
      // Negative marking only if attempted
      if (difficulty === "Medium") {
        score -= 0.25;
      } else if (difficulty === "Hard") {
        score -= 0.5;
      }
      wrong++;
    } else if (userAnswer === null) {
      notAttempted++;
    }
  });

  const quizEndTime = new Date();

  const totalTimeTakenInSeconds = Math.floor(
    (quizEndTime - quizStartTime) / 1000,
  );

  clearInterval(interval);
  const userEmail = localStorage.getItem("userEmail")?.replace(/"/g, "").trim();
  const attempted = correct + wrong;
  const accuracy =
    attempted === 0 ? 0 : ((correct / attempted) * 100).toFixed(2);

  const subjectStatus = {};

  questions.forEach((q, index) => {
    const subject = q.subject;
    const userAnswer = userAnswers[index];
    const correctAnswer = q.correctAnswer;

    // Initialize subject if not exists
    if (!subjectStatus[subject]) {
      subjectStatus[subject] = {
        correct: 0,
        wrong: 0,
        notAttempted: 0,
        total: 0,
      };
    }

    // Increase total questions for this subject
    subjectStatus[subject].total++;

    if (userAnswer === null) {
      subjectStatus[subject].notAttempted++;
    } else if (userAnswer === correctAnswer) {
      subjectStatus[subject].correct++;
    } else {
      subjectStatus[subject].wrong++;
    }
  });
  const difficultyStatus = {
    Easy: { correct: 0, total: 0 },
    Medium: { correct: 0, total: 0 },
    Hard: { correct: 0, total: 0 },
  };

  userAnswers.forEach((userAnswer, i) => {
    const difficulty = questions[i].difficulty;
    const correctAnswer = questions[i].correctAnswer;

    difficultyStatus[difficulty].total++;

    if (userAnswer === correctAnswer) {
      difficultyStatus[difficulty].correct++;
    }
  });

  const submitQuizData = {
    userEmail: userEmail,
    date: new Date().toLocaleString(),
    totalQuestions: questions.length,
    notAttempted: notAttempted,
    correct,
    wrong,
    score,
    accuracy: Number(accuracy),
    timeTaken: totalTimeTakenInSeconds,
    subjectStatus,
    difficultyStatus,
  };

  displayLoader();
  try {
    const response = await fetch("/submit_quiz", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(submitQuizData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Server Error:", data.message);
      return;
    }


    let miniResult = document.getElementById("mini-result");
    let questionSection = document.getElementById("question-render");

    miniResult.style.display = "block";
    document.body.background = "gray";
    questionSection.style.display = "none";

    let wrongQueCount = document.getElementById("wrongQueCount");
    let totalQueCount = document.getElementById("totalQueCount");

    wrongQueCount.innerText = wrong;
    totalQueCount.innerText = correct + notAttempted + wrong;

    let yourScore = document.getElementById("yourScore");

    yourScore.innerText = `Your Score : ${score}`

    hideLoader();
  } catch (error) {
    console.log("Error submitting quiz:", error);
  }
}
