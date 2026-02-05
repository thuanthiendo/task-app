/************ LOGIN NỘI BỘ ************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentUser = null;

/************ FIREBASE ************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});
const db = firebase.firestore();

/************ AUTO LOGIN (FIX F5) ************/
window.onload = () => {
  const saved = localStorage.getItem("user");
  if (saved) {
    currentUser = JSON.parse(saved);
    showApp();
  }
};

/************ LOGIN ************/
function login() {
  const u = username.value.trim();
  const p = password.value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentUser = { name: u, role: USERS[u].role };
  localStorage.setItem("user", JSON.stringify(currentUser));
  showApp();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function showApp() {
  loginBox.style.display = "none";
  app.style.display = "block";

  if (currentUser.role !== "admin") {
    document.querySelectorAll(".admin-only")
      .forEach(e => e.style.display = "none");
  }

  loadTasks();
  loadHistory();
}

/************ TASK ************/
async function addTask() {
  if (currentUser.role !== "admin") return;

  const name = nameInput.value.trim();
  const day = dayInput.value;
  const task = taskInput.value.trim();
  if (!name || !task) return;

  await db.collection("tasks").add({
    name, day, task, done: false
  });

  taskInput.value = "";
  loadTasks();
}

async function toggleDone(id, data) {
  await db.collection("history").add({
    name: currentUser.name,
    day: data.day,
    task: data.task,
    time: new Date().toLocaleString(),
    status: "✔"
  });

  await db.collection("tasks").doc(id).delete();
  loadTasks();
  loadHistory();
}

async function deleteTask(id) {
  if (!confirm("Xóa nhiệm vụ & toàn bộ lịch sử liên quan?")) return;

  const taskDoc = await db.collection("tasks").doc(id).get();
  const task = taskDoc.data().task;

  const his = await db.collection("history")
    .where("task", "==", task).get();

  his.forEach(d => d.ref.delete());
  await db.collection("tasks").doc(id).delete();

  loadTasks();
  loadHistory();
}

/************ LOAD ************/
async function loadTasks() {
  tableBody.innerHTML = "";
  const snap = await db.collection("tasks").get();
  const map = {};

  snap.forEach(d => {
    const t = d.data();
    if (!map[t.name]) map[t.name] = {};
    map[t.name][t.day] = { ...t, id: d.id };
  });

  Object.keys(map).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"]
      .forEach(day => {
        const td = document.createElement("td");
        if (map[name][day]) {
          const t = map[name][day];
          td.innerHTML = `
            ${t.task}
            <br><button onclick='toggleDone("${t.id}",${JSON.stringify(t)})'>✔</button>
          `;
        }
        tr.appendChild(td);
      });

    tr.innerHTML += `<td><button onclick="deleteTask('${Object.values(map[name])[0].id}')">🗑️</button></td>`;
    tableBody.appendChild(tr);
  });
}

async function loadHistory() {
  historyBody.innerHTML = "";
  const snap = await db.collection("history").orderBy("time","desc").get();
  snap.forEach(d => {
    const h = d.data();
    historyBody.innerHTML += `
      <tr>
        <td>${h.time}</td>
        <td>${h.name}</td>
        <td>${h.day}</td>
        <td>${h.task}</td>
        <td>${h.status}</td>
      </tr>`;
  });
}

/************ CLEAR HISTORY ************/
async function clearHistory() {
  if (!confirm("XÓA TOÀN BỘ LỊCH SỬ?")) return;
  const snap = await db.collection("history").get();
  snap.forEach(d => d.ref.delete());
  loadHistory();
}
