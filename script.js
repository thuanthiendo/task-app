document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // tài khoản admin cứng
    if (email === "admin@gmail.com" && password === "123456") {
      alert("Đăng nhập thành công!");
      localStorage.setItem("login", "true");
      window.location.href = "task.html";
    } else {
      alert("Sai email hoặc mật khẩu");
    }
  });
});
