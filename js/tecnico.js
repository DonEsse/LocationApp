import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  child
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

// DOM elements
const tabela = document.getElementById("tabela");
const busca = document.getElementById("busca");
const contador = document.getElementById("contador");
const carregarMaisBtn = document.getElementById("carregarMaisBtn");
const loading = document.getElementById("loading");

// Estados
let dadosOriginal = [];
let limite = 10;
let offset = 0;

// Verifica login e busca dados
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    loading.style.display = "block";

    const snapshot = await get(child(ref(db), "localizacoes"));
    if (snapshot.exists()) {
      let dadosArray = Object.entries(snapshot.val()).map(([key, val]) => ({ key, ...val }));

      if (dadosArray.length > 0 && dadosArray[0].timestamp !== undefined) {
        dadosArray.sort((a, b) => b.timestamp - a.timestamp);
      } else {
        dadosArray.sort((a, b) => (a.key < b.key ? 1 : -1));
      }

      dadosOriginal = dadosArray;
      offset = 0;
      renderizarTabela();
    } else {
      tabela.innerHTML = '<tr><td colspan="3">Nenhum dado encontrado.</td></tr>';
      contador.textContent = '';
      carregarMaisBtn.style.display = 'none';
    }

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    alert("Erro ao carregar dados.");
  } finally {
    loading.style.display = "none";
  }
});

// Renderizar tabela paginada e com busca
function renderizarTabela() {
  const termo = busca.value.toLowerCase();

  const filtrados = dadosOriginal.filter((item) =>
    (item.cliente || '').toLowerCase().includes(termo) ||
    (item.os || '').toLowerCase().includes(termo)
  );

  const exibidos = filtrados.slice(0, offset + limite);

  tabela.innerHTML = exibidos.map((item) => `
    <tr>
      <td>${item.cliente || ''}</td>
      <td>${item.os || ''}</td>
      <td><a href="${item.link || '#'}" target="_blank" rel="noopener noreferrer">Ver Mapa</a></td>
    </tr>
  `).join("");

  carregarMaisBtn.style.display = exibidos.length < filtrados.length ? "block" : "none";

  contador.textContent = `Mostrando ${exibidos.length} de ${filtrados.length}`;
}

// Filtros
busca.addEventListener("input", () => {
  offset = 0;
  renderizarTabela();
});

// Paginação
carregarMaisBtn.addEventListener("click", () => {
  offset += limite;
  renderizarTabela();
});

// Logout
document.getElementById("logout")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
