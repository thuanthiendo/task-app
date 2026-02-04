// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= LOGIN =================
function login() {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Nhập email");
    return;
  }

  if (email === "admin@gmail.com") {
    localStorage.setItem("user", "admin");
    location.href = "admin.html";
  } else {
    localStorage.setItem("user", email);
    location.href = "task.html";
  }
}

// ================= ADMIN =================
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
    done: false,
    time: new Date().toLocaleString()
  }).then(() => {
    alert("Đã thêm nhiệm vụ");
    document.getElementById("task").value = "";
  });
}

// Hiển thị bảng ADMIN
if (document.getElementById("taskTable")) {
  db.collection("tasks").onSnapshot(snapshot => {
    const table = document.getElementById("taskTable");
    table.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      table.innerHTML += `
        <tr>
          <td>${d.employee}</td>
          <td>${d.day}</td>
          <td>${d.task}</td>
          <td>${d.done ? "✅ Xong" : "⏳ Chưa xong"}</td>
        </tr>
      `;
    });
  });
}

// ================= NHÂN VIÊN =================
if (document.getElementById("myTasks")) {
  const user = localStorage.getItem("user");

  db.collection("tasks")
    .where("employee", "==", user)
    .onSnapshot(snapshot => {
      const box = document.getElementById("myTasks");
      box.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();
        box.innerHTML += `
          <div>
            <input type="checkbox"
              ${d.done ? "checked" : ""}
              onchange="toggleTask('${doc.id}', this.checked)">
            <b>${d.day}</b> - ${d.task}
            <small>(${d.time})</small>
          </div>
        `;
      });
    });
}

function toggleTask(id, value) {
  db.collection("tasks").doc(id).update({
    done: value,
    time: new Date().toLocaleString()
  });
}
