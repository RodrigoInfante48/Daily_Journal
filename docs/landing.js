import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from "./firebase.js";

(function () {
  "use strict";

  var el = {
    googleLoginBtn: document.getElementById("googleLoginBtn"),
    guestBtn: document.getElementById("guestBtn"),
    landingMsg: document.getElementById("landingMsg"),
  };

  var defaultMsg = el.landingMsg.textContent;
  var redirecting = false;

  function goToJournal() {
    if (redirecting) return;
    redirecting = true;
    window.location.href = "journal.html";
  }

  function showError(message) {
    el.landingMsg.textContent = message;
    el.landingMsg.classList.add("landingError");
  }

  async function loginWithGoogle() {
    el.googleLoginBtn.disabled = true;
    try {
      await signInWithPopup(auth, googleProvider);
      goToJournal();
    } catch (e) {
      el.googleLoginBtn.disabled = false;
      el.landingMsg.classList.remove("landingError");
      el.landingMsg.textContent = defaultMsg;
      if (e && e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") {
        showError("No se pudo iniciar sesión. Inténtalo de nuevo.");
      }
    }
  }

  function init() {
    el.googleLoginBtn.addEventListener("click", loginWithGoogle);
    el.guestBtn.addEventListener("click", goToJournal);

    onAuthStateChanged(auth, function (user) {
      if (user) goToJournal();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
