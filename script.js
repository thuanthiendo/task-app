// 🔥 Firebase config (THAY BẰNG CỦA BẠN)
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const tbody = document.querySelector("#taskTable tbody");

// Load dữ liệu
db.collection("tasks").doc("week").onSnapshot(doc => {
  tbody.innerHTML = "";
  if (!doc.exists) return;

  const data = doc.data().members || [];
  data.forEach(addRow);
});

// Thêm dòng
function addRow(member) {
  const tr = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.innerText = member.name;
  tr.appendChild(nameCell);

  for (let i = 0; i < 7; i++) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.value = member.tasks[i] || "";
    td.appendChild(input);
    tr.appendChild(td);
  }

  tbody.appendChild(tr);
}

// Thêm thành viên (KHÔNG MẤT DATA)
function addMember() {
  const name = document.getElementById("memberName").value.trim();
  if (!name) return;

  db.collection("tasks").doc("week").get().then(doc => {
    const members = doc.exists ? doc.data().members : [];
    members.push({ name, tasks: [] });
    db.collection("tasks").doc("week").set({ members });
  });

  document.getElementById("memberName").value = "";
}

// Lưu dữ liệu
function saveData() {
  const rows = document.querySelectorAll("tbody tr");
  const members = [];

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const name = row.children[0].innerText;
    const tasks = Array.from(inputs).map(i => i.value);
    members.push({ name, tasks });
  });

  db.collection("tasks").doc("week").set({ members });
  alert("✅ Đã lưu");
}
