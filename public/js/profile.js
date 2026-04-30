window.addEventListener("DOMContentLoaded", async () => {
  try {
    const userEmail = localStorage.getItem("userEmail");
    const BASE_URL = "https://smart-quiz-1.onrender.com";
    const response = await fetch(`${BASE_URL}/analytics-dashboard/${userEmail}`);
    const data = await response.json();

    const container = document.getElementById("subjectPerformanceContainer");

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

    const responseOfHistory = await fetch(`${BASE_URL}/profile-dateHistory/${userEmail}`);
    const dataOfDateHistory = await responseOfHistory.json();

    const history = dataOfDateHistory.history;

    let tableBody = document.getElementById("tableBody");

    tableBody.innerHTML = "";

    history.forEach((quiz) => {
      let minutes = (quiz.time / 60).toFixed(0);
      let seconds = quiz.time % 60;
      const row = `
        <tr>
            <td>${new Date(quiz.date).toLocaleDateString()}</td>
            <td>${quiz.subject}</td>
            <td>${quiz.difficulty}</td>
            <td class="score">${quiz.score}</td>
            <td>${minutes} : ${seconds}</td>
        </tr>
        `;

      tableBody.innerHTML += row;
    });

    let totalQuizzes = document.getElementById("totalQuizzes");
    let overallAccuracy = document.getElementById("overallAccuracy");
    let favoriteSubject = document.getElementById("favoriteSubject");
    let totalQuestionAttempted = document.getElementById(
      "totalQuestionAttempted",
    );

    const performanceStatus = await fetch(
      `${BASE_URL}/profile-performance-status/${userEmail}`,
    );
    const performanceData = await performanceStatus.json();

    totalQuizzes.innerText = performanceData.totalQuizzes;
    overallAccuracy.innerText = performanceData.overallAccuracy;
    favoriteSubject.innerText = performanceData.favoriteSubject;
    totalQuestionAttempted.innerText = performanceData.totalQuestions;

    let profileUserEmail = document.getElementById("profileUserEmail");
    profileUserEmail.innerText = userEmail;

    const userData = await fetch(`${BASE_URL}/profile-info/${userEmail}`);
    const userInfo = await userData.json();
    let membershipSince = document.getElementById("membershipSince");
    let userName = document.getElementById("userName");

    let formattedDate = new Date(userInfo.memberSince).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    membershipSince.innerText = `Member since ${formattedDate}`
    userName.innerText = userInfo.name;

    let imageOfUserProfile = document.getElementById("imageOfUserProfile");

    imageOfUserProfile.innerText = userInfo.name.charAt(0)

  } catch (error) {
    console.log("Failed to display dashboard:", error);
  }
});
