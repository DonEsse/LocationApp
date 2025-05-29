import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfg_lRG34ys48oC0c656z8nD3RMSuG_7s",
  authDomain: "locationapplemar.firebaseapp.com",
  databaseURL: "https://locationapplemar-default-rtdb.firebaseio.com",
  projectId: "locationapplemar",
  storageBucket: "locationapplemar.appspot.com",
  messagingSenderId: "934968303323",
  appId: "1:934968303323:web:3799b63439697a88b776fe",
  measurementId: "G-Q3CP9QCQYY"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const form = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const senha = form.senha.value.trim();

  mensagem.textContent = "";

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;

    // Pega o role no database
    const snapshot = await get(ref(db, "usuarios/" + user.uid));
    const data = snapshot.val();

    if (!data || !data.role) {
      mensagem.style.color = "red";
      mensagem.textContent = "Usuário sem função definida. Contate o administrador.";
      return;
    }

    // Redireciona conforme role
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else if (data.role === "tecnico") {
      window.location.href = "tecnico.html";
    } else {
      mensagem.style.color = "red";
      mensagem.textContent = "Função do usuário inválida.";
    }
  } catch (error) {
    mensagem.style.color = "red";
    mensagem.textContent = "Erro: " + error.message;
  }
});

// Se o usuário já estiver logado, já redireciona automaticamente
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snapshot = await get(ref(db, "usuarios/" + user.uid));
    const data = snapshot.val();

    if (data?.role === "admin") {
      window.location.href = "admin.html";
    } else if (data?.role === "tecnico") {
      window.location.href = "tecnico.html";
    }
  }
});
