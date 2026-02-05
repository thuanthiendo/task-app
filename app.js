// ====== TÀI KHOẢN CỐ ĐỊNH ======
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentRole = null;

// ====== LOGIN ======
function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentRole = USERS[u].role;
  localStorage.setItem("role", currentRole);

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";

  applyRole();
}

// ====== LOGOUT ======
function logout() {
  localStorage.clear();
  location.reload();
}

// ====== PHÂN QUYỀN ======
function applyRole() {
  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }
}

// ====== AUTO LOGIN ======
const savedRole = localStorage.getItem("role");
if (savedRole) {
  currentRole = savedRole;
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("app").style.display = "block";
  applyRole();
}

// ====== FIREBASE ======
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

// ====== ADD TASK (ADMIN) ======
function addTask() {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const day = dayInput.value;
  const text = taskInput.value.trim();

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

  taskInput.value = "";
}

// ====== LISTEN DATA ======
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

// ====== RENDER TABLE ======
function renderTable(data) {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");

    tr.innerHTML = `<td><b>${name}</b></td>`;

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleDone('${t.id}', this.checked)">
          <span style="${t.done ? "text-decoration:line-through" : ""}">
            ${t.text}
          </span>
          ${currentRole === "admin" ? 
            `<button onclick="deleteTask('${t.id}')">❌</button>` : ""}
        `;
        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    body.appendChild(tr);
  });
}

// ====== UPDATE ======
function toggleDone(id, value) {
  db.collection("tasks").doc(id).update({ done: value });
}

// ====== DELETE (ADMIN) ======
function deleteTask(id) {
  if (currentRole !== "admin") return;
  if (confirm("Xoá nhiệm vụ?")) {
    db.collection("tasks").doc(id).delete();
  }
}
