import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, query, orderByChild, limitToFirst } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

onAuthStateChanged(auth, async user => {
  if (!user) {
    console.log('Usuário não está logado, redirecionando...');
    window.location.href = 'login.html';
    return;
  }

  console.log('Usuário logado:', user.uid);

  try {
    const userSnapshot = await get(ref(db, 'usuarios/' + user.uid));
    const userData = userSnapshot.val();

    if (!userData) {
      alert('Usuário sem dados no banco. Contate o administrador.');
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }

    if (userData.role !== 'tecnico') {
      alert('Acesso negado. Você não é técnico.');
      await signOut(auth);
      window.location.href = 'login.html';
      return;
    }

    console.log('Acesso liberado para técnico.');
    carregarLocalizacoes();
  } catch (error) {
    console.error('Erro ao verificar dados do usuário:', error);
  }
});

busca.addEventListener('input', () => {
  const termo = busca.value.toLowerCase();
  Array.from(tabela.children).forEach(tr => {
    const cliente = tr.children[0]?.textContent.toLowerCase() || '';
    const os = tr.children[1]?.textContent.toLowerCase() || '';
    tr.style.display = (cliente.includes(termo) || os.includes(termo)) ? '' : 'none';
  });
});

async function carregarLocalizacoes() {
  try {
    const localizacoesRef = ref(db, 'localizacoes');
    const q = query(localizacoesRef, orderByChild('criadoEm'), limitToFirst(10));
    const snapshot = await get(q);

    tabela.innerHTML = '';

    if (!snapshot.exists()) {
      tabela.innerHTML = `<tr><td colspan="3">Nenhuma localização encontrada.</td></tr>`;
      return;
    }

    snapshot.forEach(child => {
      const { cliente, os, localizacao } = child.val();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cliente}</td>
        <td>${os}</td>
        <td><a href="${localizacao}" target="_blank" rel="noopener noreferrer">Ver localização</a></td>
      `;
      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar localizações:', error);
  }
}

logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});
