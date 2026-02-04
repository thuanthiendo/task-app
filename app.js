const users = [
  { username: "admin", password: "123456", role: "admin" },
  { username: "emp1", password: "123456", role: "employee" }
];

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    alert("Tài khoản hoặc mật khẩu không đúng");
    return;
  }

  // Lưu session
  localStorage.setItem("user", JSON.stringify(user));

  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "employee.html";
  }
}
