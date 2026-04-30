window.addEventListener("DOMContentLoaded", async () => {
  try {

    const BASE_URL = "https://smart-quiz-1.onrender.com";
    const userEmail = localStorage.getItem("userEmail");
    const response = await fetch(`${BASE_URL}/analytics-dashboard/${userEmail}`);
    const data = await response.json();

    let totalQuestionAttempted = document.getElementById(
      "totalQuestionAttempted",
    );
    let accuracy = document.getElementById("accuracy");
    let sessions = document.getElementById("sessions");
    let avgPerformance = document.getElementById("avgPerformance");
    const container = document.getElementById("subjectPerformanceContainer");
    let easyAnalysis = document.getElementById("easy-analysis");
    let mediumAnalysis = document.getElementById("medium-analysis");
    let hardAnalysis = document.getElementById("hard-analysis");
    let easyProgress = document.getElementById("easy-progress");
    let mediumProgress = document.getElementById("medium-progress");
    let hardProgress = document.getElementById("hard-progress");
    let easyTotalQuestions = document.getElementById("easyTotalQuestions");
    let mediumTotalQuestions = document.getElementById("mediumTotalQuestions");
    let hardTotalQuestions = document.getElementById("hardTotalQuestions");

    totalQuestionAttempted.innerText = data.totalQuestions;

    let totalAttemptedQuestions = data.totalCorrect + data.totalWrong;
    accuracy.innerText =
      Math.round((data.totalCorrect / totalAttemptedQuestions) * 100).toFixed(
        2,
      ) + "%";

    sessions.innerText = data.sessions;
    avgPerformance.innerText = (data.totalCorrect / data.sessions).toFixed(2);

    container.innerHTML = ""; // Clear previous

    const subjects = data.subjects;

    for (let subject in subjects) {
      const { correct, total } = subjects[subject];

      let percentage = 0;
      if (total > 0) {
        percentage = ((correct / total) * 100).toFixed(0);
      }

      // 🎨 Color Logic
      let color = "#FF0000"; // Default red

      if (percentage > 75) {
        color = "#25a36f"; // Green
      } else if (percentage >= 50) {
        color = "#FFA500"; // Orange
      }

      const subjectHTML = `
            <div class="progrss-bar">
            <div class="progress-text">
                <p>${subject}</p>
                <span>${percentage}%</span>
            </div>
            <div class="progress">
                <div class="progress-fill" 
                    style="background-color:${color}; width:${percentage}%;">
                </div>
            </div>
            </div>
        `;

      container.innerHTML += subjectHTML;
    }

    easyAnalysis.innerText = data.difficulty.Easy.percentage + "%";
    mediumAnalysis.innerText = data.difficulty.Medium.percentage + "%";
    hardAnalysis.innerText = data.difficulty.Hard.percentage + "%";

    easyProgress.style.width = data.difficulty.Easy.percentage + "%";
    mediumProgress.style.width = data.difficulty.Medium.percentage + "%";
    hardProgress.style.width = data.difficulty.Hard.percentage + "%";

    easyTotalQuestions.innerText = data.difficulty.Easy.total + "  questions";
    mediumTotalQuestions.innerText =
      data.difficulty.Medium.total + "  questions";
    hardTotalQuestions.innerText = data.difficulty.Hard.total + "  questions";

  } catch (error) {
    console.log("Failed to display dashboard:", error);
  }
});
