const params = new URLSearchParams(window.location.search);
const myName = params.get("name");

const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const list = document.getElementById("list");

if (!myName) {
  list.innerHTML = "❌ Thiếu tên nhân viên trong link";
} else {
  const myTasks = tasks.filter(t => t.name === myName);

  if (myTasks.length === 0) {
    list.innerHTML = "📭 Chưa có nhiệm vụ";
  } else {
    myTasks.forEach(t => {
      list.innerHTML += `
        <p>
          <b>${t.day}</b>: ${t.task}<br>
          <small>⏰ ${t.time}</small>
        </p>
        <hr>
      `;
    });
  }
}
