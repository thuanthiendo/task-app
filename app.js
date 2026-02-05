/************* LOGIN CỨNG *************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentRole = null;

/************* LOGIN *************/
window.login = function () {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentRole = USERS[u].role;
  localStorage.setItem("role", currentRole);
  localStorage.setItem("user", u);

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

/************* AUTO LOGIN *************/
const savedRole = localStorage.getItem("role");
if (savedRole) {
  currentRole = savedRole;
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
  applyRole();
}

/************* FIREBASE *************/
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/************* ADD TASK *************/
window.addTask = function () {
  if (currentRole !== "admin") return;

  const name = document.getElementById("nameInput").value.trim();
  const day = document.getElementById("dayInput").value;
  const text = document.getElementById("taskInput").value.trim();

  if (!name || !text) {
    alert("Nhập đủ thông tin");
    return;
  }

  db.collection("tasks").add({
    name,
    day,
    text,
    done: false,
    createdAt: Date.now()
  });

  document.getElementById("taskInput").value = "";
};

/************* LOAD TASKS *************/
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

/************* RENDER TABLE *************/
function renderTable(data) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        td.innerHTML += `
          <div>
            <input type="checkbox" ${t.done ? "checked" : ""}
              onchange="toggleDone('${t.id}', this.checked)">
            ${t.text}
            ${currentRole === "admin"
              ? `<button onclick="deleteTask('${t.id}')">❌</button>`
              : ""}
          </div>
        `;
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/************* TOGGLE DONE + LOG *************/
window.toggleDone = function (id, value) {
  const user = localStorage.getItem("user") || "unknown";

  db.collection("tasks").doc(id).get().then(doc => {
    if (!doc.exists) return;

    const t = doc.data();

    db.collection("tasks").doc(id).update({ done: value });

    db.collection("logs").add({
      name: t.name,
      day: t.day,
      text: t.text,
      actionBy: user,
      done: value,
      time: Date.now()
    });
  });
};

/************* DELETE TASK *************/
window.deleteTask = function (id) {
  if (confirm("Xoá nhiệm vụ?")) {
    db.collection("tasks").doc(id).delete();
  }
};

/************* LOG TABLE *************/
db.collection("logs")
  .orderBy("time", "desc")
  .onSnapshot(snapshot => {
    const logBody = document.getElementById("logBody");
    if (!logBody) return;

    logBody.innerHTML = "";

    snapshot.forEach(doc => {
      const l = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${new Date(l.time).toLocaleString("vi-VN")}</td>
        <td>${l.actionBy}</td>
        <td>${l.day}</td>
        <td>${l.text}</td>
        <td>${l.done ? "✅ Hoàn thành" : "❌ Bỏ tick"}</td>
      `;

      logBody.appendChild(tr);
    });
  });
