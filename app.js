/************* LOGIN CỨNG *************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
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
const savedRole = localStorage.getItem("role");
if (savedRole) {
  currentRole = savedRole;
  loginBox.style.display = "none";
  app.style.display = "block";
  applyRole();
}

/************* FIREBASE *************/
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

/************* TASK *************/
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
    name, day, text,
    done: false,
    createdAt: Date.now()
  });

  taskInput.value = "";
};

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

function renderTable(data) {
  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${name}</b></td>`;

    days.forEach(day => {
      const td = document.createElement("td");
      (data[name][day] || []).forEach(t => {
        td.innerHTML += `
          <div>
            <input type="checkbox" ${t.done ? "checked" : ""}
              onchange="toggleDone('${t.id}', this.checked)">
            ${t.text}
            ${currentRole === "admin" ? `<button onclick="deleteTask('${t.id}')">❌</button>` : ""}
          </div>
        `;
      });
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

window.toggleDone = (id, v) =>
  db.collection("tasks").doc(id).update({ done: v });

window.deleteTask = id => {
  if (confirm("Xoá nhiệm vụ?"))
    db.collection("tasks").doc(id).delete();
};
