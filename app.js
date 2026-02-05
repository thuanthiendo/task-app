/***********************
 * LOGIN CỨNG (NỘI BỘ)
 ***********************/
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

  applyRole();
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

/***********************
 * AUTO LOGIN
 ***********************/
const savedRole = localStorage.getItem("role");
if (savedRole) {
  currentRole = savedRole;
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
  applyRole();
}

/***********************
 * FIREBASE INIT
 ***********************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
});

const db = firebase.firestore();

/***********************
 * SET HEADER THỨ + NGÀY
 ***********************/
function setWeekHeader() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const map = [
    { id: "d2", label: "Thứ 2" },
    { id: "d3", label: "Thứ 3" },
    { id: "d4", label: "Thứ 4" },
    { id: "d5", label: "Thứ 5" },
    { id: "d6", label: "Thứ 6" },
    { id: "d7", label: "Thứ 7" },
    { id: "cn", label: "CN" },
  ];

  map.forEach((m, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const th = document.getElementById(m.id);
    if (th) {
      th.innerText = `${m.label} (${d.getDate()}/${d.getMonth() + 1})`;
    }
  });
}

setWeekHeader();

/***********************
 * CONSTANTS
 ***********************/
const DAYS = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/***********************
 * ADD TASK (ADMIN)
 ***********************/
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

/***********************
 * REALTIME LISTENER
 ***********************/
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

/***********************
 * RENDER TABLE
 ***********************/
function renderTable(data) {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");

    // TÊN
    const nameTd = document.createElement("td");
    nameTd.innerHTML = `<b>${name}</b>`;
    tr.appendChild(nameTd);

    // NGÀY
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
          ${currentRole === "admin" ? `<button onclick="deleteTask('${t.id}')">❌</button>` : ""}
        `;
        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    // GHI CHÚ
    const noteTd = document.createElement("td");
    noteTd.innerHTML = `
      <textarea rows="3" style="width:100%"
        placeholder="
