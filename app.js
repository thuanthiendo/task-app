<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzg8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413",
  storageBucket: "task-75413.firebasestorage.app",
  messagingSenderId: "934934617374",
  appId: "1:934934617374:web:71ed6700a713351a72fd0f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const uid = res.user.uid;

    // 🔥 LẤY USER THEO UID
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Không tìm thấy user trong database");
      return;
    }

    const role = userSnap.data().role;

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "employee.html";
    }

  } catch (err) {
    alert(err.message);
  }
};
</script>
