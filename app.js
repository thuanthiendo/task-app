console.log("APP JS ĐÃ LOAD");

const firebaseConfig = {
  apiKey: "AIzaSyB-ldnw85PPELY4SAbWEotRvmTLtzq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const email = document.getElementById("email");
const password = document.getElementById("password");

function login() {
  if (!email.value || !password.value) {
    alert("Nhập email và mật khẩu");
    return;
  }

  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(u => {
      if (u.user.email.includes("admin")) {
        location.href = "admin.html";
      } else {
        location.href = "employee.html";
      }
    })
    .catch(err => alert(err.message));
}
