<script>
const USERS = {
  admin: {
    password: "123456",
    role: "admin",
    name: "Admin"
  },
  emp1: {
    password: "123456",
    role: "employee",
    name: "Thiên"
  },
  emp2: {
    password: "123456",
    role: "employee",
    name: "Minh"
  }
};

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!USERS[user] || USERS[user].password !== pass) {
    alert("Tài khoản không tồn tại");
    return;
  }

  localStorage.setItem("user", JSON.stringify({
    username: user,
    role: USERS[user].role,
    name: USERS[user].name
  }));

  window.location.href =
    USERS[user].role === "admin" ? "admin.html" : "employee.html";
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function requireRole(role) {
  const u = JSON.parse(localStorage.getItem("user"));
  if (!u || u.role !== role) {
    window.location.href = "index.html";
  }
}
</script>
