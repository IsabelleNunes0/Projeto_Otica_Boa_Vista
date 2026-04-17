import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import app from "./firebase.js";

const auth = getAuth(app);

window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login OK!");
    window.location.href = "admin.html";
  } catch (e) {
    alert("Erro: " + e.message);
  }
};