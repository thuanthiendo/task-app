/************ LOGIN CỨNG ************/
const USERS = {
  admin: { password: "123", role: "admin" },
  emp1: { password: "123", role: "employee" },
  emp2: { password: "123", role: "employee" }
};

function login() {
  const u = username.value.trim();
  const p = password.value.trim();

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Sai tài khoản hoặc mật khẩu");
    return;
  }

  localStorage.setItem("user", u);
  localStorage.setItem("role", USERS[u].role);

  loginBox.style.display = "none";
  app.style.display = "block";

  if (USERS[u].role !== "admin") {
    document.querySelector(".admin-only").style.display = "none";
  }

  loadTasks();
  loadHistory();
}

function logout() {
  localStorage.clear();
  location.reload();
}

/************ FIREBASE ************/
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});

const db = firebase.firestore();

/************ TASK ************/
function addTask() {
  const name = nameInput.value.trim();
  const day = dayInput.value;
  const task = taskInput.value.trim();

  if (!name || !task) {
    alert("Nhập đủ thông tin");
    return;
  }

  db.collection("tasks").add({
    name, day, task
  });

  taskInput.value = "";
}

function loadTasks() {
  db.collection("tasks").onSnapshot(snap => {
    tableBody.innerHTML = "";

    const map = {};

    snap.forEach(doc => {
      const d = doc.data();
      if (!map[d.name]) map[d.name] = {};
      map[d.name][d.day] = { text: d.task, id: doc.id };
    });

    Object.keys(map).forEach(name => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td><b>${name}</b></td>`;

      ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"].forEach(day => {
        const td = document.createElement("td");
        if (map[name][day]) {
          td.innerHTML = `
            ${map[name][day].text}
            <br>
            <input type="checkbox" onclick="done('${map[name][day].id}','${day}','${map[name][day].text}')">
          `;
        }
        tr.appendChild(td);
      });

      const del = document.createElement("td");
      del.innerHTML = `<button onclick="deleteTask('${name}')">🗑</button>`;
      tr.appendChild(del);

      tableBody.appendChild(tr);
    });
  });
}

async function deleteTask(name) {
  if (!confirm("Xóa toàn bộ nhiệm vụ & lịch sử của nhân viên này?")) return;

  const t = await db.collection("tasks").where("name", "==", name).get();
  t.forEach(d => d.ref.delete());

  const h = await db.collection("history").where("user", "==", name).get();
  h.forEach(d => d.ref.delete());
}

/************ HISTORY ************/
function done(taskId, day, task) {
  const user = localStorage.getItem("user");

  db.collection("history").add({
    user,
    day,
    task,
    time: new Date().toLocaleString(),
    status: "done"
  });
}

function loadHistory() {
  db.collection("history")
    .orderBy("time", "desc")
    .onSnapshot(snap => {
      historyBody.innerHTML = "";
      snap.forEach(d => {
        const h = d.data();
        historyBody.innerHTML += `
          <tr>
            <td>${h.time}</td>
            <td>${h.user}</td>
            <td>${h.day}</td>
            <td>${h.task}</td>
            <td>✔</td>
          </tr>
        `;
      });
    });
}
