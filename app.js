import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
  storageBucket: "task-75413.appspot.com",
  messagingSenderId: "934934617374",
  appId: "1:934934617374:web:71ed6700a713351a72fd0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksRef = collection(db, "tasks");

window.addTask = async () => {
  const name = taskName.value;
  const member = member.value;
  const time = document.getElementById("time").value;

  await addDoc(tasksRef, {
    name, member, time,
    days: {},
    note: ""
  });
};

onSnapshot(tasksRef, snap => {
  const body = document.querySelector("#taskTable tbody");
  body.innerHTML = "";

  snap.forEach(d => {
    const t = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${t.name}<br><small>${t.time || ""}</small></td>
      ${["T2","T3","T4","T5","T6","T7","CN"]
        .map(day => `<td><input type="checkbox"></td>`).join("")}
      <td contenteditable></td>
      ${location.pathname.includes("admin") 
        ? `<td><button onclick="del('${d.id}')">X</button></td>` 
        : ""}
    `;
    body.appendChild(tr);
  });
});

window.del = async id => {
  if(confirm("Xóa công việc?")) {
    await deleteDoc(doc(db, "tasks", id));
  }
};
