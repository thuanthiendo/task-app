import { db } from "./firebase.js";
import {
  collection,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.saveAll = async function () {
  const rows = document.querySelectorAll("#taskTable tbody tr");

  for (let row of rows) {
    const empId = row.dataset.id;
    const cells = row.querySelectorAll("input");

    const data = {
      employeeId: empId,
      employeeName: row.children[0].innerText,
      week: getWeek(),
      tasks: {
        mon: cells[0].value,
        tue: cells[1].value,
        wed: cells[2].value,
        thu: cells[3].value,
        fri: cells[4].value,
        sat: cells[5].value,
        sun: cells[6].value
      },
      note: cells[7].value
    };

    await setDoc(doc(db, "weekly_tasks", empId + "_" + data.week), data);
  }

  alert("Đã lưu phân công tuần");
};

function getWeek() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(),0,1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
  return `${d.getFullYear()}-W${week}`;
}
