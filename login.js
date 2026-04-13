(function () {
  function showError(message) {
    const errorEl = document.getElementById("loginError");
    if (!errorEl) {
      return;
    }

    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function bindLogin() {
    const button = document.getElementById("googleSignInButton");
    if (!button || !window.BRXAuth) {
      return;
    }

    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "Abrindo Google...";

      try {
        await window.BRXAuth.signInWithGoogle();
      } catch (error) {
        button.disabled = false;
        button.textContent = "Continuar com Google";
        showError("Nao foi possivel entrar com o Google. Verifique se o login Google esta ativado no Firebase.");
      }
    });
  }

  function init() {
    if (!window.BRXAuth) {
      return;
    }

    window.BRXAuth.whenReady().then(bindLogin);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
