import { db } from "./firebase.js";
import {
  collection, addDoc, onSnapshot, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tasksRef = collection(db, "tasks");

window.addTask = async () => {
  const name = taskName.value;
  const user = assignee.value;

  await addDoc(tasksRef, {
    name,
    user,
    days: Array(7).fill(false),
    note: ""
  });
};

onSnapshot(tasksRef, snap => {
  const tb = document.querySelector("tbody");
  tb.innerHTML = "";

  snap.forEach(d => {
    const t = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${t.user}</td>
      ${t.days.map(v => `<td>${v ? "✔️" : ""}</td>`).join("")}
      <td>${t.note}</td>
      <td><button onclick="del('${d.id}')">❌</button></td>
    `;
    tb.appendChild(tr);
  });
});

window.del = async id => {
  if (confirm("Xóa công việc?")) {
    await deleteDoc(doc(db, "tasks", id));
  }
};
