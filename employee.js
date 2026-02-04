import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const user = JSON.parse(localStorage.getItem("currentUser"));
const taskList = document.getElementById("taskList");

async function loadMyTasks() {
  const q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", user.uid)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const t = doc.data();
    const li = document.createElement("li");
    li.textContent = `${t.title} - ${t.status}`;
    taskList.appendChild(li);
  });
}

loadMyTasks();
