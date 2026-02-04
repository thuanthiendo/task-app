const tbody = document.querySelector("#taskTable tbody");

function addTask() {
  const name = nameInput.value.trim();
  const taskText = taskInput.value.trim();
  const day = daySelect.value;

  if (!name || !taskText) return alert("Nhập đủ tên và nhiệm vụ");

  let row = [...tbody.rows].find(r => r.dataset.name === name);

  if (!row) {
    row = tbody.insertRow();
    row.dataset.name = name;

    for (let i = 0; i < 8; i++) row.insertCell();

    row.cells[0].innerText = name;
  }

  const cell = row.cells[day];
  const task = document.createElement("div");
  task.className = "task";
  task.innerHTML = `
    <span onclick="toggleDone(this)">${taskText}</span>
    <button onclick="this.parentElement.remove()">❌</button>
  `;

  cell.appendChild(task);
  taskInput.value = "";
}

function toggleDone(span) {
  span.parentElement.classList.toggle("done");
}
