alert("JS ĐÃ CHẠY");

// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc,
  onSnapshot, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= DOM =================
const addBtn = document.getElementById("addTaskBtn");
const taskName = document.getElementById("taskName");
const taskDay = document.getElementById("taskDay");

// 🔥 FIX LỖI: KIỂM TRA NÚT CÓ TỒN TẠI KHÔNG
console.log("Button:", addBtn);

// ================= ADD TASK =================
addBtn.addEventListener("click", async () => {
  if (!taskName.value) {
    alert("Chưa nhập nhiệm vụ");
    return;
  }

  await addDoc(collection(db, "tasks"), {
    name: taskName.value,
    day: taskDay.value,
    done: false
  });

  taskName.value = "";
});

// ================= LOAD REALTIME =================
const cells = document.querySelectorAll("td[data-day]");

onSnapshot(collection(db, "tasks"), (snapshot) => {
  cells.forEach(c => c.innerHTML = "");

  snapshot.forEach(docSnap => {
    const task = docSnap.data();
    const cell = document.querySelector(`td[data-day="${task.day}"]`);

    const div = document.createElement("div");
    div.className = "task" + (task.done ? " done" : "");
    div.innerHTML = `
      ${task.name}
      <br>
      <button class="doneBtn">✔</button>
      <button class="delBtn">❌</button>
    `;

    div.querySelector(".doneBtn").onclick = () =>
      updateDoc(doc(db, "tasks", docSnap.id), { done: !task.done });

    div.querySelector(".delBtn").onclick = () =>
      deleteDoc(doc(db, "tasks", docSnap.id));

    cell.appendChild(div);
  });
});
