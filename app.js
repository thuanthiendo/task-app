console.log("APP.JS ĐÃ CHẠY");

const btn = document.getElementById("addTaskBtn");
const nameInput = document.getElementById("nameInput");
const taskInput = document.getElementById("taskInput");
const daySelect = document.getElementById("daySelect");
const table = document.getElementById("taskTable");

btn.onclick = () => {
  const name = nameInput.value.trim();
  const task = taskInput.value.trim();
  const day = Number(daySelect.value);

  if (!name || !task) {
    alert("Nhập đủ tên và nhiệm vụ");
    return;
  }

  const rows = table.querySelectorAll("tr");

  for (let row of rows) {
    const cell = row.children[day];
    if (cell.innerHTML === "") {
      cell.innerHTML = `
        <b>${name}</b><br>
        ${task}<br>
        <button onclick="this.parentElement.style.opacity='0.4'">✔</button>
        <button onclick="this.parentElement.innerHTML=''">❌</button>
      `;
      taskInput.value = "";
      return;
    }
  }

  alert("Cột này đã đầy");
};
