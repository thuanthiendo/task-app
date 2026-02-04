// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

// ===== LOGIN =====
function login() {
  const email = document.getElementById("email").value;
  localStorage.setItem("user", email);

  if (email === "admin@gmail.com") {
    location.href = "admin.html";
  } else {
    location.href = "task.html";
  }
}

// ===== ADD TASK (ADMIN) =====
function addTask() {
  const employee = document.getElementById("employee").value.trim();
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value.trim();

  if (!employee || !task) {
    alert("Nhập đủ thông tin");
    return;
  }

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false
  });

  document.getElementById("task").value = "";
}

// ===== RENDER SCHEDULE =====
db.collection("tasks").onSnapshot(snapshot => {
  const data = {};

  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.employee]) data[d.employee] = {};
    if (!data[d.employee][d.day]) data[d.employee][d.day] = [];
    data[d.employee][d.day].push({
      id: doc.id,
      task: d.task,
      done: d.done
    });
  });

  renderSchedule(data);
});

function renderSchedule(data) {
  const table = document.getElementById("schedule");
  if (!table) return;

  table.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = name;
    tr.appendChild(nameTd);

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.className = "task" + (t.done ? " done" : "");
        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggle('${t.id}', this.checked)">
          ${t.task}
          ${isAdmin() ? `<button onclick="del('${t.id}')">❌</button>` : ""}
        `;
        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });
}

// ===== ACTIONS =====
function toggle(id, v) {
  db.collection("tasks").doc(id).update({ done: v });
}

function del(id) {
  if (confirm("Xoá nhiệm vụ?")) {
    db.collection("tasks").doc(id).delete();
  }
}

function isAdmin() {
  return localStorage.getItem("user") === "admin@gmail.com";
}
