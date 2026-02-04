// 🔥 THAY CONFIG FIREBASE CỦA BẠN
firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
});

const db = firebase.firestore();
const tableBody = document.getElementById("tableBody");

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];

// 👉 TẠO BẢNG TRỐNG NGAY KHI LOAD
function renderEmpty() {
  tableBody.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="empty">---</td>
      ${days.map(() => `<td class="empty">Trống</td>`).join("")}
    `;
    tableBody.appendChild(tr);
  }
}

renderEmpty();

// 👉 THÊM NHIỆM VỤ
function addTask() {
  const name = nameInput.value.trim();
  const day = dayInput.value;
  const task = taskInput.value.trim();

  if (!name || !task) return alert("Nhập đủ thông tin");

  db.collection("tasks").add({ name, day, task });
  taskInput.value = "";
}

// 👉 REALTIME HIỂN THỊ
db.collection("tasks").onSnapshot(snap => {
  const data = {};

  snap.forEach(doc => {
    const { name, day, task } = doc.data();
    if (!data[name]) data[name] = {};
    data[name][day] = task;
  });

  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      ${days.map(d => `<td>${data[name][d] || ""}</td>`).join("")}
    `;
    tableBody.appendChild(tr);
  });
});
