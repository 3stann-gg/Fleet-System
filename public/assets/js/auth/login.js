/* ==========================================
   Login page controller (frontend session only)
========================================== */

let loginPageInitialized = false;

function loginSetError(id, message) {
  const input = document.getElementById(id);
  const err = document.getElementById(id + "Error");
  if (input) {
    if (message) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
    } else {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
    }
  }
  if (err) {
    err.textContent = message || "";
    err.hidden = !message;
  }
}

function loginClearErrors() {
  loginSetError("loginEmail", "");
  loginSetError("loginPassword", "");
}

function loginToast(message, type) {
  if (typeof showToast === "function") {
    showToast(message, type || "info");
    return;
  }
  const host = document.getElementById("loginFormError");
  if (host) {
    host.hidden = false;
    host.textContent = message;
  }
}

function initLoginPage() {
  if (loginPageInitialized) return;
  const form = document.getElementById("loginForm");
  if (!form) return;
  loginPageInitialized = true;

  if (typeof redirectIfAuthenticated === "function") {
    if (redirectIfAuthenticated()) return;
  } else if (typeof isAuthenticated === "function" && isAuthenticated()) {
    window.location.replace("/dashboard");
    return;
  }

  const submitBtn = document.getElementById("loginSubmitBtn");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const rememberInput = document.getElementById("loginRemember");

  document.getElementById("loginForgotBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    loginToast(
      "Password recovery will be available after authentication integration.",
      "info",
    );
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    loginClearErrors();

    const email = (emailInput?.value || "").trim();
    const password = passwordInput?.value || "";
    const remember = Boolean(rememberInput?.checked);
    let valid = true;

    if (!email) {
      loginSetError("loginEmail", "Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      loginSetError("loginEmail", "Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      loginSetError("loginPassword", "Password is required.");
      valid = false;
    }

    if (!valid) {
      loginToast("Please correct the highlighted fields.", "warning");
      form.querySelector(".is-invalid")?.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      submitBtn.textContent = "Signing in…";
    }

    const result =
      typeof login === "function"
        ? login(email, password, remember)
        : { ok: false, error: "Authentication utility is unavailable." };

    if (!result.ok) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        submitBtn.textContent = "Sign In";
      }
      loginToast(result.error || "Unable to sign in.", "error");
      passwordInput?.focus();
      return;
    }

    loginToast("Welcome to HIMS Fleet.", "success");
    window.location.replace("/dashboard");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
});
