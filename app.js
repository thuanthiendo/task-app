// ===== DANH SÁCH TÀI KHOẢN =====
const USERS = [
  {
    username: "admin",
    password: "123456",
    role: "admin"
  },
  {
    username: "thuanthien",
    password: "111111",
    role: "employee"
  },
  {
    username: "duykhang",
    password: "111111",
    role: "employee"
  }
];

// ===== LOGIN =====
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = USERS.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    alert("Sai tên đăng nhập hoặc mật khẩu");
    return;
  }

  // lưu session (để refresh không văng)
  sessionStorage.setItem("role", user.role);
  sessionStorage.setItem("username", user.username);

  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "employee.html";
  }
}
