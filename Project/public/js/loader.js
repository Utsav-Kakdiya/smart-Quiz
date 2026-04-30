window.displayLoader = function (msg = "Please wait..."){
    const loader = document.getElementById("loader");
    const spinnerText = document.querySelector("#loader span");
    if (!loader) return;

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    if (spinnerText) {
        spinnerText.innerText = msg;
    }
    
    loader.style.display = "flex";
    document.body.classList.add("stop-scrolling");
}

window.hideLoader = function () {
  const loader = document.getElementById("loader");
   if (!loader) return;

    loader.style.display = "none";
    document.body.classList.remove("stop-scrolling");
};