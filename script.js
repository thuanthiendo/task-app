// 🔥 Firebase config
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

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

// ================= THÊM NHIỆM VỤ =================
function addTask() {
  const employee = document.getElementById("employee").value.trim();
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value.trim();

  if (!employee || !task) {
    alert("Nhập đủ tên và nhiệm vụ");
    return;
  }

  db.collection("tasks").add({
    employee,
    day,
    task
  });

  document.getElementById("task").value = "";
}

// ================= HIỂN THỊ BẢNG =================
db.collection("tasks").onSnapshot(snapshot => {
  const data = {};

  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.employee]) {
      data[d.employee] = {};
    }
    data[d.employee][d.day] = d.task;
  });

  renderTable(data);
});

function renderTable(data) {
  const body = document.getElementById("tableBody");
  body.innerHTML = "";

  Object.keys(data).forEach(name => {
    let row = `<tr><td><b>${name}</b></td>`;

    days.forEach(day => {
      row += `<td>${data[name][day] || ""}</td>`;
    });

    row += "</tr>";
    body.innerHTML += row;
  });
}
