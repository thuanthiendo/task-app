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

/**************** AUTO LOGIN (FIX F5) ****************/
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

  if (!name || !day || !text) {
    alert("Nhập đầy đủ thông tin");
    return;
  }

  db.collection("tasks").add({
    name,
    day,
    text,
    done: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value = "";
};

function loadTasks() {
  db.collection("tasks").orderBy("createdAt")
    .onSnapshot(snap => {
      const data = {};

      snap.forEach(doc => {
        const d = doc.data();
        if (!d.name || !d.day || !d.text) return;

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
        div.className = "task-item";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = t.done;

        cb.onchange = () => {
          db.collection("tasks").doc(t.id).update({ done: cb.checked });

          if (cb.checked) {
            addHistory(name, t.text);
          }
        };

        const span = document.createElement("span");
span.textContent = t.text;

div.appendChild(cb);
div.appendChild(span);

// 👉 NÚT XÓA NHIỆM VỤ
if (currentRole === "admin" && t.done) {
  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.style.marginLeft = "6px";
  delBtn.style.cursor = "pointer";

  delBtn.onclick = () => {
    if (confirm("Xóa nhiệm vụ này?")) {
      db.collection("tasks").doc(t.id).delete();
    }
  };

  div.appendChild(delBtn);
}

td.appendChild(div);

      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/**************** HISTORY ****************/
function addHistory(employee, task) {
  if (!employee || !task) return;

  db.collection("history").add({
    employee,
    task,
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
        if (!d.employee || !d.task || !d.time) return;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${d.employee}</td>
          <td>${d.task}</td>
          <td>${d.checkedBy}</td>
          <td>${d.time.toDate().toLocaleString()}</td>
          <td class="admin-only">
            <button onclick="deleteHistory('${doc.id}')">❌</button>
          </td>
        `;
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
