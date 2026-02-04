import { doc, getDoc, updateDoc } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const id = new URLSearchParams(window.location.search).get("id");

const ref = doc(db, "employees", id);
const snap = await getDoc(ref);
const data = snap.data();

const container = document.getElementById("tasks");

Object.entries(data.tasks).forEach(([day, t]) => {
  let html = `<h3>${day.toUpperCase()} – ${t.title}</h3><ul>`;
  t.checklist.forEach((c, i) => {
    html += `
      <li>
        <input type="checkbox" ${c.done ? "checked" : ""}
          onchange="toggle('${day}', ${i}, this.checked)">
        ${c.text} ${c.time ? `(${c.time})` : ""}
      </li>`;
  });
  html += "</ul>";
  container.innerHTML += html;
});
