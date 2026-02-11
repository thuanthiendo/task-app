/**************** DOM ****************/
const loginBox = document.getElementById("loginBox");
const app = document.getElementById("app");
const weekLabel = document.getElementById("weekLabel");
const tableHeader = document.getElementById("tableHeader");
const tableBody = document.getElementById("tableBody");
const historyBody = document.getElementById("historyBody");

const username = document.getElementById("username");
const password = document.getElementById("password");
const nameInput = document.getElementById("nameInput");
const dayInput = document.getElementById("dayInput");
const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");

/**************** USERS ****************/
const USERS = {
  admin:   { password: "123", role: "admin" },
  hungtv:  { password: "123", role: "admin" },
  khoapt:  { password: "123", role: "admin" },
  emp1:    { password: "123", role: "employee" },
  thiendt: { password: "123", role: "employee" },
  khangpd: { password: "123", role: "employee" },
  hieutm:    { password: "123", role: "employee" },
  khoalh: { password: "123", role: "employee" },
  quoclda: { password: "123", role: "employee" },
  hoangminh:    { password: "123", role: "employee" },
  kiettv: { password: "123", role: "employee" },
  sencv: { password: "123", role: "admin" },
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

function updateWeekLabel() {
  const end = new Date(currentWeekStart);
  end.setDate(end.getDate() + 6);
  weekLabel.textContent =
    `Tuần ${currentWeekStart.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

window.prevWeek = () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  refreshWeek();
};

window.nextWeek = () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  refreshWeek();
};

function refreshWeek() {
  updateWeekLabel();
  renderHeader();
  listenTasks();
}

/**************** LOGIN ****************/
window.login = () => {
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

window.logout = () => {
  localStorage.clear();
  location.reload();
};

window.addEventListener("DOMContentLoaded", () => {
  const u = localStorage.getItem("user");
  const r = localStorage.getItem("role");
  if (u && r) initApp(u, r);
});

function initApp(user, role) {
  currentUser = user;
  currentRole = role;

  loginBox.style.display = "none";
  app.style.display = "block";

  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }

  updateWeekLabel();
  renderHeader();
  listenTasks();
  listenHistory();
}

/**************** ADD TASK ****************/
window.addTask = async () => {
  if (currentRole !== "admin") return;

  const name = nameInput.value.trim();
  const day  = dayInput.value;
  const text = taskInput.value.trim();
  const time = timeInput.value;

  if (!name || !day || !text || !time) {
    alert("Nhập đầy đủ thông tin");
    return;
  }

  await db.collection("tasks").add({
    name,
    day,
    text,
    time,
    weekStart: firebase.firestore.Timestamp.fromDate(currentWeekStart),
    done: false,
    historyCreated: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value = "";
  timeInput.value = "";
};

/**************** REALTIME TASKS ****************/
let unsubscribeTasks = null;

function listenTasks() {

  if (unsubscribeTasks) unsubscribeTasks();

  unsubscribeTasks = db.collection("tasks")
    .where("weekStart", "==",
      firebase.firestore.Timestamp.fromDate(currentWeekStart))
    .onSnapshot(snapshot => {

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

/**************** RENDER ****************/
function renderHeader() {
  tableHeader.innerHTML = "<th>Tên</th>";

  days.forEach((day, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);

    tableHeader.innerHTML +=
      `<th>${day}<br><small>${d.toLocaleDateString()}</small></th>`;
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

        const span = document.createElement("span");
        span.textContent = `[${t.time}] ${t.text}`;
        if (t.done) span.classList.add("done-task");

        cb.onchange = async () => {
          try {

            await db.collection("tasks").doc(t.id)
              .update({ done: cb.checked });

            if (cb.checked && !t.historyCreated) {
              await addHistory(name, t.text, t.time);
              await db.collection("tasks").doc(t.id)
                .update({ historyCreated: true });
            }

          } catch (err) {
            console.error("Update lỗi:", err);
          }
        };

        div.append(cb, span);

        if (currentRole === "admin" && t.done) {
          const del = document.createElement("button");
          del.textContent = "❌";
          del.onclick = async () => {
            if (!confirm("Xóa nhiệm vụ này?")) return;
            await db.collection("tasks").doc(t.id).delete();
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
async function addHistory(employee, task, time) {
  await db.collection("history").add({
    employee,
    task,
    timeTask: time,
    checkedBy: currentUser,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
}

let unsubscribeHistory = null;

function listenHistory() {

  if (unsubscribeHistory) unsubscribeHistory();

  unsubscribeHistory = db.collection("history")
    .orderBy("time", "desc")
    .limit(300)
    .onSnapshot(snapshot => {

      historyBody.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${d.employee}</td>
          <td>[${d.timeTask}] ${d.task}</td>
          <td>${d.checkedBy}</td>
          <td>${d.time ? d.time.toDate().toLocaleString() : "Đang cập nhật..."}</td>
        `;

        if (currentRole === "admin") {
          const td = document.createElement("td");
          const btn = document.createElement("button");
          btn.textContent = "❌";
          btn.onclick = async () => {
            if (!confirm("Xóa lịch sử này?")) return;
            await db.collection("history").doc(doc.id).delete();
          };
          td.appendChild(btn);
          tr.appendChild(td);
        }

        historyBody.appendChild(tr);
      });
    });
}

/**************** CLEAR HISTORY ****************/
window.clearHistory = async () => {
  if (currentRole !== "admin") return;
  if (!confirm("Xóa toàn bộ lịch sử?")) return;

  const snap = await db.collection("history").get();
  const batch = db.batch();

  snap.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
};
