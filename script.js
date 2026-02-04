// ================= FIREBASE =================
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
  const email = document.getElementById("email").value.trim();
  if (!email) return alert("Nhập tên hoặc email");

  if (email === "admin@gmail.com") {
    localStorage.setItem("user", "admin");
    location.href = "admin.html";
  } else {
    localStorage.setItem("user", email);
    location.href = "task.html";
  }
}

// ================= ADMIN =================
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const employee = document.getElementById("employee").value.trim();
      const day = document.getElementById("day").value.trim();
      const task = document.getElementById("task").value.trim();

      if (!employee || !day || !task) {
        alert("Nhập đầy đủ thông tin");
        return;
      }

      db.collection("tasks").add({
        employee,        // ❗ chỉ là text, KHÔNG cần trùng login
        day,
        task,
        done: false,
        time: new Date().toLocaleString()
      }).then(() => {
        alert("✅ Đã thêm nhiệm vụ");
        document.getElementById("task").value = "";
      }).catch(err => {
        alert("❌ Lỗi: " + err.message);
      });
    });
  }

  // Hiển thị bảng admin
  const taskTable = document.getElementById("taskTable");
  if (taskTable) {
    db.collection("tasks").onSnapshot(snapshot => {
      taskTable.innerHTML = "";
      snapshot.forEach(doc => {
        const d = doc.data();
        taskTable.innerHTML += `
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
  const myTasks = document.getElementById("myTasks");
  if (myTasks) {
    const user = localStorage.getItem("user");

    db.collection("tasks")
      .where("employee", "==", user)
      .onSnapshot(snapshot => {
        myTasks.innerHTML = "";
        snapshot.forEach(doc => {
          const d = doc.data();
          myTasks.innerHTML += `
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
});

// ================= UPDATE TASK =================
function toggleTask(id, value) {
  db.collection("tasks").doc(id).update({
    done: value,
    time: new Date().toLocaleString()
  });
}
