// 🔥 Firebase config (THAY BẰNG CONFIG CỦA BẠN)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const tableBody = document.getElementById("tableBody");

// Tạo sẵn bảng trống
function renderEmptyTable() {
  tableBody.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="empty">---</td>
      ${days.map(() => `<td class="empty">Trống</td>`).join("")}
      <td class="empty">---</td>
    `;
    tableBody.appendChild(tr);
  }
}

renderEmptyTable();

// Thêm nhiệm vụ
function addTask() {
  const name = document.getElementById("nameInput").value.trim();
  const day = document.getElementById("dayInput").value;
  const task = document.getElementById("taskInput").value.trim();

  if (!name || !task) {
    alert("Nhập đủ tên và nhiệm vụ");
    return;
  }

  db.collection("tasks").add({
    name,
    day,
    task,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  document.getElementById("taskInput").value = "";
}

// Realtime update
db.collection("tasks").orderBy("createdAt")
  .onSnapshot(snapshot => {
    const data = {};

    snapshot.forEach(doc => {
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
        <td></td>
      `;
      tableBody.appendChild(tr);
    });
  });
