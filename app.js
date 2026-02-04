const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Nhập email và mật khẩu");
    return;
  }

  firebase.auth()
    .signInWithEmailAndPassword(email, password)
    .then(user => {
      if (email.includes("admin")) {
        window.location.href = "admin.html";
      } else {
        window.location.href = "employee.html";
      }
    })
    .catch(err => {
      alert("Lỗi đăng nhập: " + err.message);
      console.error(err);
    });
}


function addTask() {
  const name = empName.value;
  const day = day.value;
  const text = taskText.value;

  if (!name || !text) return alert("Thiếu dữ liệu");

  db.collection("tasks").add({
    name, day, text, done: false
  });
}

db.collection("tasks").onSnapshot(snap => {
  const board = document.getElementById("board");
  if (!board) return;

  const map = {};
  snap.forEach(d => {
    const t = d.data();
    map[t.name] ??= {};
    map[t.name][t.day] ??= [];
    map[t.name][t.day].push({ ...t, id: d.id });
  });

  board.innerHTML = "";
  Object.keys(map).forEach(name => {
    let row = `<tr><td>${name}</td>`;
    ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"].forEach(d => {
      row += `<td>${
        (map[name][d]||[]).map(t =>
          `<div class="task ${t.done?'done':''}">
            ${t.text}
            <button onclick="db.collection('tasks').doc('${t.id}').update({done:!${t.done}})">✔</button>
            <button onclick="db.collection('tasks').doc('${t.id}').delete()">❌</button>
          </div>`
        ).join("")
      }</td>`;
    });
    row += "</tr>";
    board.innerHTML += row;
  });
});
