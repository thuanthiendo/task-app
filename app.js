/******** LOGIN ********/
const USERS = {
  admin: { password: "123", role: "admin" },
  hungtv: { password: "123", role: "admin" },
  thiendt: { password: "123", role: "employee" },
  khangpd: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

let currentRole = null;

window.login = function () {
  const u = username.value.trim();
  const p = password.value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  currentRole = USERS[u].role;
  localStorage.setItem("role", currentRole);

  loginBox.style.display = "none";
  app.style.display = "block";
  applyRole();
};

window.logout = () => {
  localStorage.clear();
  location.reload();
};

function applyRole() {
  if (currentRole !== "admin") {
    document.querySelectorAll(".admin-only").forEach(e => e.remove());
  }
}

/******** AUTO LOGIN ********/
const savedRole = localStorage.getItem("role");
if (savedRole) {
  currentRole = savedRole;
  loginBox.style.display = "none";
  app.style.display = "block";
  applyRole();
}

/******** FIREBASE ********/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
});

const db = firebase.firestore();

/******** DATE UTILS ********/
function getWeekDays() {
  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));

  const days = [];
  const names = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      key: names[i],
      label: `${names[i]} (${d.getDate()}/${d.getMonth()+1})`
    });
  }
  return days;
}

const weekDays = getWeekDays();

/******** INIT HEADER + SELECT ********/
const headerRow = document.getElementById("headerRow");
const dayInput = document.getElementById("dayInput");

weekDays.forEach(d => {
  headerRow.innerHTML += `<th>${d.label}</th>`;
  dayInput.innerHTML += `<option value="${d.key}">${d.label}</option>`;
});

headerRow.innerHTML += `<th>Ghi chú</th>`;

/******** ADD TASK ********/
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
    note: "",
    createdAt: Date.now()
  });

  taskInput.value = "";
};

/******** RENDER ********/
db.collection("tasks").onSnapshot(snapshot => {
  const data = {};
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.name]) data[d.name] = { tasks:{}, notes:{} };
    if (!data[d.name].tasks[d.day]) data[d.name].tasks[d.day] = [];
    data[d.name].tasks[d]()
