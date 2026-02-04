/******** FIREBASE ********/
const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/******** LOGIN ********/
function login() {
  const email = document.getElementById("email").value;
  localStorage.setItem("email", email);

  if (email === "admin@gmail.com") {
    location.href = "admin.html";
  } else {
    location.href = "task.html";
  }
}

/******** DAYS ********/
const days = ["Tên", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Ghi chú"];

/******** LOAD TABLE ********/
function loadTable(isAdmin) {
  const table = document.getElementById("schedule");
  if (!table) return;

  db.collection("schedule").onSnapshot(snapshot => {
    table.innerHTML = "";

    // Header
    let header = "<tr>";
    days.forEach(d => header += `<th>${d}</th>`);
    header += "</tr>";
    table.innerHTML += header;

    snapshot.forEach(doc => {
      const row = doc.data();
      let tr = `<tr>`;

      days.forEach(day => {
        if (day === "Tên") {
          tr += `<td>${row.name || ""}</td>`;
        } else {
          tr += `<td>`;
          (row.tasks?.[day] || []).forEach((t, i) => {
            tr += `
              <div class="${t.done ? 'done' : ''}">
                <input type="checkbox" ${t.done ? "checked" : ""}
                  onchange="toggle('${doc.id}','${day}',${i},this.checked)">
                ${t.text}
                ${isAdmin ? `<button onclick="delTask('${doc.id}','${day}',${i})">❌</button>` : ""}
              </div>`;
          });

          if (isAdmin) {
            tr += `
              <input placeholder="+ nhiệm vụ"
                onkeydown="if(event.key==='Enter') addTask('${doc.id}','${day}',this.value,this)">`;
          }
          tr += `</td>`;
        }
      });

      tr += "</tr>";
      table.innerHTML += tr;
    });
  });
}

/******** ADMIN ********/
function addRow() {
  const name = prompt("Tên nhân viên:");
  if (!name) return;

  db.collection("schedule").add({
    name,
    tasks: {}
  });
}

function addTask(id, day, text, input) {
  if (!text) return;

  const ref = db.collection("schedule").doc(id);
  ref.get().then(doc => {
    const data = doc.data();
    if (!data.tasks[day]) data.tasks[day] = [];
    data.tasks[day].push({ text, done: false });
    ref.update({ tasks: data.tasks });
    input.value = "";
  });
}

function delTask(id, day, index) {
  const ref = db.collection("schedule").doc(id);
  ref.get().then(doc => {
    const data = doc.data();
    data.tasks[day].splice(index, 1);
    ref.update({ tasks: data.tasks });
  });
}

/******** EMPLOYEE ********/
function toggle(id, day, index, val) {
  const ref = db.collection("schedule").doc(id);
  ref.get().then(doc => {
    const data = doc.data();
    data.tasks[day][index].done = val;
    ref.update({ tasks: data.tasks });
  });
}

/******** INIT ********/
const email = localStorage.getItem("email");
if (email === "admin@gmail.com") {
  loadTable(true);
} else {
  loadTable(false);
}
