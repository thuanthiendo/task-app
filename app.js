/**************** USERS ****************/
const USERS = {
  admin:   { password: "123", role: "admin" },
  hungtv:  { password: "123", role: "admin" },
  khoapt:  { password: "123", role: "admin" },

  emp1:    { password: "123", role: "employee" },
  thiendt: { password: "123", role: "employee" },
  khangpd: { password: "123", role: "employee" },
  khoalh:  { password: "123", role: "employee" },
  quoclda: { password: "123", role: "employee" },
  hoangminh:{ password: "123", role: "employee" },
  hieutm:  { password: "123", role: "employee" },
  huyvd:   { password: "123", role: "employee" }
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

/**************** CONSTANT ****************/
const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/**************** WEEK ****************/
let currentWeekStart = getMonday(new Date());

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - day + 1);
  d.setHours(0,0,0,0);
  return d;
}

function dateFromWeek(dayIndex) {
  const d = new Date(currentWeekStart);
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().slice(0,10);
}

/**************** LOGIN ****************/
window.login = () => {
  const u = username.value.trim().toLowerCase();
  const p = password.value.trim();
  if (!USERS[u] || USERS[u].password !== p) return alert("Sai tài khoản");
  localStorage.setItem("user", u);
  localStorage.setItem("role", USERS[u].role);
  initApp(u, USERS[u].role);
};

window.logout = () => {
  localStorage.clear();
  location.reload();
};

window.addEventListener("DOMContentLoaded", () => {
  const u = localStorage.getItem("user");
  const r = localStorage.getItem("role");
  if (u && r) initApp(u, r);
});

/**************** INIT ****************/
function initApp(user, role) {
  currentUser = user;
  currentRole = role;

  loginBox.style.display = "none";
  app.style.display = "block";

  if (role !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }

  renderHeader();
  loadTasks();
  loadHistory();
  pushNextTaskToESP(); // ⭐ QUAN TRỌNG
}

/**************** ADD TASK ****************/
window.addTask = async () => {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const dayIndex = dayInput.selectedIndex;
  const task = taskInput.value.trim();
  const time = timeInput.value;

  if (!name || !task || !time) return alert("Thiếu thông tin");

  const [hh, mm] = time.split(":").map(Number);
  const timeMin = hh * 60 + mm;

  await db.collection("tasks").add({
    name,
    day: days[dayIndex],
    date: dateFromWeek(dayIndex),
    task,
    time,
    timeMin,
    weekStart: firebase.firestore.Timestamp.fromDate(currentWeekStart),
    done: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value = "";
  timeInput.value = "";
  loadTasks();
  pushNextTaskToESP();
};

/**************** LOAD TASKS ****************/
async function loadTasks() {
  const snap = await db.collection("tasks")
    .where("weekStart","==",
      firebase.firestore.Timestamp.fromDate(currentWeekStart))
    .get();

  const data = {};
  snap.forEach(doc => {
    const d = doc.data();
    if (!data[d.name]) data[d.name] = {};
    if (!data[d.name][d.day]) data[d.name][d.day] = [];
    data[d.name][d.day].push({ id: doc.id, ...d });
  });

  renderTable(data);
}

/**************** RENDER HEADER ****************/
function renderHeader() {
  tableHeader.innerHTML = "<th>Tên</th>";
  days.forEach((day, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    tableHeader.innerHTML +=
      `<th>${day}<br><small>${d.toLocaleDateString()}</small></th>`;
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

        const span = document.createElement("span");
        span.textContent = `[${t.time}] ${t.task}`;
        if (t.done) span.classList.add("done-task");

        cb.onchange = async () => {
          await db.collection("tasks").doc(t.id).update({ done: cb.checked });
          if (cb.checked) addHistory(t.name, t.task, t.time);
          pushNextTaskToESP();
        };

        div.append(cb, span);

        if (currentRole === "admin") {
          const del = document.createElement("button");
          del.textContent = "❌";
          del.onclick = async () => {
            if (!confirm("Xóa?")) return;
            await db.collection("tasks").doc(t.id).delete();
            loadTasks();
            pushNextTaskToESP();
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

async function loadHistory() {
  const snap = await db.collection("history")
    .orderBy("time","desc")
    .limit(200)
    .get();

  historyBody.innerHTML = "";
  snap.forEach(doc => {
    const d = doc.data();
    historyBody.innerHTML += `
      <tr>
        <td>${d.employee}</td>
        <td>[${d.timeTask}] ${d.task}</td>
        <td>${d.checkedBy}</td>
        <td>${d.time?.toDate().toLocaleString() || ""}</td>
      </tr>`;
  });
}

/**************** QUEUE → ESP ****************/
async function pushNextTaskToESP() {
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  const nowMin = now.getHours()*60 + now.getMinutes();

  const snap = await db.collection("tasks")
    .where("date","==",today)
    .where("done","==",false)
    .where("timeMin",">=",nowMin)
    .orderBy("timeMin")
    .limit(1)
    .get();

  if (snap.empty) {
    await db.collection("esp_devices").doc("esp32_01").set({
      active: false
    }, { merge: true });
    return;
  }

  const doc = snap.docs[0];
  const t = doc.data();

  const [hh, mm] = t.time.split(":").map(Number);
  const epoch = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh, mm, 0
  ).getTime() / 1000;

  await db.collection("esp_devices").doc("esp32_01").set({
    active: true,
    taskId: doc.id,
    task: t.task,
    time: t.time,
    epoch
  }, { merge: true });
}
