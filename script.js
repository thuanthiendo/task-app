// 🔥 Firebase config (GIỮ NGUYÊN CỦA BẠN)
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

// ================= ADD TASK =================
function addTask() {
  const employee = employeeInput.value.trim();
  const day = dayInput.value;
  const task = taskInput.value.trim();

  if (!employee || !task) {
    alert("Nhập đầy đủ thông tin");
    return;
  }

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false,
    updated: new Date().toLocaleString()
  });

  taskInput.value = "";
}

// ================= RENDER TABLE =================
const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];

db.collection("tasks").onSnapshot(snapshot => {
  const data = {};
  
  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.employee]) {
      data[d.employee] = {};
      days.forEach(day => data[d.employee][day] = "");
      data[d.employee].note = "";
    }
    data[d.employee][d.day] = d.task;
    data[d.employee].note = d.updated;
  });

  renderTable(data);
});

function renderTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  if (Object.keys(data).length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;color:#888">
          Chưa có nhiệm vụ
        </td>
      </tr>
    `;
    return;
  }

  for (const emp in data) {
    let row = `<tr><td><b>${emp}</b></td>`;
    days.forEach(day => {
      row += `<td>${data[emp][day] || "—"}</td>`;
    });
    row += `<td>${data[emp].note}</td></tr>`;
    tbody.innerHTML += row;
  }
}
