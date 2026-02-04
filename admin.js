import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const taskList = document.getElementById("taskList");

window.createTask = async function () {
  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const assignedTo = document.getElementById("employee").value;

  await addDoc(collection(db, "tasks"), {
    title,
    description: desc,
    assignedTo,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("Đã tạo công việc");
  loadTasks();
};

async function loadTasks() {
  taskList.innerHTML = "";
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  snap.forEach(doc => {
    const t = doc.data();
    const li = document.createElement("li");
    li.textContent = `${t.title} → ${t.assignedTo} (${t.status})`;
    taskList.appendChild(li);
  });
}

loadTasks();
