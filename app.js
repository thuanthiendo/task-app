console.log("APP JS LOADED");

/* ================= LOGIN (NỘI BỘ) ================= */
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentRole = null;

window.login = function () {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentRole = USERS[u].role;
  localStorage.setItem("role", currentRole);

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }
};

window.logout = function () {
  localStorage.clear();
  location.reload();
};

/* ================= FIREBASE ================= */
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
});

const db = firebase.firestore();

/* ================= CONSTANTS ================= */
const DAYS = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  const daySelect = document.getElementById("dayInput");
  if (daySelect) {
    DAYS.forEach(d => {
      const o = document.createElement("option");
      o.textContent = d;
      daySelect.appendChild(o);
    });
  }

  setWeekHeader();
  listenTasks();
});

/* ================= HEADER ================= */
function setWeekHeader() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const map = [
    ["d2","Thứ 2"],
    ["d3","Thứ 3"],
    ["d4","Thứ 4"],
    ["d5","Thứ 5"],
    ["d6","Thứ 6"],
    ["d7","Thứ 7"],
    ["cn","CN"],
  ];

  map.forEach((m,i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const el = document.getElementById(m[0]);
    if (el) el.innerText = `${m[1]} (${d.getDate()}/${d.getMonth()+1})`;
  });
}

/* ================= ADD TASK ================= */
window.addTask = function () {
  if (currentRole !== "admin") return;

  const name = document.getElementById("nameInput").value.trim();
  const day = document.getElementById("dayInput").value;
  const text = document.getElementById("taskInput").value.trim();

  if (!name || !text) {
    alert("Nhập đủ tên và nhiệm vụ");
    return;
  }

  db.collection("tasks").add({
    name,
    day,
    text,
    done: false,
    note: "",
    createdAt: Date.now()
  });

  document.getElementById("taskInput").value = "";
};

/* ================= LISTEN TASKS ================= */
function listenTasks() {
  db.collection("tasks").onSnapshot(snapshot => {
    const data = {};

    snapshot.forEach(doc => {
      const d = doc.data();
      if (!data[d.name]) data[d.name] = {};
      if (!data[d.name][d.day]) data[d.name][d.day] = [];
      data[d.name][d.day].push({ id: doc.id, ...d });
    });

    renderTable(data);
  });
}

/* ================= RENDER ================= */
function renderTable(data) {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.innerHTML = `<b>${name}</b>`;
    tr.appendChild(tdName);

    DAYS.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleDone('${t.id}', this.checked)">
          <span style="${t.done ? "text-decoration:line-through" : ""}">
            ${t.text}
          </span>
          <button onclick="deleteTask('${t.id}')">❌</button>
        `;
        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    const noteTd = document.createElement("td");
    noteTd.innerText = "";
    tr.appendChild(noteTd);

    body.appendChild(tr);
  });
}

/* ================= ACTIONS ================= */
window.toggleDone = function (id, value) {
  db.collection("tasks").doc(id).update({ done: value });
};

window.deleteTask = function (id) {
  if (confirm("Xoá nhiệm vụ?")) {
    db.collection("tasks").doc(id).delete();
  }
};
