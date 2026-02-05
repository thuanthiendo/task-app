/************* LOGIN *************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentUser = null;
let currentRole = null;

window.login = function () {
  const u = username.value.trim();
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

/************* AUTO LOGIN (FIX F5) *************/
const savedUser = localStorage.getItem("user");
const savedRole = localStorage.getItem("role");

if (savedUser && savedRole) {
  currentUser = savedUser;
  currentRole = savedRole;
  loginBox.style.display = "none";
  app.style.display = "block";
  applyRole();
}

/************* FIREBASE *************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});

const db = firebase.firestore();
const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/************* ADD TASK *************/
window.addTask = function () {
  const name = nameInput.value.trim();
  const day = dayInput.value;
  const task = taskInput.value.trim();

  if (!name || !task) return alert("Nhập đủ thông tin");

  db.collection("tasks").add({ name, day, task });
  taskInput.value = "";
};

/************* RENDER TASK *************/
db.collection("tasks").onSnapshot(snap => {
  const data = {};
  snap.forEach(d => {
    const t = d.data();
    if (!data[t.name]) data[t.name] = {};
    if (!data[t.name][t.day]) data[t.name][t.day] = [];
    data[t.name][t.day].push({ id: d.id, ...t });
  });
  renderTable(data);
});

function renderTable(data) {
  tableBody.innerHTML = "";
  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    days.forEach(day => {
      const td = document.createElement("td");
      (data[name][day] || []).forEach(t => {
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.onclick = () => completeTask(t);
        td.append(cb, document.createTextNode(" " + t.task), document.createElement("br"));
      });
      tr.appendChild(td);
    });

    const del = document.createElement("td");
    del.innerHTML = `<button onclick="deleteUser('${name}')">❌</button>`;
    tr.appendChild(del);

    tableBody.appendChild(tr);
  });
}

/************* COMPLETE TASK *************/
function completeTask(t) {
  db.collection("history").add({
    name: currentUser,
    day: t.day,
    task: t.task,
    time: new Date().toLocaleString()
  });
  db.collection("tasks").doc(t.id).delete();
}

/************* HISTORY *************/
db.collection("history").orderBy("time", "desc").onSnapshot(snap => {
  historyBody.innerHTML = "";
  snap.forEach(d => {
    const h = d.data();
    historyBody.innerHTML += `
      <tr>
        <td>${h.time}</td>
        <td>${h.name}</td>
        <td>${h.day}</td>
        <td>${h.task}</td>
        <td>✔</td>
      </tr>`;
  });
});

/************* DELETE USER TASK + HISTORY *************/
window.deleteUser = function (name) {
  if (!confirm("Xóa toàn bộ nhiệm vụ & lịch sử của " + name + "?")) return;

  db.collection("tasks").where("name","==",name).get()
    .then(s => s.forEach(d => d.ref.delete()));

  db.collection("history").where("name","==",name).get()
    .then(s => s.forEach(d => d.ref.delete()));
};

/************* CLEAR ALL HISTORY (FIX) *************/
window.clearHistory = function () {
  if (!confirm("Xóa TOÀN BỘ lịch sử?")) return;

  db.collection("history").get().then(snap => {
    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  });
};
