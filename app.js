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

/**************** INIT ****************/
function initApp(user, role) {
  currentUser = user;
  currentRole = role;

  loginBox.style.display = "none";
  app.style.display = "block";

  applyRole();
  loadTasks();
  loadHistory();
}

/**************** LOGIN ****************/
window.login = function () {
  const u = username.value.trim().toLowerCase();
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

/**************** AUTO LOGIN ****************/
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

/**************** DATE - WEEK ****************/
function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay() || 7; // CN = 7
  const start = new Date(d);
  start.setDate(d.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function getDayName(dateStr) {
  const d = new Date(dateStr);
  const map = ["CN","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];
  return map[d.getDay()];
}

/**************** TASK ****************/
window.addTask = function () {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const date = dateInput.value; // YYYY-MM-DD
  const text = taskInput.value.trim();
  const time = timeInput.value;

  if (!name || !date || !text || !time) {
    alert("Nhập đầy đủ thông tin");
    return;
  }

  const day = getDayName(date);

  db.collection("tasks").add({
    name,
    date,
    day,
    text,
    time,
    done: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value = "";
  timeInput.value = "";
};

/**************** LOAD TASKS ****************/
function loadTasks() {
  const week = getWeekRange();

  db.collection("tasks")
    .where("date", ">=", week.start)
    .where("date", "<=", week.end)
    .orderBy("date")
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



/**************** RENDER TABLE ****************/
function renderTable(data) {
  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

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
        span.textContent = `[${t.time}] (${t.date}) ${t.text}`;

        div.appendChild(cb);
        div.appendChild(span);

        if (currentRole === "admin" && t.done) {
          const del = document.createElement("button");
          del.textContent = "❌";
          del.style.marginLeft = "6px";
          del.onclick = () => {
            if (confirm("Xóa nhiệm vụ này?")) {
              db.collection("tasks").doc(t.id).delete();
            }
          };
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
        if (!d.time) return;

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

window.deleteHistory = function (id) {
  if (currentRole !== "admin") return;
  db.collection("history").doc(id).delete();
};

window.clearHistory = function () {
  if (currentRole !== "admin") return;
  if (!confirm("Xóa toàn bộ lịch sử?")) return;

  db.collection("history").get().then(snap => {
    snap.forEach(doc => doc.ref.delete());
  });
};
