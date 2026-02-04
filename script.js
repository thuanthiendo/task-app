let data = JSON.parse(localStorage.getItem("tasks")) || {};

const days = ["2", "3", "4", "5", "6", "7"];

function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  Object.keys(data).forEach(name => {
    const tr = document.createElement("tr");

    // cột tên
    const nameTd = document.createElement("td");
    nameTd.textContent = name;
    tr.appendChild(nameTd);

    // các ngày
    days.forEach(d => {
      const td = document.createElement("td");
      (data[name][d] || []).forEach(t => {
        const div = document.createElement("div");
        div.className = "task";
        div.textContent = t;
        td.appendChild(div);
      });
      tr.appendChild(td);
    });

    // ghi chú
    const noteTd = document.createElement("td");
    noteTd.textContent = "Đang làm";
    tr.appendChild(noteTd);

    tbody.appendChild(tr);
  });
}

function addTask() {
  const name = document.getElementById("name").value.trim();
  const day = document.getElementById("day").value;
  const task = document.getElementById("task").value.trim();

  if (!name || !task) {
    alert("Nhập đủ tên và nhiệm vụ");
    return;
  }

  if (!data[name]) data[name] = {};
  if (!data[name][day]) data[name][day] = [];

  data[name][day].push(task);

  localStorage.setItem("tasks", JSON.stringify(data));

  document.getElementById("task").value = "";
  renderTable();
}

// hiển thị bảng ngay khi mở trang
renderTable();
