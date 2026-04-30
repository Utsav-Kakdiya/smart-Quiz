let subjects = document.querySelectorAll(".subjects .card");
let selectedSubjects = [];
subjects.forEach((subject) => {
  subject.addEventListener("click", () => {
    subject.classList.toggle("subject-card-selected");
    subjectName = subject.getAttribute("data-subject-name");

    if (subject.classList.contains("subject-card-selected")) {
      // add if selected
      selectedSubjects.push(subjectName);
    } else {
      // if not selected then remove them
      selectedSubjects = selectedSubjects.filter((s) => s !== subjectName);
    }
    chekSelections();
    updateProgress();
  });
});

let levels = document.querySelectorAll(".levels .card");
let selectedLevel = "";
let selectedTime = "";
levels.forEach((level) => {
  level.addEventListener("click", () => {
    // Remove selection from all levels
    levels.forEach((l) => {
      l.classList.remove(
        "level-easy-selected",
        "level-medium-selected",
        "level-hard-selected",
      );
    });

    if (level.classList.contains("level-easy")) {
      level.classList.toggle("level-easy-selected");
      selectedLevel = "Easy";
      selectedTime = "45";
    } else if (level.classList.contains("level-medium")) {
      level.classList.toggle("level-medium-selected");
      selectedLevel = "Medium";
      selectedTime = "60";
    } else {
      level.classList.toggle("level-hard-selected");
      selectedLevel = "Hard";
      selectedTime = "No time limit";
    }
    chekSelections();
    updateProgress();
  });
});

let counts = document.querySelectorAll(".counts .count");
let selectedQuestionCount = "";
counts.forEach((count) => {
  count.addEventListener("click", () => {
    // Remove selection from all levels
    counts.forEach((c) => {
      c.classList.remove("count-selected");
    });

    count.classList.add("count-selected");
    selectedQuestionCount = count.getAttribute("data-que-count");
    chekSelections();
    updateProgress();
  });
});

function updateProgress() {
  let completed = 0;

  if (selectedSubjects.length > 0) completed++;
  if (selectedLevel) completed++;
  if (selectedQuestionCount) completed++;

  const total = 3;
  const percentage = (completed / total) * 100;

  document.querySelector(".progress-fill").style.width = percentage + "%";
  document.querySelector(".progress-text span").innerText =
    `${completed}/${total} Complete`;
}

function chekSelections() {
  if (selectedSubjects.length > 0 && selectedLevel && selectedQuestionCount) {
    let rules = document.querySelector(".rules-section");
    let summary = document.querySelector(".summary-section");

    const quizRules = {
      easy: [
        "Each question has 4 options to select the appropriate answer",
        `Quiz contains ${selectedQuestionCount} questions from the selected subject`,
        "Questions are basic level difficulty",
        "Timer will be displayed with color indicators (green → red)",
        "Quiz auto-advances when time expires",
        "You can navigate between questions using Previous/Next buttons",
        "Your answers are saved automatically",
        "Submit quiz after completing all questions",
      ],

      medium: [
        "Each question has 4 options to select the appropriate answer",
        `Quiz contains ${selectedQuestionCount} questions from the selected subject`,
        "Questions are moderate difficulty level",
        "Timer will be displayed with color indicators (green → red)",
        "Quiz auto-advances when time expires",
        "You can navigate between questions using Previous/Next buttons",
        "Your answers are saved automatically",
        "Submit quiz after completing all questions",
      ],

      hard: [
        "No time limit per question - take your time",
        `Quiz contains ${selectedQuestionCount} questions from the selected subject`,
        "Questions are challenging and require deep understanding",
        "No timer pressure - focus on accuracy",
        "You can navigate between questions using Previous/Next buttons",
        "Your answers are saved automatically",
        "Submit quiz when you have completed all questions",
        "Review your answers before final submission",
      ],
    };
    let rulesList = document.querySelector(".rules-list");
    const rulesObj = quizRules[selectedLevel.toLowerCase()];
    let content = "";

    rulesObj.forEach((rule) => {
      content += ` <div class="rule">
        <p>
        <img src="./Assets/right.png">
        ${rule}
        </p>
        </div>`;
    });
    rulesList.innerHTML = content;
    let summarySubject = document.getElementById("summary-subject");
    let summaryLevel = document.getElementById("summary-level");
    let summaryTime = document.getElementById("summary-time");
    let summaryQuestions = document.getElementById("summary-questions");

    summarySubject.innerText = selectedSubjects;
    summaryLevel.innerText = selectedLevel;

    let questionCountForTime =
      selectedQuestionCount === "30+" ? 40 : Number(selectedQuestionCount);

    const totalSeconds = selectedTime * questionCountForTime;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    summaryTime.innerText =
      selectedTime !== "No time limit"
        ? `${minutes}:${seconds.toString().padStart(2, "0")} minutes`
        : selectedTime;
    summaryQuestions.innerText = selectedQuestionCount;

    rules.classList.remove("hidden");
    summary.classList.remove("hidden");
  }
}

document.getElementById("startQuiz").addEventListener("click", async () => {
  let configMsg = document.getElementById("configuration-message");

  if (!selectedSubjects.length) {
    configMsg.style.display = "block";
  } else if (!selectedLevel) {
    configMsg.innerText = "Please select a quiz difficulty level!!";
    configMsg.style.display = "block";
  } else if (!selectedQuestionCount) {
    configMsg.innerText =
      "Please select the total number of questions for the quiz!!";
    configMsg.style.display = "block";
  } else {
    displayLoader();

    if (selectedQuestionCount === "30+") {
      selectedQuestionCount = 40;
    }
    const quizConfig = {
      subjects: selectedSubjects,
      level: selectedLevel,
      questionCount: Number(selectedQuestionCount),
    };

    try {
      const BASE_URL = "https://smart-quiz-1.onrender.com";
      const response = await fetch(`${BASE_URL}/start_quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizConfig),
      });

      const data = await response.json();
      hideLoader();
      // Store questions for quiz page in local storage so that the question page can read it from the local storage
      localStorage.setItem("quizQuestions", JSON.stringify(data.questions));

      window.location.href = "./question.html";
    } catch {
      console.log("Some error occured for starting the quiz!!");
    }
  }
});
