// ===== FIREBASE =====
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

// ===== LOGIN =====
function login() {
  const name = document.getElementById("name").value.trim();
  if (!name) return alert("Nhập tên");
  localStorage.setItem("username", name);
  window.location.href = "board.html";
}

// ===== ADMIN ADD =====
function addTask() {
  const employee = document.getElementById("employee").value.trim();
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value.trim();

  if (!employee || !task) return alert("Nhập đủ");

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false,
    note: "",
    time: new Date().toLocaleString()
  });

  document.getElementById("task").value = "";
}

// ===== BOARD =====
const body = document.getElementById("tableBody");
if (body) {
  db.collection("tasks").onSnapshot(snapshot => {
    const data = {};

    snapshot.forEach(doc => {
      const d = doc.data();
      if (!data[d.employee]) {
        data[d.employee] = {
          "Thứ 2": "", "Thứ 3": "", "Thứ 4": "",
          "Thứ 5": "", "Thứ 6": "", "Thứ 7": "",
          note: ""
        };
      }

      data[d.employee][d.day] =
        `<label>
          <input type="checkbox" ${d.done ? "checked" : ""}
            onchange="toggle('${doc.id}', this.checked)">
          ${d.task}
        </label>`;
    });

    body.innerHTML = "";
    Object.keys(data).forEach(name => {
      body.innerHTML += `
        <tr>
          <td>${name}</td>
          <td>${data[name]["Thứ 2"]}</td>
          <td>${data[name]["Thứ 3"]}</td>
          <td>${data[name]["Thứ 4"]}</td>
          <td>${data[name]["Thứ 5"]}</td>
          <td>${data[name]["Thứ 6"]}</td>
          <td>${data[name]["Thứ 7"]}</td>
          <td></td>
        </tr>
      `;
    });
  });
}

function toggle(id, v) {
  db.collection("tasks").doc(id).update({
    done: v,
    time: new Date().toLocaleString()
  });
}
