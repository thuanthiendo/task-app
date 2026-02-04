console.log("APP.JS ĐÃ CHẠY");

const btn = document.getElementById("addTaskBtn");
const input = document.getElementById("taskInput");
const table = document.getElementById("taskTable");
const daySelect = document.getElementById("daySelect");

btn.addEventListener("click", () => {
  const task = input.value.trim();
  const day = Number(daySelect.value);

  if (!task) return alert("Chưa nhập nhiệm vụ");

  const rows = table.querySelectorAll("tr");

  for (let row of rows) {
    const cell = row.children[day];
    if (cell.innerHTML === "") {
      cell.innerHTML = `
        ${task}<br>
        <button onclick="this.parentElement.innerHTML=''">❌</button>
        <button onclick="this.parentElement.style.opacity='0.4'">✔</button>
      `;
      input.value = "";
      return;
    }
  }

  alert("Cột này đã đầy");
});
