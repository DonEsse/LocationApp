import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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
    msg.textContent = "Técnico registrado com sucesso!";
    const uid = credenciais.user.uid;
    await fetch(`https://locationapplemar-default-rtdb.firebaseio.com/usuarios/${uid}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ funcao: "tecnico" })
    });
  } catch (erro) {
    msg.textContent = "Erro ao registrar técnico: " + erro.message;
  }
});

// Logout
const botaoLogout = document.getElementById("logout");
botaoLogout.addEventListener("click", () => {
  signOut(auth);
});

const form = document.getElementById("form");
const tabela = document.getElementById("tabela");
const busca = document.getElementById("busca");

let editKey = null; // Guarda a key da localização em edição

// Criar botão Cancelar edição dinamicamente e inserir no formulário
const btnCancelarEdicao = document.createElement("button");
btnCancelarEdicao.type = "button";
btnCancelarEdicao.textContent = "Cancelar edição";
btnCancelarEdicao.style.marginLeft = "10px";
form.querySelector("button[type=submit]").insertAdjacentElement("afterend", btnCancelarEdicao);

// Função cancelar edição
btnCancelarEdicao.addEventListener("click", () => {
  editKey = null;
  form.reset();
  form.querySelector("button[type=submit]").textContent = "Enviar";
  btnCancelarEdicao.style.display = "none";
});

// Função para carregar localizações na tabela
function carregarLocalizacoes() {
  onValue(ref(db, "localizacoes"), (snapshot) => {
    tabela.innerHTML = "";
    snapshot.forEach((child) => {
      const { cliente, os, localizacao } = child.val();
      const key = child.key;
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${cliente}</td>
        <td>${os}</td>
        <td><a href="${localizacao}" target="_blank">Abrir Localização</a></td>
        <td>
          <button onclick="editarLocalizacao('${key}', '${cliente}', '${os}', '${localizacao}')">Editar</button>
          <button onclick="excluirLocalizacao('${key}')">Excluir</button>
        </td>
      `;
      tabela.appendChild(linha);
    });
  });
}

carregarLocalizacoes();

// Filtro de busca
busca.addEventListener("input", () => {
  const termo = busca.value.toLowerCase();
  const linhas = tabela.querySelectorAll("tr");
  linhas.forEach((linha) => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termo) ? "" : "none";
  });
});

// Envio e atualização de localização com verificação de OS duplicada
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const cliente = document.getElementById("cliente").value.trim();
  const os = document.getElementById("os").value.trim();
  const localizacao = document.getElementById("localizacao").value.trim();

  const localizacoesRef = ref(db, "localizacoes");

  onValue(localizacoesRef, (snapshot) => {
    let duplicada = false;
    snapshot.forEach((child) => {
      if (child.val().os === os && child.key !== editKey) {
        duplicada = true;
      }
    });

    if (duplicada) {
      alert("Essa OS já está cadastrada.");
      return;
    }

    if (editKey) {
      // Atualiza localização existente
      const updates = {};
      updates[`localizacoes/${editKey}`] = { cliente, os, localizacao };
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
      // Adiciona nova localização
      push(localizacoesRef, { cliente, os, localizacao });
      form.reset();
    }
  }, { onlyOnce: true });
});

// Função para editar localização
window.editarLocalizacao = (key, cliente, os, localizacao) => {
  document.getElementById("cliente").value = cliente;
  document.getElementById("os").value = os;
  document.getElementById("localizacao").value = localizacao;

  editKey = key;
  form.querySelector("button[type=submit]").textContent = "Atualizar";
  btnCancelarEdicao.style.display = "inline-block";
};

// Função para excluir localização
window.excluirLocalizacao = (key) => {
  if (confirm("Deseja excluir esta localização?")) {
    remove(ref(db, `localizacoes/${key}`))
      .then(() => {
        alert("Localização excluída com sucesso.");
      })
      .catch((error) => {
        alert("Erro ao excluir localização: " + error.message);
      });
  }
};

// Toggle menu técnico
const toggle = document.getElementById("toggle-admin-section");
const adminSection = document.getElementById("admin-section");
toggle.addEventListener("click", () => {
  adminSection.style.display = adminSection.style.display === "none" ? "block" : "none";
});

// Esconde botão cancelar edição inicialmente
btnCancelarEdicao.style.display = "none";
