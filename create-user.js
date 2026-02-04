window.createUser = async function () {
  const username = document.getElementById("newUser").value.trim();
  const password = document.getElementById("newPass").value;
  const role = document.getElementById("role").value;

  if (!username || !password) {
    alert("Nhập đủ thông tin");
    return;
  }

  await setDoc(doc(db, "users", username), {
    password,
    role
  });

  alert("Tạo tài khoản thành công");
};
