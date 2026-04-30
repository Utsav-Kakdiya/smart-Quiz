document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = "";

  if (username === "") {
    errorMessage.textContent = "Username is required";
    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters";
    return;
  }

  checkUserInDb({ username, password });
});

function checkUserInDb(data) {

  displayLoader("Verifying login details...");

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      const msg = document.getElementById("error-message");

      if (result.success) {
        msg.style.color = "green";
        msg.textContent = result.message;

        hideLoader

        setTimeout(() => {
          displayLoader()
          window.location.href = "home.html";
        }, 2000);
        hideLoader()
      } else {
        msg.style.color = "red";
        msg.textContent = result.message;
      }
    })
    .catch((err) => {
      console.error(err);
    });
}
