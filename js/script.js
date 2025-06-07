import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
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

// Autenticação e redirecionamento
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const uid = user.uid;
    const snapshot = await get(ref(db, 'usuarios/' + uid));
    const dados = snapshot.val();

    if (!dados?.role) {
      alert('Usuário sem função definida. Faça login novamente.');
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    const currentPage = window.location.pathname.split('/').pop();

    const redirecionamentos = {
      admin: 'admin.html',
      tecnico: 'tecnico.html'
    };

    const paginaEsperada = redirecionamentos[dados.role];

    if (!paginaEsperada) {
      alert('Função inválida. Faça login novamente.');
      await signOut(auth);
      window.location.href = 'login.html';
    } else if (currentPage !== paginaEsperada) {
      window.location.href = paginaEsperada;
    }

  } catch (error) {
    console.error('Erro na verificação do usuário:', error);
    alert('Erro na autenticação. Faça login novamente.');
    await signOut(auth);
    window.location.href = "login.html";
  }
});
