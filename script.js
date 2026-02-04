// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
  storageBucket: "task-75413.firebasestorage.app",
  messagingSenderId: "934934617374",
  appId: "1:934934617374:web:71ed6700a713351a72fd0f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== LOGIN =====
function login() {
  const name = document.getElementById("name").value.trim();
  if (!name) {
    alert("Nhập tên!");
    return;
  }

  localStorage.setItem("username", name);

  if (name.toLowerCase() === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "task.html";
  }
}

// ===== ADMIN: THÊM NHIỆM VỤ =====
function addTask() {
  const employee = document.getElementById("employee").value.trim();
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value.trim();

  if (!employee || !task) {
    alert("Nhập đủ thông tin!");
    return;
  }

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false,
    time: new Date().toLocaleString()
  });

  document.getElementById("task").value = "";
}

// ===== ADMIN: HIỂN THỊ + XOÁ =====
const table = document.getElementById("taskTable");
if (table) {
  db.collection("tasks").orderBy("time", "desc").onSnapshot(snapshot => {
    table.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      table.innerHTML += `
        <tr>
          <td>${d.employee}</td>
          <td>${d.day}</td>
          <td>${d.task}</td>
          <td>${d.done ? "✅ Xong" : "⏳ Chưa xong"}</td>
          <td>
            <button onclick="deleteTask('${doc.id}')">❌</button>
          </td>
        </tr>
      `;
    });
  });
}

function deleteTask(id) {
  if (confirm("Xoá nhiệm vụ?")) {
    db.collection("tasks").doc(id).delete();
  }
}

// ===== NHÂN VIÊN =====
const box = document.getElementById("myTasks");
if (box) {
  const name = localStorage.getItem("username");
  if (!name) {
    box.innerHTML = "Chưa đăng nhập";
  } else {
    db.collection("tasks")
      .where("employee", "==", name)
      .onSnapshot(snapshot => {
        if (snapshot.empty) {
          box.innerHTML = "Chưa có nhiệm vụ";
          return;
        }

        box.innerHTML = "";
        snapshot.forEach(doc => {
          const d = doc.data();
          box.innerHTML += `
            <div>
              <input type="checkbox" ${d.done ? "checked" : ""}
                onchange="toggleTask('${doc.id}', this.checked)">
              <b>${d.day}</b> – ${d.task}
              <small>(${d.time})</small>
            </div>
          `;
        });
      });
  }
}

function toggleTask(id, value) {
  db.collection("tasks").doc(id).update({
    done: value,
    time: new Date().toLocaleString()
  });
}
