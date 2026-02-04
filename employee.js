import { db } from "./firebase.js";
import {
  collection, onSnapshot, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const user = JSON.parse(localStorage.getItem("user"));
const tasksRef = collection(db, "tasks");

onSnapshot(tasksRef, snap => {
  const tb = document.querySelector("tbody");
  tb.innerHTML = "";

  snap.forEach(d => {
    const t = d.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${t.user}</td>
      ${t.days.map((v,i)=>
        `<td><input type="checkbox" ${v?"checked":""}
         onchange="toggle('${d.id}',${i},this.checked)"></td>`
      ).join("")}
      <td>${t.note || ""}</td>
    `;
    tb.appendChild(tr);
  });
});

window.toggle = async (id, i, v) => {
  const ref = doc(db, "tasks", id);
  const t = (await getDoc(ref)).data();
  t.days[i] = v;
  await updateDoc(ref, { days: t.days });
};
