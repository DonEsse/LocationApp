import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const tabela = document.getElementById('tabela');
const busca = document.getElementById('busca');
const logoutBtn = document.getElementById('logout');
const contador = document.getElementById('contador');


let todasLocalizacoes = [];
let quantidadeMostrada = 10;
let termoBusca = "";

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

onAuthStateChanged(auth, async user => {
  if (!user) {
    console.log('Usuário não está logado, redirecionando...');
    window.location.href = 'login.html';
    return;
  }

  try {
    const userSnapshot = await get(ref(db, 'usuarios/' + user.uid));
    const userData = userSnapshot.val();

    if (!userData || userData.role !== 'tecnico') {
      alert('Acesso negado. Você não é técnico.');
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }

    carregarLocalizacoes();
  } catch (error) {
    console.error('Erro ao verificar dados do usuário:', error);
  }
});

function carregarLocalizacoes() {
  onValue(ref(db, "localizacoes"), (snapshot) => {
    const dados = [];
    snapshot.forEach((child) => {
      dados.push({ key: child.key, ...child.val() });
    });

    todasLocalizacoes = dados.reverse(); // mais recentes primeiro
    quantidadeMostrada = 10;
    atualizarTabela();
  }, { onlyOnce: false });
}

function atualizarTabela() {
  let dadosFiltrados = todasLocalizacoes;

  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    dadosFiltrados = todasLocalizacoes.filter(item =>
      (item.cliente || "").toLowerCase().includes(termo) ||
      (item.conta || "").toLowerCase().includes(termo) ||
      (item.os || "").toLowerCase().includes(termo)
    );
  }

  const dadosExibidos = dadosFiltrados.slice(0, quantidadeMostrada);
  tabela.innerHTML = "";

  dadosExibidos.forEach(({ key, cliente, conta, os, localizacao }) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${cliente}</td>
      <td>${conta}</td>
      <td>${os}</td>
      <td><a href="${localizacao}" target="_blank" rel="noopener noreferrer">Abrir Localização</a></td>
    `;
    tabela.appendChild(linha);
  });

  contador.textContent = `Exibindo ${dadosExibidos.length} de ${todasLocalizacoes.length} localizações cadastradas.`;
}

const buscarComDebounce = debounce(() => {
  termoBusca = busca.value.trim();
  quantidadeMostrada = 10;
  atualizarTabela();
}, 300);

busca.addEventListener("input", buscarComDebounce);

document.getElementById("carregar-mais").addEventListener("click", () => {
  quantidadeMostrada += 10;
  atualizarTabela();
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

