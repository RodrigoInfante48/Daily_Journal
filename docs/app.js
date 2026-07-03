import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from "./firebase.js";

(function () {
  "use strict";

  var STORAGE_KEY = "daily-journal-entries";
  var TOTAL_SECONDS = 300;

  var el = {
    todayLabel: document.getElementById("todayLabel"),
    timerDisplay: document.getElementById("timerDisplay"),
    progressDots: document.getElementById("progressDots"),
    resetBtn: document.getElementById("resetBtn"),
    toggleBtn: document.getElementById("toggleBtn"),
    g1: document.getElementById("g1"),
    g2: document.getElementById("g2"),
    g3: document.getElementById("g3"),
    intencion: document.getElementById("intencion"),
    estado: document.getElementById("estado"),
    libre: document.getElementById("libre"),
    clearBtn: document.getElementById("clearBtn"),
    saveBtn: document.getElementById("saveBtn"),
    historyToggle: document.getElementById("historyToggle"),
    historyArrow: document.getElementById("historyArrow"),
    historyLabel: document.getElementById("historyLabel"),
    historyList: document.getElementById("historyList"),
    toast: document.getElementById("toast"),
    loginBtn: document.getElementById("loginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    userBox: document.getElementById("userBox"),
    userAvatar: document.getElementById("userAvatar"),
    userName: document.getElementById("userName"),
  };

  var remaining = TOTAL_SECONDS;
  var running = false;
  var finished = false;
  var intervalId = null;
  var toastTimeoutId = null;
  var historyOpen = false;
  var currentUser = null;

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function makeId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function loadLocalEntries() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function entriesRef() {
    return collection(db, "users", currentUser.uid, "entries");
  }

  async function loadEntries() {
    if (!currentUser) return loadLocalEntries();
    var snapshot = await getDocs(query(entriesRef(), orderBy("created_at", "desc")));
    return snapshot.docs.map(function (d) {
      return Object.assign({ id: d.id }, d.data());
    });
  }

  async function addEntry(entry) {
    if (!currentUser) {
      var entries = loadLocalEntries();
      entries.unshift(entry);
      saveLocalEntries(entries);
      return;
    }
    await addDoc(entriesRef(), entry);
  }

  async function removeEntry(id) {
    if (!currentUser) {
      saveLocalEntries(
        loadLocalEntries().filter(function (entry) {
          return entry.id !== id;
        })
      );
      return;
    }
    await deleteDoc(doc(db, "users", currentUser.uid, "entries", id));
  }

  function showToast(message) {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    el.toast.textContent = message;
    el.toast.classList.add("toastShow");
    toastTimeoutId = setTimeout(function () {
      el.toast.classList.remove("toastShow");
    }, 2200);
  }

  // --- Timer ---

  function renderTimer() {
    el.timerDisplay.textContent = formatTime(remaining);
    var minutesLeft = Math.ceil(remaining / 60);
    Array.prototype.forEach.call(el.progressDots.children, function (dot, i) {
      dot.classList.toggle("dotActive", i < minutesLeft);
    });
    el.toggleBtn.disabled = remaining === 0;
    el.toggleBtn.textContent = finished
      ? "Listo"
      : running
      ? "Pausar"
      : remaining === TOTAL_SECONDS
      ? "Iniciar"
      : "Continuar";
  }

  function buildDots() {
    el.progressDots.innerHTML = "";
    for (var i = 0; i < 5; i++) {
      var dot = document.createElement("div");
      dot.className = "dot";
      el.progressDots.appendChild(dot);
    }
  }

  function toggleTimer() {
    if (running) {
      if (intervalId) clearInterval(intervalId);
      running = false;
      renderTimer();
      return;
    }
    if (remaining === 0) return;
    running = true;
    intervalId = setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = 0;
        clearInterval(intervalId);
        running = false;
        finished = true;
        showToast("⏱ Tiempo cumplido");
      }
      renderTimer();
    }, 1000);
    renderTimer();
  }

  function resetTimer() {
    if (intervalId) clearInterval(intervalId);
    running = false;
    finished = false;
    remaining = TOTAL_SECONDS;
    renderTimer();
  }

  // --- Form ---

  function clearForm() {
    el.g1.value = "";
    el.g2.value = "";
    el.g3.value = "";
    el.intencion.value = "";
    el.estado.value = "";
    el.libre.value = "";
  }

  async function saveEntry() {
    var g1 = el.g1.value.trim();
    var intencion = el.intencion.value.trim();
    var libre = el.libre.value.trim();

    if (!g1 && !intencion && !libre) {
      showToast("Escribe algo primero 🖊");
      return;
    }

    var entry = {
      id: makeId(),
      created_at: new Date().toISOString(),
      gratitud_1: g1 || null,
      gratitud_2: el.g2.value.trim() || null,
      gratitud_3: el.g3.value.trim() || null,
      intencion: intencion || null,
      estado: el.estado.value.trim() || null,
      libre: libre || null,
    };

    try {
      await addEntry(entry);
    } catch (e) {
      showToast("No se pudo guardar la entrada");
      return;
    }

    if (historyOpen) renderHistory();

    showToast("Entrada guardada ✓");
    clearForm();
  }

  // --- History ---

  async function deleteEntry(id) {
    try {
      await removeEntry(id);
    } catch (e) {
      showToast("No se pudo borrar la entrada");
      return;
    }
    renderHistory();
  }

  async function renderHistory() {
    var entries = await loadEntries();
    el.historyList.innerHTML = "";

    if (entries.length === 0) {
      var empty = document.createElement("p");
      empty.className = "emptyHistory";
      empty.textContent = "Aún no hay entradas guardadas.";
      el.historyList.appendChild(empty);
      return;
    }

    entries.forEach(function (entry) {
      var card = document.createElement("div");
      card.className = "entryCard";

      var date = document.createElement("div");
      date.className = "entryCardDate";
      date.textContent = formatDate(new Date(entry.created_at));
      card.appendChild(date);

      var del = document.createElement("button");
      del.className = "entryDelete";
      del.type = "button";
      del.textContent = "Borrar";
      del.addEventListener("click", function () {
        deleteEntry(entry.id);
      });
      card.appendChild(del);

      var gratitud = [entry.gratitud_1, entry.gratitud_2, entry.gratitud_3]
        .filter(Boolean)
        .join(" · ");
      if (gratitud) {
        card.appendChild(makeField("Gratitud", gratitud));
      }
      if (entry.intencion) {
        card.appendChild(makeField("Intención del día", entry.intencion));
      }
      if (entry.estado) {
        card.appendChild(makeField("Estado interno", entry.estado));
      }
      if (entry.libre) {
        card.appendChild(makeField("Espacio libre", entry.libre));
      }

      el.historyList.appendChild(card);
    });
  }

  function makeField(label, value) {
    var field = document.createElement("div");
    field.className = "entryField";

    var key = document.createElement("div");
    key.className = "entryKey";
    key.textContent = label;

    var val = document.createElement("div");
    val.className = "entryVal";
    val.textContent = value;

    field.appendChild(key);
    field.appendChild(val);
    return field;
  }

  function toggleHistory() {
    historyOpen = !historyOpen;
    el.historyList.classList.toggle("historyListOpen", historyOpen);
    el.historyArrow.textContent = historyOpen ? "▾" : "▸";
    el.historyLabel.textContent = historyOpen
      ? "Ocultar entradas"
      : "Ver entradas anteriores";
    if (historyOpen) renderHistory();
  }

  // --- Auth ---

  function renderAuthUI() {
    if (currentUser) {
      el.loginBtn.hidden = true;
      el.userBox.hidden = false;
      el.userAvatar.src = currentUser.photoURL || "";
      el.userName.textContent = currentUser.displayName || currentUser.email || "";
    } else {
      el.loginBtn.hidden = false;
      el.userBox.hidden = true;
    }
  }

  async function login() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      showToast("No se pudo iniciar sesión");
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      showToast("No se pudo cerrar sesión");
    }
  }

  // --- Init ---

  function init() {
    el.todayLabel.textContent = formatDate(new Date());
    buildDots();
    renderTimer();

    el.resetBtn.addEventListener("click", resetTimer);
    el.toggleBtn.addEventListener("click", toggleTimer);
    el.clearBtn.addEventListener("click", clearForm);
    el.saveBtn.addEventListener("click", saveEntry);
    el.historyToggle.addEventListener("click", toggleHistory);
    el.loginBtn.addEventListener("click", login);
    el.logoutBtn.addEventListener("click", logout);

    onAuthStateChanged(auth, function (user) {
      currentUser = user;
      renderAuthUI();
      if (historyOpen) renderHistory();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
