import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Config Firebase
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

const form = document.getElementById('registro-form');
const mensagem = document.getElementById('mensagem');
const botao = form.querySelector('button');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  botao.disabled = true;
  mensagem.textContent = "";
  mensagem.style.color = "";

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const role = document.getElementById('role').value;

  try {
    // Cria usuário com email e senha
    const userCred = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = userCred.user.uid;

    // Salva a função no Realtime Database
    await set(ref(db, 'usuarios/' + uid), {
      email,
      role
    });

    mensagem.textContent = `Usuário ${email} registrado com sucesso como ${role}.`;
    mensagem.style.color = "green";
    form.reset();

  } catch (error) {
    mensagem.textContent = "Erro: " + error.message;
    mensagem.style.color = "red";
  } finally {
    botao.disabled = false;
  }
});
