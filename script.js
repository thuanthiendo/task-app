const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  alert("Bạn chưa đăng nhập");
  window.location.href = "index.html";
}

const page = document.body.dataset.role;

if (page && user.role !== page) {
  alert("Không có quyền truy cập");
  window.location.href = "index.html";
}
