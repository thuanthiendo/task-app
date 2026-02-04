/**************************************************
 * 🔥 FIREBASE CONFIG
 **************************************************/
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
  storageBucket: "task-75413.firebasestorage.app",
  messagingSenderId: "934934617374",
  appId: "1:934934617374:web:71ed6700a713351a72fd0f"
};

// Init Firebase (tránh init nhiều lần)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

/**************************************************
 * 🔐 LOGIN
 **************************************************/
function login() {
  const emailInput = document.getElementById("email");
  if (!emailInput) return;

  const email = emailInput.value.trim();

  if (!email) {
    alert("Vui lòng nhập email");
    return;
  }

  // ADMIN
  if (email === "admin@gmail.com") {
    localStorage.setItem("role", "admin");
    localStorage.setItem("user", email);
    window.location.href = "admin.html";
  }
  // NHÂN VIÊN
  else {
    localStorage.setItem("role", "staff");
    localStorage.setItem("user", email);
    window.location.href = "task.html";
  }
}

/**************************************************
 * 👑 ADMIN PAGE
 **************************************************/
if (document.getElementById("taskTable")) {
  // Chặn nếu không phải admin
  if (localStorage.getItem("role") !== "admin") {
    alert("Bạn không có quyền truy cập");
    window.location.href = "index.html";
  }

  // Lắng nghe realtime
  db.collection("tasks")
    .orderBy("time", "desc")
    .onSnapshot(snapshot => {
      const table = document.getElementById("taskTable");
      table.innerHTML = "";

      snapshot.forEach(doc => {
        const d = doc.data();
        table.innerHTML += `
          <tr>
            <td>${d.employee}</td>
            <td>${d.day}</td>
            <td>${d.task}</td>
            <td>${d.done ? "✅ Hoàn thành" : "⏳ Đang làm"}</td>
          </tr>
        `;
      });
    });
}

// Thêm nhiệm vụ
function addTask() {
  const employee = document.getElementById("employee")?.value.trim();
  const day = document.getElementById("day")?.value;
  const task = document.getElementById("task")?.value.trim();

  if (!employee || !task) {
    alert("Nhập đầy đủ tên nhân viên và nhiệm vụ");
    return;
  }

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false,
    time: new Date().toLocaleString()
  }).then(() => {
    document.getElementById("task").value = "";
  });
}

/**************************************************
 * 👷 NHÂN VIÊN PAGE
 **************************************************/
if (document.getElementById("myTasks")) {
  const user = localStorage.getItem("user");

  if (!user) {
    alert("Bạn chưa đăng nhập");
    window.location.href = "index.html";
  }

  db.collection("tasks")
    .where("employee", "==", user)
    .onSnapshot(snapshot => {
      const box = document.getElementById("myTasks");
      box.innerHTML = "";

      if (snapshot.empty) {
        box.innerHTML = "<p>📭 Chưa có nhiệm vụ</p>";
        return;
      }

      snapshot.forEach(doc => {
        const d = doc.data();
        box.innerHTML += `
          <div style="margin-bottom:10px">
            <input type="checkbox"
              ${d.done ? "checked" : ""}
              onchange="toggleTask('${doc.id}', this.checked)">
            <b>${d.day}</b> - ${d.task}<br>
            <small>⏰ ${d.time}</small>
          </div>
        `;
      });
    });
}

// Cập nhật trạng thái
function toggleTask(id, value) {
  db.collection("tasks").doc(id).update({
    done: value,
    time: new Date().toLocaleString()
  });
}
