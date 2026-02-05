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

  if (!name || !text) return alert("Nhập đủ thông tin");

  db.collection("tasks").add({
    name, day, text, done: false
  });

  taskInput.value = "";
};

function loadTasks() {
  db.collection("tasks").onSnapshot(snap => {
    const data = {};
    snap.forEach(doc => {
      const d = doc.data();
      data[d.name] ??= {};
      data[d.name][d.day] ??= [];
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
          ${t.text}
          ${currentRole==="admin" ? `<button onclick="deleteTask('${t.id}')">❌</button>` : ""}
        `;
        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/**************** DONE + HISTORY ****************/
window.toggleDone = function (id, value, assignedName, day, task) {
  db.collection("tasks").doc(id).update({ done: value });

  if (value) {
    db.collection("history").add({
      completedBy: currentUser,
      assignedTo: assignedName,
      day,
      task,
      time: Date.now()
    });
  }
};

window.deleteTask = id => {
  if (confirm("Xóa nhiệm vụ?"))
    db.collection("tasks").doc(id).delete();
};

/**************** HISTORY ****************/
function loadHistory() {
  db.collection("history").orderBy("time","desc")
    .onSnapshot(snap => {
      historyBody.innerHTML = "";
      snap.forEach(doc => {
        const h = doc.data();
        historyBody.innerHTML += `
          <tr>
            <td>${new Date(h.time).toLocaleString()}</td>
            <td><b>${h.completedBy}</b></td>
            <td>${h.day}</td>
            <td>${h.task}</td>
            <td><button onclick="deleteHistory('${doc.id}')">❌</button></td>
          </tr>`;
      });
    });
}

window.deleteHistory = id => {
  if (confirm("Xóa lịch sử này?"))
    db.collection("history").doc(id).delete();
};

window.clearHistory = async () => {
  if (currentRole !== "admin") return;
  if (!confirm("Xóa TOÀN BỘ lịch sử?")) return;

  const snap = await db.collection("history").get();
  const batch = db.batch();
  snap.forEach(d => batch.delete(d.ref));
  await batch.commit();
};
