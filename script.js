const USERS = {
  admin: { password: "123", role: "admin", name: "Admin" },
  emp1: { password: "123", role: "employee", name: "Thiên" },
  emp2: { password: "123", role: "employee", name: "Nhân viên 2" }
};

function login() {
  const u = username.value;
  const p = password.value;

  if (!USERS[u] || USERS[u].password !== p) {
    alert("Tài khoản không tồn tại");
    return;
  }

  localStorage.setItem("user", JSON.stringify(USERS[u]));

  location.href = USERS[u].role === "admin"
    ? "admin.html"
    : "employee.html";
}

function logout() {
  localStorage.clear();
  location.href = "index.html";
}
