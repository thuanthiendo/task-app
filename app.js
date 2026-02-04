// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];

// ================= ADD TASK =================
function addTask() {
  const name = nameInput.value.trim();
  const day = dayInput.value;
  const text = taskInput.value.trim();

  if (!name || !text) {
    alert("Nhập đủ tên và nhiệm vụ");
    return;
  }

  db.collection("tasks").add({
    name,
    day,
    text,
    done: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value = "";
}

// ================= RENDER TABLE =================
db.collection("tasks").orderBy("createdAt").onSnapshot(snapshot => {
  const data = {};

  snapshot.forEach(doc => {
    const d = doc.data();
    if (!data[d.name]) data[d.name] = {};
    if (!data[d.name][d.day]) data[d.name][d.day] = [];
    data[d.name][d.day].push({ id: doc.id, ...d });
  });

  renderTable(data);
});

function renderTable(data) {
  tableBody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.innerHTML = `<b>${name}</b>`;
    tr.appendChild(nameTd);

    days.forEach(day => {
      const td = document.createElement("td");

      (data[name][day] || []).forEach(t => {
        const div = document.createElement("div");
        div.className = "task";

        div.innerHTML = `
          <input type="checkbox" ${t.done ? "checked" : ""}
            onchange="toggleDone('${t.id}', this.checked)">
          <span class="${t.done ? "done" : ""}">${t.text}</span>
          <button onclick="deleteTask('${t.id}')">❌</button>
        `;

        td.appendChild(div);
      });

      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

// ================= ACTIONS =================
function toggleDone(id, value) {
  db.collection("tasks").doc(id).update({ done: value });
}

function deleteTask(id) {
  if (confirm("Xoá nhiệm vụ?")) {
    db.collection("tasks").doc(id).delete();
  }
}
