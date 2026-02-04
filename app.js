console.log("APP.JS ĐÃ CHẠY");

const btn = document.getElementById("addTaskBtn");
const input = document.getElementById("taskInput");
const table = document.getElementById("taskTable");

btn.addEventListener("click", () => {
  const task = input.value.trim();
  if (!task) return alert("Chưa nhập nhiệm vụ");

  // tìm ô trống đầu tiên
  const cells = table.querySelectorAll("td");
  for (let cell of cells) {
    if (cell.innerHTML === "") {
      cell.innerHTML = `
        ${task}
        <br>
        <button onclick="this.parentElement.innerHTML=''">❌</button>
        <button onclick="this.parentElement.style.opacity='0.4'">✔</button>
      `;
      input.value = "";
      return;
    }
  }

  alert("Bảng đã đầy");
});
