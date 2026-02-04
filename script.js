// 🔥 DÁN firebaseConfig CỦA BẠN
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

// ================= LOGIN =================
function login() {
  const email = document.getElementById("email").value;

  if (email === "admin@gmail.com") {
    localStorage.setItem("user", "admin");
    window.location.href = "admin.html";
  } else {
    localStorage.setItem("user", email);
    window.location.href = "task.html";
  }
}

// ================= ADMIN =================
function addTask() {
  const employee = document.getElementById("employee").value;
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value;

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false,
    time: new Date().toLocaleString()
  });
}

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
            <input type="checkbox" ${d.done ? "checked" : ""}
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
