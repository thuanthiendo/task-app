/**************** LOGIN ****************/
const USERS = {
  admin: { password: "123", role: "admin" },
  hungtv: { password: "123", role: "admin" },
  khoapt: { password: "123", role: "admin" },

  emp1: { password: "123", role: "employee" },
  thiendt: { password: "123", role: "employee" },
  khangpd: { password: "123", role: "employee" },
  huyvd: { password: "123", role: "employee" },
  khoalh: { password: "123", role: "employee" },
  quoclda: { password: "123", role: "employee" },
  hoangminh: { password: "123", role: "employee" },
  kiettv: { password: "123", role: "employee" }
};

let currentUser = null;
let currentRole = null;

/**************** FIREBASE ****************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});
const db = firebase.firestore();

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/**************** LOGIN ****************/
window.login = function () {
  const u = username.value.trim().toLowerCase();
  const p = password.value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentUser = u;
  currentRole = USERS[u].role;

  localStorage.setItem("user", u);
  localStorage.setItem("role", currentRole);

  loginBox.style.display = "none";
  app.style.display = "block";

  applyRole();
  startApp();
};

window.logout = function () {
  localStorage.clear();
  location.reload();
};

function applyRole() {
  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }
}

/******** AUTO LOGIN (FIX F5) ********/
window.addEventListener("DOMContentLoaded", () => {
  const u = localStorage.getItem("user");
  const r = localStorage.getItem("role");

  if (u && r) {
    currentUser = u;
    currentRole = r;

    loginBox.style.display = "none";
    app.style.display = "block";

    applyRole();
    startApp();
  }
});

/**************** START ****************/
function startApp() {
  loadTasks();
  loadHistory();
}

/**************** TASK ****************/
window.addTask = function () {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const day = dayInput.value;
  const text = taskInput.value.trim();

  if (!name || !text) return alert("Nhập đủ thông tin");

  db.collection("tasks").add({
    name,
    day,
    text,
    done: false
  });

  taskInput.value = "";
};

function loadTasks() {
  db.collection("tasks").onSnapshot(snap => {
    const data = {};

    snap.forEach(doc => {
      const d = doc.data();
      if (!d.name) return;

      if (!data[d.name]) data[d.name] = {};
      if (!data[d.name][d.day]) data[d.name][d.day] = [];

      data[d.name][d.day].push({ id: doc.id, ...d });
    });

    renderTable(data);
  });
}

function renderTable(data) {
  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.gap = "5px";

        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleDone('${t.id}', ${!t.done}, '${name}', '${t.text}')">
          <span style="${t.done ? "text-decoration:line-through" : ""}">
            ${t.text}
          </span>
        `;

        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/**************** DONE + HISTORY ****************/
function toggleDone(id, done, name, task) {
  db.collection("tasks").doc(id).update({ done });

  if (done) {
    db.collection("history").add({
      name,
      task,
      time: new Date().toLocaleString()
    });
  }
}

function loadHistory() {
  db.collection("history").orderBy("time","desc")
    .onSnapshot(snap => {
      historyBody.innerHTML = "";

      snap.forEach(doc => {
        const d = doc.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${d.name}</td>
          <td>${d.task}</td>
          <td>${d.time}</td>
          ${currentRole === "admin"
            ? `<td><button onclick="deleteHistory('${doc.id}')">❌</button></td>`
            : ""}
        `;
        historyBody.appendChild(tr);
      });
    });
}

function deleteHistory(id) {
  db.collection("history").doc(id).delete();
}
