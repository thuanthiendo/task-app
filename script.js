import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getFirestore, collection, getDocs } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  // 🔥 config của bạn
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadSchedule() {
  const snapshot = await getDocs(collection(db, "employees"));
  const tbody = document.getElementById("schedule");
  tbody.innerHTML = "";

  snapshot.forEach(doc => {
    const e = doc.data();
    const row = `
      <tr>
        <td><a href="task.html?id=${doc.id}">${e.name}</a></td>
        <td>${e.tasks?.mon?.title || ""}</td>
        <td>${e.tasks?.tue?.title || ""}</td>
        <td>${e.tasks?.wed?.title || ""}</td>
        <td>${e.tasks?.thu?.title || ""}</td>
        <td>${e.tasks?.fri?.title || ""}</td>
        <td>${e.tasks?.sat?.title || ""}</td>
        <td>${calcProgress(e.tasks)}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function calcProgress(tasks = {}) {
  let done = 0, total = 0;
  Object.values(tasks).forEach(day => {
    day.checklist?.forEach(c => {
      total++;
      if (c.done) done++;
    });
  });
  if (!total) return "";
  return `${done}/${total} (${Math.round(done/total*100)}%)`;
}

loadSchedule();
