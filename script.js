const taskList = document.getElementById("taskList");

// Dữ liệu test
const tasks = [
  { title: "Làm báo cáo", assignee: "Thiên", done: false },
  { title: "Fix bug", assignee: "Admin", done: true }
];

tasks.forEach(task => {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${task.title}</td>
    <td>${task.assignee}</td>
    <td>${task.done ? "✅ Xong" : "⏳ Chưa xong"}</td>
  `;

  taskList.appendChild(tr);
});
