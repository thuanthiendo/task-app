/**************** LOGIN NỘI BỘ ****************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentRole = null;
let currentUser = null;

window.login = function () {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentRole = USERS[u].role;
  currentUser = u;

  localStorage.setItem("role", currentRole);
  localStorage.setItem("user", currentUser);

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

/*************** AUTO LOGIN ***************/
if (localStorage.getItem("role")) {
  currentRole = localStorage.getItem("role");
  currentUser = localStorage.getItem("user");

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";

  applyRole();
}

/**************** FIREBASE ****************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
});

const db = firebase.firestore();
const DAYS = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/**************** ADD TASK (ADMIN) ****************/
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
    createdAt: Date.now()
  });

  document.getElementById("taskInput").value = "";
};

/**************** RENDER TASK TABLE ****************/
db.collection("tasks").onSnapshot(snapshot => {
  const table = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!table[d.name]) table[d.name] = {};
    if (!table[d.name][d.day]) table[d.name][d.day] = [];
    table[d.name][d.day].push({ ...d, id: doc.id });
  });

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  Object.keys(table).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    DAYS.forEach(day => {
      const td = document.createElement("td");
      if (table[name][day]) {
        table[name][day].forEach(t => {
          const div = document.createElement("div");
          div.innerHTML = `
            <input type="checkbox" ${t.done ? "checked" : ""}
              onchange="toggleDone('${t.id}', this.checked)">
            ${t.text}
            ${currentRole === "admin" ? `<button onclick="deleteTask('${t.id}')">❌</button>` : ""}
          `;
          td.appendChild(div);
        });
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
});

/**************** TOGGLE DONE + LOG ****************/
window.toggleDone = function (id, checked) {
  db.collection("tasks").doc(id).get().then(doc => {
    if (!doc.exists) return;
    const t = doc.data();

    db.collection("tasks").doc(id).update({ done: checked });

    if (checked) {
      db.collection("logs").add({
        taskId: id,
        name: t.name,
        day: t.day,
        text: t.text,
        by: currentUser,
        time: Date.now()
      });
    }
  });
};

/**************** DELETE TASK + DELETE LOGS ****************/
window.deleteTask = async function (id) {
  if (!confirm("Xoá nhiệm vụ và toàn bộ lịch sử?")) return;

  await db.collection("tasks").doc(id).delete();

  const logs = await db.collection("logs")
    .where("taskId", "==", id)
    .get();

  const batch = db.batch();
  logs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};

/**************** LOG TABLE ****************/
db.collection("logs")
  .orderBy("time", "desc")
  .onSnapshot(snapshot => {
    const body = document.getElementById("logBody");
    if (!body) return;

    body.innerHTML = "";
    snapshot.forEach(doc => {
      const l = doc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(l.time).toLocaleString()}</td>
        <td>${l.by}</td>
        <td>${l.day}</td>
        <td>${l.text}</td>
        <td>✔️</td>
      `;
      body.appendChild(tr);
    });
  });
