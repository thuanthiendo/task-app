import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
  storageBucket: "task-75413.appspot.com",
  messagingSenderId: "934934617374",
  appId: "1:934934617374:web:71ed6700a713351a72fd0f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// LOGIN
window.login = async function () {
  const username = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const userRef = doc(db, "users", username);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    alert("Tài khoản không tồn tại");
    return;
  }

  if (snap.data().password !== password) {
    alert("Sai mật khẩu");
    return;
  }

  sessionStorage.setItem("role", snap.data().role);
  sessionStorage.setItem("username", username);

  if (snap.data().role === "admin") {
    location.href = "admin.html";
  } else {
    location.href = "employee.html";
  }
};
