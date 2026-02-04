// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== LOGIN =====
function login() {
  const email = document.getElementById("email").value;
  localStorage.setItem("user", email);

  if (email === "admin@gmail.com") {
    location.href = "admin.html";
  } else {
    location.href = "task.html";
  }
}

// ===== ADMIN ADD =====
function addTask() {
  const employee = employee.value;
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value;

  db.collection("tasks").add({
    employee,
    day,
    task,
    done: false,
    time: new Date().toLocaleString()
  });

  document.getElementById("task").value = "";
}

// ===== ADMIN VIEW =====
if (document.getElementById("adminTable")) {
  db.collection("tasks").onSnapshot(snap => {
    adminTable.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      adminTable.innerHTML += `
        <tr>
          <td>${d.employee}</td>
          <td>${d.day}</td>
          <td class="${d.done ? "done" : ""}">${d.task}</td>
          <td>${d.done ? "✔" : "⏳"}</td>
          <td><button onclick="del('${doc.id}')">❌</button></td>
        </tr>
      `;
    });
  });
}

function del(id) {
  db.collection("tasks").doc(id).delete();
}

// ===== EMPLOYEE VIEW =====
if (document.getElementById("myTasks")) {
  const user = localStorage.getItem("user");

  db.collection("tasks")
    .where("employee", "==", user)
    .onSnapshot(snap => {
      myTasks.innerHTML = "";
      snap.forEach(doc => {
        const d = doc.data();
        myTasks.innerHTML += `
          <div>
            <input type="checkbox" ${d.done ? "checked" : ""}
              onchange="toggle('${doc.id}', this.checked)">
            <b>${d.day}</b> - ${d.task}
            <small>${d.time}</small>
          </div>
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
