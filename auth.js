(function () {
  const FIREBASE_APP_SRC = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
  const FIREBASE_AUTH_SRC = "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js";
  const SESSION_KEY = "brx_firebase_session";
  const currentPath = window.location.pathname.replace(/\\/g, "/");
  const isMotoPage = currentPath.indexOf("/motos/") !== -1;
  const basePath = isMotoPage ? "../" : "";
  const currentPage = (currentPath.split("/").pop() || "index.html").toLowerCase();
  const isLoginPage = currentPage === "login.html";
  const isAccountPage = currentPage === "conta.html";
  let overlayEl = null;
  let firebasePromise = null;
  let readyResolver = null;
  const readyPromise = new Promise((resolve) => {
    readyResolver = resolve;
  });

  function getConfig() {
    return window.BRX_AUTH_CONFIG || {};
  }

  function getCachedSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function cacheSession(user) {
    if (!user) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_KEY, JSON.stringify({
      name: user.displayName || "Conta Google",
      email: user.email || "Sem e-mail",
      picture: user.photoURL || "",
      uid: user.uid,
      provider: "firebase-google"
    }));
  }

  function getSafeRedirect() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (!redirect) {
      return basePath + "index.html";
    }

    try {
      const candidate = new URL(redirect, window.location.origin);
      if (candidate.origin === window.location.origin) {
        return candidate.href;
      }
    } catch (error) {
      return basePath + "index.html";
    }

    return basePath + "index.html";
  }

  function showLoading(message) {
    const text = message || "Carregando showroom...";

    function mount() {
      if (overlayEl) {
        const label = overlayEl.querySelector("[data-loading-label]");
        if (label) {
          label.textContent = text;
        }
        overlayEl.classList.remove("is-hidden");
        return;
      }

      overlayEl = document.createElement("div");
      overlayEl.className = "loading-screen";
      overlayEl.innerHTML = [
        '<div class="loading-screen__inner">',
        '  <div class="loading-spinner"></div>',
        '  <strong class="loading-title">Motos BRX</strong>',
        '  <p class="loading-copy" data-loading-label>' + text + '</p>',
        '</div>'
      ].join("");
      document.body.appendChild(overlayEl);
    }

    if (!document.body) {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
      return;
    }

    mount();
  }

  function hideLoading() {
    if (!overlayEl) {
      return;
    }

    overlayEl.classList.add("is-hidden");
  }

  function loadScript(src) {
    const existing = document.querySelector('script[data-brx-src="' + src + '"]');
    if (existing) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.brxSrc = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Falha ao carregar " + src));
      document.head.appendChild(script);
    });
  }

  async function initFirebase() {
    if (firebasePromise) {
      return firebasePromise;
    }

    firebasePromise = (async () => {
      const config = getConfig().firebaseConfig;
      if (!config) {
        throw new Error("Firebase nao configurado.");
      }

      await loadScript(FIREBASE_APP_SRC);
      await loadScript(FIREBASE_AUTH_SRC);

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }

      const auth = window.firebase.auth();
      await auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
      return auth;
    })();

    return firebasePromise;
  }

  async function signInWithGoogle() {
    const auth = await initFirebase();
    const provider = new window.firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return auth.signInWithPopup(provider);
  }

  async function signOut() {
    const auth = await initFirebase();
    cacheSession(null);
    await auth.signOut();
    window.location.href = basePath + "login.html";
  }

  function applyUserAvatarToBrand(session) {
    if (!session || !session.picture) {
      return;
    }

    const marks = document.querySelectorAll(".brand-mark");
    marks.forEach((mark) => {
      mark.style.backgroundImage = 'url("' + session.picture + '")';
      mark.style.backgroundPosition = "center";
      mark.style.backgroundSize = "cover";
      mark.style.backgroundRepeat = "no-repeat";
      mark.style.backgroundColor = "#161616";
    });
  }

  function ensureNavActions() {
    if (isAccountPage) {
      return;
    }

    const navActions = document.querySelectorAll(".nav-actions");
    navActions.forEach((nav) => {
      if (!nav.querySelector("[data-account-link]")) {
        const accountLink = document.createElement("a");
        accountLink.className = "btn btn-ghost";
        accountLink.href = basePath + "conta.html";
        accountLink.textContent = "Minha Conta";
        accountLink.dataset.accountLink = "true";
        nav.prepend(accountLink);
      }

      if (!nav.querySelector("[data-logout-button]")) {
        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "btn btn-ghost auth-logout";
        logoutButton.textContent = "Sair";
        logoutButton.dataset.logoutButton = "true";
        logoutButton.addEventListener("click", () => {
          signOut();
        });
        nav.appendChild(logoutButton);
      }
    });
  }

  function hydrateAccountPage(session) {
    if (!isAccountPage || !session) {
      return;
    }

    const nameEl = document.getElementById("accountName");
    const emailEl = document.getElementById("accountEmail");
    const avatarEl = document.getElementById("accountAvatar");
    const logoutButton = document.getElementById("logoutButton");

    if (nameEl) {
      nameEl.textContent = session.name || "Conta Google";
    }
    if (emailEl) {
      emailEl.textContent = session.email || "Sem e-mail";
    }
    if (avatarEl && session.picture) {
      avatarEl.src = session.picture;
    }
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        signOut();
      });
    }
  }

  async function guardPage() {
    showLoading("Validando acesso...");

    try {
      const auth = await initFirebase();

      auth.onAuthStateChanged((user) => {
        const session = user
          ? {
              name: user.displayName || "Conta Google",
              email: user.email || "Sem e-mail",
              picture: user.photoURL || "",
              uid: user.uid
            }
          : null;

        cacheSession(session);

        if (isLoginPage) {
          if (session) {
            window.location.href = getSafeRedirect();
            return;
          }

          hideLoading();
          if (readyResolver) {
            readyResolver();
            readyResolver = null;
          }
          return;
        }

        if (!session) {
          const loginUrl = new URL(basePath + "login.html", window.location.href);
          loginUrl.searchParams.set("redirect", window.location.href);
          window.location.href = loginUrl.toString();
          return;
        }

        document.addEventListener("DOMContentLoaded", () => {
          applyUserAvatarToBrand(session);
          ensureNavActions();
          hydrateAccountPage(session);
          window.setTimeout(hideLoading, 450);
        }, { once: true });

        if (document.readyState !== "loading") {
          applyUserAvatarToBrand(session);
          ensureNavActions();
          hydrateAccountPage(session);
          window.setTimeout(hideLoading, 450);
        }

        if (readyResolver) {
          readyResolver();
          readyResolver = null;
        }
      });
    } catch (error) {
      const cached = getCachedSession();
      if (!cached && !isLoginPage) {
        const loginUrl = new URL(basePath + "login.html", window.location.href);
        loginUrl.searchParams.set("redirect", window.location.href);
        window.location.href = loginUrl.toString();
        return;
      }

      hideLoading();
      if (readyResolver) {
        readyResolver();
        readyResolver = null;
      }
    }
  }

  window.BRXAuth = {
    getConfig,
    getSession: getCachedSession,
    signInWithGoogle,
    signOut,
    whenReady: function () {
      return readyPromise;
    }
  };

  guardPage();
})();
