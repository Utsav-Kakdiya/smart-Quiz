document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm_password = document.getElementById("confirm-password").value.trim();
  const privacy_checkbox = document.getElementById("privacy-policy")
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = "";

  if (username === "") {
    errorMessage.textContent = "Username is required";
    return;
  }

  if(phone === ""){
    errorMessage.textContent = "Phone number is required."
    return
  }

  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
  if (!phoneRegex.test(phone)){
    errorMessage.textContent = "Enter a valid phone number."
    return
  }

  if (email === "") {
    errorMessage.textContent = "Email is required";
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errorMessage.textContent = "Enter a valid email";
    return;
  }

  if (password.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters";
    return;
  }

  if(confirm_password !== password){
    errorMessage.textContent = "Password and Confirm Password must be same."
    return
  }

  if (!privacy_checkbox.checked) {
    errorMessage.textContent = "Please accept the Privacy Policy to continue.";
    return;
  }

  sendDataToDatabase({ name: username, phone, email, password });
});

function sendDataToDatabase(data) {

  displayLoader("Sending OTP...");

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((result) => {
      const msg = document.getElementById("error-message");
      hideLoader();

      if (result.success) {
        // To hide the details fileds 
        let signUp = document.getElementById("signupSection");
        signUp.style.display = "none";


        // To display otp field 
        let otpSection = document.getElementById("otpverification")
        otpSection.style.display = "block";

        // Set hidden email input for OTP verification
        document.getElementById("otpEmail").value = data.email;

        msg.style.color = "green";
        msg.textContent = result.message;

      } else {
        msg.style.color = "red";
        msg.textContent = result.message;
      }
    })
    .catch((err) => {
      hideLoader();
      console.error(err);
    });
}

document.getElementById("submitOtp").addEventListener("click", async function (e) {
  e.preventDefault();

  const otp = document.getElementById("OTP").value.trim();
  const email = document.getElementById("otpEmail").value; 
  const msg = document.getElementById("error-message");
  msg.textContent = "";

  if (!otp) {
    msg.style.color = "red";
    msg.textContent = "Enter OTP";
    return;
  }
  try{

    displayLoader("Verifying OTP...")

    const res = await fetch("/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await res.json();
    hideLoader()

      localStorage.setItem("userEmail", email);
    if (data.success) {
      msg.style.color = "green";
      msg.textContent = data.message;

      
      // Redirect after OTP verification
      setTimeout(() => {
        displayLoader()
        window.location.href = "home.html";
      }, 1500);
      hideLoader()
    } else {
      msg.style.color = "red";
      msg.textContent = data.message;
    }
  }catch (err) {
    console.error(err);
  }
});
  
  
