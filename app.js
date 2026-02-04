import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
  storageBucket: "task-75413.appspot.com",
  messagingSenderId: "934934617374",
  appId: "1:934934617374:web:71ed6700a713351a72fd0f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const snap = await getDoc(doc(db, "users", uid));

    if (!snap.exists()) {
      alert("Không tìm thấy user trong database");
      return;
    }

    const role = snap.data().role;

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "employee.html";
    }

  } catch (err) {
    alert("Đăng nhập thất bại: " + err.message);
  }
});
