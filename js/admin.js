import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

// Função debounce
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const conteudo = document.getElementById("conteudo");
onAuthStateChanged(auth, (user) => {
  if (user) {
    conteudo.style.display = "block";
  } else {
    window.location.href = "index.html";
  }
});

// Cadastro de técnicos
const registroForm = document.getElementById("registro-tecnico-form");
registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email-tecnico").value;
  const senha = document.getElementById("senha-tecnico").value;
  const msg = document.getElementById("msg-registro");

  try {
    const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
    msg.textContent = "Técnico cadastrado com sucesso!";
    const uid = credenciais.user.uid;
    await fetch(`https://locationapplemar-default-rtdb.firebaseio.com/usuarios/${uid}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funcao: "tecnico" })
    });
    registroForm.reset();
  } catch (erro) {
    msg.textContent = "Erro ao cadastrar técnico: " + erro.message;
    console.error("Erro no cadastro:", erro);
  }
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).catch(console.error);
});

const form = document.getElementById("form");
const tabela = document.getElementById("tabela");
const busca = document.getElementById("busca");

let todasLocalizacoes = [];
let quantidadeMostrada = 10;
let editKey = null;

// Botão cancelar edição
const btnCancelarEdicao = document.createElement("button");
btnCancelarEdicao.type = "button";
btnCancelarEdicao.textContent = "Cancelar edição";
btnCancelarEdicao.style.marginLeft = "10px";
btnCancelarEdicao.style.display = "none";
form.querySelector("button[type=submit]").insertAdjacentElement("afterend", btnCancelarEdicao);

btnCancelarEdicao.addEventListener("click", () => {
  editKey = null;
  form.reset();
  form.querySelector("button[type=submit]").textContent = "Enviar";
  btnCancelarEdicao.style.display = "none";
});

// Carrega e armazena todos os dados
function carregarLocalizacoes() {
  onValue(ref(db, "localizacoes"), (snapshot) => {
    const dados = [];
    snapshot.forEach((child) => {
      dados.push({ key: child.key, ...child.val() });
    });

    todasLocalizacoes = dados.reverse();
    exibirNaTabela(todasLocalizacoes.slice(0, quantidadeMostrada));
  }, { onlyOnce: false });
}

function exibirNaTabela(dados) {
  tabela.innerHTML = "";
  dados.forEach(({ key, cliente, conta, os, localizacao }) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${cliente}</td>
      <td>${conta}</td>
      <td>${os}</td>
      <td><a href="${localizacao}" target="_blank" rel="noopener noreferrer">Abrir Localização</a></td>
      <td>
        <button onclick="editarLocalizacao('${key}', '${cliente}', '${conta}', '${os}', '${localizacao}')">Editar</button>
        <button onclick="excluirLocalizacao('${key}')">Excluir</button>
      </td>
    `;
    tabela.appendChild(linha);
  });
}

document.getElementById("carregar-mais").addEventListener("click", () => {
  quantidadeMostrada += 10;
  exibirNaTabela(todasLocalizacoes.slice(0, quantidadeMostrada));
});

// Busca com debounce (500ms)
busca.addEventListener("input", debounce(async () => {
  const termo = busca.value.toLowerCase();

  try {
    const snapshot = await get(ref(db, "localizacoes"));
    const resultados = [];

    snapshot.forEach((child) => {
      const { cliente = "", conta = "", os = "", localizacao = "" } = child.val();
      if (
        cliente.toLowerCase().includes(termo) ||
        conta.toLowerCase().includes(termo) ||
        os.toLowerCase().includes(termo)
      ) {
        resultados.push({ key: child.key, cliente, conta, os, localizacao });
      }
    });

    exibirNaTabela(resultados);
  } catch (error) {
    console.error("Erro ao buscar:", error);
  }
}, 500)); // <- tempo em milissegundos

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const cliente = document.getElementById("cliente").value.trim();
  const conta = document.getElementById("conta").value.trim();
  const os = document.getElementById("os").value.trim();
  const localizacao = document.getElementById("localizacao").value.trim();

  const localizacoesRef = ref(db, "localizacoes");

  get(localizacoesRef).then((snapshot) => {
    let duplicada = false;
    snapshot.forEach((child) => {
      if (child.val().conta === conta && child.key !== editKey) {
        duplicada = true;
      }
    });

    if (duplicada) {
      alert("Essa Conta já está cadastrada.");
      return;
    }

    if (editKey) {
      const updates = {};
      updates[`localizacoes/${editKey}`] = { cliente, conta, os, localizacao };
      update(ref(db), updates)
        .then(() => {
          alert("Localização atualizada com sucesso.");
          form.reset();
          editKey = null;
          form.querySelector("button[type=submit]").textContent = "Enviar";
          btnCancelarEdicao.style.display = "none";
        })
        .catch((error) => alert("Erro ao atualizar: " + error.message));
    } else {
      push(localizacoesRef, { cliente, conta, os, localizacao });
      form.reset();
    }
  }).catch(err => console.error("Erro ao obter localizações:", err));
});

window.editarLocalizacao = (key, cliente, conta, os, localizacao) => {
  document.getElementById("cliente").value = cliente;
  document.getElementById("conta").value = conta;
  document.getElementById("os").value = os;
  document.getElementById("localizacao").value = localizacao;

  editKey = key;
  form.querySelector("button[type=submit]").textContent = "Atualizar";
  btnCancelarEdicao.style.display = "inline-block";
};

window.excluirLocalizacao = (key) => {
  if (confirm("Deseja excluir esta localização?")) {
    remove(ref(db, `localizacoes/${key}`))
      .then(() => alert("Localização excluída com sucesso."))
      .catch((error) => alert("Erro ao excluir localização: " + error.message));
  }
};

// Toggle menu admin
const toggle = document.getElementById("toggle-admin-section");
const adminSection = document.getElementById("admin-section");
if (toggle && adminSection) {
  toggle.addEventListener("click", () => {
    adminSection.style.display = adminSection.style.display === "none" ? "block" : "none";
  });
}

carregarLocalizacoes();
