/**************** USERS ****************/
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
               kiettv: { password: "123", role: "employee" } };

let currentUser = null;
let currentRole = null;

/**************** FIREBASE ****************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});

const db = firebase.firestore();

/**************** CONSTANT ****************/
const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/**************** WEEK UTILS ****************/
function getMonday(d = new Date()) {
  d = new Date(d);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0,0,0,0);
  return d;
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
}

/**************** CURRENT WEEK ****************/
let currentWeek = getMonday();

// restore last week
const savedWeek = localStorage.getItem("currentWeek");
if (savedWeek) currentWeek = new Date(savedWeek);

/**************** UI WEEK ****************/
function updateWeekLabel() {
  const end = new Date(currentWeek);
  end.setDate(end.getDate() + 6);
  weekLabel.textContent =
    `${currentWeek.toLocaleDateString()} → ${end.toLocaleDateString()}`;
}

function renderHeader() {
  const theadRow = document.querySelector("thead tr");
  theadRow.innerHTML = "<th>Tên</th>";

  days.forEach((day, i) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() + i);
    theadRow.innerHTML += `
      <th>
        ${day}<br>
        <small>(${formatDate(d)})</small>
      </th>`;
  });
}

window.changeWeek = function(offset) {
  currentWeek.setDate(currentWeek.getDate() + offset * 7);
  localStorage.setItem("currentWeek", currentWeek.toISOString());
  updateWeekLabel();
  loadTasks();
};

/**************** INIT ****************/
function initApp(user, role) {
  currentUser = user;
  currentRole = role;

  loginBox.style.display = "none";
  app.style.display = "block";

  applyRole();
  updateWeekLabel();
  loadTasks();
  loadHistory();
}

/**************** LOGIN ****************/
window.login = function () {
  const u = username.value.trim();
  const p = password.value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  localStorage.setItem("user", u);
  localStorage.setItem("role", USERS[u].role);
  initApp(u, USERS[u].role);
};

window.logout = function () {
  localStorage.clear();
  location.reload();
};

window.addEventListener("DOMContentLoaded", () => {
  const u = localStorage.getItem("user");
  const r = localStorage.getItem("role");
  if (u && r) initApp(u, r);
});

/**************** ROLE ****************/
function applyRole() {
  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }
}

/**************** TASK ****************/
window.addTask = function () {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const day = dayInput.value;
  const text = taskInput.value.trim();
  const time = timeInput.value;

  if (!name || !day || !text || !time) {
    alert("Nhập đầy đủ thông tin");
    return;
  }

  const [hour, minute] = time.split(":").map(Number);

  db.collection("tasks").add({
    name,
    day,
    text,
    time,
    hour,
    minute,
    week: firebase.firestore.Timestamp.fromDate(new Date(currentWeek)),
    done: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value = "";
  timeInput.value = "";
};

function loadTasks() {
  renderHeader();

  const weekTs = firebase.firestore.Timestamp.fromDate(new Date(currentWeek));

  db.collection("tasks")
    .where("week", "==", weekTs)
    .orderBy("createdAt")
    .onSnapshot(snap => {
      const data = {};

      snap.forEach(doc => {
        const d = doc.data();
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
    tr.innerHTML = `<td>${name}</td>`;

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.className = "task-item";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = t.done;
        cb.onchange = () => {
          db.collection("tasks").doc(t.id).update({ done: cb.checked });
          if (cb.checked) addHistory(name, t.text, t.time);
        };

        const span = document.createElement("span");
        span.textContent = `[${t.time}] ${t.text}`;

        div.appendChild(cb);
        div.appendChild(span);

        if (currentRole === "admin" && t.done) {
          const del = document.createElement("button");
          del.textContent = "❌";
          del.onclick = () => db.collection("tasks").doc(t.id).delete();
          div.appendChild(del);
        }

        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/**************** HISTORY ****************/
function addHistory(employee, task, time) {
  db.collection("history").add({
    employee,
    task,
    timeTask: time,
    checkedBy: currentUser,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function loadHistory() {
  db.collection("history")
    .orderBy("time", "desc")
    .onSnapshot(snap => {
      historyBody.innerHTML = "";
      snap.forEach(doc => {
        const d = doc.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${d.employee}</td>
          <td>[${d.timeTask}] ${d.task}</td>
          <td>${d.checkedBy}</td>
          <td>${d.time.toDate().toLocaleString()}</td>
        `;

        if (currentRole === "admin") {
          const td = document.createElement("td");
          td.innerHTML = `<button onclick="deleteHistory('${doc.id}')">❌</button>`;
          tr.appendChild(td);
        }

        historyBody.appendChild(tr);
      });
    });
}

window.deleteHistory = function(id) {
  if (currentRole !== "admin") return;
  db.collection("history").doc(id).delete();
};

window.clearHistory = function() {
  if (!confirm("Xóa toàn bộ lịch sử?")) return;
  db.collection("history").get().then(snap => {
    snap.forEach(doc => doc.ref.delete());
  });
};
