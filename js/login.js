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

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  botao.disabled = true;
  mensagem.textContent = "Entrando...";
  mensagem.style.color = "black";

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, senha);
    const uid = userCred.user.uid;

    const snapshot = await get(ref(db, 'usuarios/' + uid));
    const dados = snapshot.val();

    if (!dados || !dados.role) {
      mensagem.textContent = "Usuário sem função definida.";
      mensagem.style.color = "red";
      await auth.signOut();
      botao.disabled = false;
      return;
    }

    if (dados.role === "admin") {
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 500);
    } else if (dados.role === "tecnico") {
      setTimeout(() => {
        window.location.href = "tecnico.html";
      }, 500);
    } else {
      mensagem.textContent = "Função inválida.";
      mensagem.style.color = "red";
      await auth.signOut();
      botao.disabled = false;
    }
  } catch (error) {
    mensagem.textContent = "Erro ao fazer login: " + error.message;
    mensagem.style.color = "red";
    botao.disabled = false;
  }
});
