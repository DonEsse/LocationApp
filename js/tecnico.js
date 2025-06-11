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

busca.addEventListener("input", () => {
  const termo = busca.value.toLowerCase();
  const linhas = tabela.querySelectorAll("tr");
  let visiveis = 0;
  linhas.forEach((linha) => {
    const texto = linha.textContent.toLowerCase();
    const visivel = texto.includes(termo);
    linha.style.display = visivel ? "" : "none";
    if (visivel) visiveis++;
  });
  contador.textContent = `Exibindo ${visiveis} de ${todasLocalizacoes.length} localizações cadastradas.`;
});

function carregarLocalizacoes() {
  onValue(ref(db, "localizacoes"), (snapshot) => {
    const dados = [];
    snapshot.forEach((child) => {
      dados.push({ key: child.key, ...child.val() });
    });

    tabela.innerHTML = "";
    dados.reverse(); // mais recentes primeiro

    todasLocalizacoes = dados;
    quantidadeMostrada = 10;
    atualizarTabela();
  }, { onlyOnce: false });
}

function atualizarTabela() {
  const dadosExibidos = todasLocalizacoes.slice(0, quantidadeMostrada);
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

document.getElementById("carregar-mais").addEventListener("click", () => {
  quantidadeMostrada += 10;
  atualizarTabela();
});

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});
