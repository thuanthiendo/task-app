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

/******** AUTO LOGIN ********/
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

/**************** FIREBASE ****************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});

const db = firebase.firestore();
const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/**************** TASK ****************/
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

      // ❌ bỏ task lỗi (tránh undefined)
      if (!d.name || !d.day || !d.text) return;

      if (!data[d.name]) data[d.name] = {};
      if (!data[d.name][d.day]) data[d.name][d.day] = [];

      data[d.name][d.day].push({
        id: doc.id,
        ...d
      });
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
        div.style.gap = "6px";

        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleDone('${t.id}', ${!t.done}, '${name}', '${day}', '${t.text}')">

          <span style="${t.done ? "text-decoration:line-through;color:#888" : ""}">
            ${t.text}
          </span>

          ${currentRole === "admin"
            ? `<button onclick="deleteTask('${t.id}')" style="border:none;background:none;color:red;cursor:pointer">❌</button>`
            : ""
          }
        `;

        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/**************** DONE + HISTORY ****************/
window.toggleDone = function (id, value, taskOwner, day, taskText) {
  db.collection("tasks").doc(id).update({ done: value });

  if (value === true) {
    db.collection("history").add({
      taskOwner,           // người được giao
      checkedBy: currentUser, // người tick
      day,
      task: taskText,
      time: Date.now()
    });
  }
};

window.deleteTask = function (id) {
  if (!confirm("Xóa nhiệm vụ này?")) return;
  db.collection("tasks").doc(id).delete();
};

/**************** HISTORY ****************/
function loadHistory() {
  const historyBody = document.getElementById("historyBody");

  db.collection("history")
    .orderBy("time", "desc")
    .onSnapshot(snapshot => {
      historyBody.innerHTML = "";

      snapshot.forEach(doc => {
        const h = doc.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${new Date(h.time).toLocaleString()}</td>
          <td>${h.checkedBy}</td>
          <td>${h.taskOwner}</td>
          <td>${h.day}</td>
          <td>${h.task}</td>
          <td>
            <button onclick="deleteHistory('${doc.id}')"
              style="border:none;background:none;color:red;cursor:pointer">
              ❌
            </button>
          </td>
        `;

        historyBody.appendChild(tr);
      });
    });
}

window.deleteHistory = function (id) {
  if (!confirm("Xóa lịch sử này?")) return;
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
