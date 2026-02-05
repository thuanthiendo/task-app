/***************** LOGIN NỘI BỘ *****************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  thiendt: { password: "123", role: "employee" }
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
  loadTasks();
  loadHistory();
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
const savedUser = localStorage.getItem("user");
const savedRole = localStorage.getItem("role");

if (savedUser && savedRole) {
  currentUser = savedUser;
  currentRole = savedRole;
  loginBox.style.display = "none";
  app.style.display = "block";
  applyRole();
  loadTasks();
  loadHistory();
}

/***************** FIREBASE *****************/
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/***************** TASK *****************/
window.addTask = function () {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const day = dayInput.value;
  const text = taskInput.value.trim();

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

  taskInput.value = "";
};

function loadTasks() {
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

function renderTable(data) {
  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleDone('${t.id}', ${!t.done}, '${name}', '${day}', '${t.text}')">
          <span style="${t.done ? "text-decoration:line-through" : ""}">
            ${t.text}
          </span>
          ${currentRole === "admin" ? `<button onclick="deleteTask('${t.id}')">❌</button>` : ""}
        `;
        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/***************** DONE + HISTORY *****************/
window.toggleDone = function (id, value, name, day, task) {
  db.collection("tasks").doc(id).update({ done: value });

  if (value === true) {
    db.collection("history").add({
      name,
      day,
      task,
      time: Date.now(),
      user: currentUser
    });
  }
};

window.deleteTask = function (id) {
  if (!confirm("Xóa nhiệm vụ này?")) return;
  db.collection("tasks").doc(id).delete();
};

/***************** HISTORY *****************/
function loadHistory() {
  const historyBody = document.getElementById("historyBody");
  historyBody.innerHTML = "";

  db.collection("history")
    .orderBy("time", "desc")
    .onSnapshot(snapshot => {
      historyBody.innerHTML = "";

      snapshot.forEach(doc => {
        const h = doc.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${new Date(h.time).toLocaleString()}</td>
          <td>${h.name}</td>
          <td>${h.day}</td>
          <td>${h.task}</td>
          <td>
            <button onclick="deleteHistory('${doc.id}')" style="color:red">❌</button>
          </td>
        `;

        historyBody.appendChild(tr);
      });
    });
}

window.deleteHistory = function (id) {
  if (!confirm("Xóa lịch sử hoàn thành này?")) return;
  db.collection("history").doc(id).delete();
};

window.clearHistory = async function () {
  if (currentRole !== "admin") return;
  if (!confirm("Xóa TOÀN BỘ lịch sử?")) return;

  const snap = await db.collection("history").get();
  const batch = db.batch();

  snap.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  alert("Đã xóa toàn bộ lịch sử");
};
