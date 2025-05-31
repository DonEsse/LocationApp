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

// Config Firebase (igual aos outros arquivos)
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

const form = document.getElementById('form');
const tabela = document.getElementById('tabela');
const busca = document.getElementById('busca');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Usuário não logado, manda para login
    window.location.href = "login.html";
    return;
  }

  // Usuário logado, pega o role dele
  const uid = user.uid;
  const snapshot = await get(ref(db, 'usuarios/' + uid));
  const dados = snapshot.val();

  if (!dados || !dados.role) {
    alert('Usuário sem função definida. Faça login novamente.');
    await signOut(auth);
    window.location.href = "login.html";
    return;
  }

  // Redireciona para página correta se não estiver na dela
  const currentPage = window.location.pathname.split('/').pop();

  if (dados.role === 'admin') {
    if (currentPage !== 'admin.html' && currentPage !== 'index.html') {
      window.location.href = 'admin.html';
      return;
    }
  } else if (dados.role === 'tecnico') {
    if (currentPage !== 'tecnico.html' && currentPage !== 'index.html') {
      window.location.href = 'tecnico.html';
      return;
    }
  } else {
    alert('Função inválida. Faça login novamente.');
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  // Se chegou aqui, usuário está autenticado e autorizado para esta página
  // Pode continuar com a lógica normal do app (ex: manipular clientes)
  carregarClientes();

});

// Função de exemplo para carregar clientes no seu app (adaptar conforme seu backend)
function carregarClientes() {
  // Aqui você deve implementar o fetch dos clientes da sua fonte de dados
  // Por enquanto, apenas exemplo estático
  const clientesExemplo = [
    { cliente: "João", os: "123", localizacao: "https://maps.google.com/?q=loc1" },
    { cliente: "Maria", os: "456", localizacao: "https://maps.google.com/?q=loc2" },
  ];

  tabela.innerHTML = '';

  clientesExemplo.forEach(({ cliente, os, localizacao }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente}</td>
      <td>${os}</td>
      <td><a href="${localizacao}" target="_blank">Ver localização</a></td>
    `;
    tabela.appendChild(tr);
  });
}

// Busca simples por cliente ou OS
busca?.addEventListener('input', () => {
  const termo = busca.value.toLowerCase();
  Array.from(tabela.children).forEach(tr => {
    const cliente = tr.children[0].textContent.toLowerCase();
    const os = tr.children[1].textContent.toLowerCase();
    tr.style.display = (cliente.includes(termo) || os.includes(termo)) ? '' : 'none';
  });
});
