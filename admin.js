import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import app from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 PROTEÇÃO LOGIN
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    // GARANTE QUE O HTML JÁ CARREGOU
    setTimeout(() => {
      carregarAgendamentos();
    }, 300);
  }
});

// 🚪 LOGOUT
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

// 🔥 FUNÇÃO QUE BUSCA E MOSTRA OS DADOS
async function carregarAgendamentos() {

  const tabela = document.getElementById("tabela");

  if (!tabela) {
    console.log("❌ ERRO: tabela não encontrada no HTML");
    return;
  }

  console.log("📡 Buscando agendamentos...");

  try {

    const snapshot = await getDocs(collection(db, "agendamentos"));

    console.log("📊 Total encontrados:", snapshot.size);

    tabela.innerHTML = "";

    if (snapshot.empty) {
      tabela.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">
            Nenhum agendamento encontrado
          </td>
        </tr>
      `;
      return;
    }

    snapshot.forEach((doc) => {
      const d = doc.data();

      console.log(d);

      tabela.innerHTML += `
        <tr>
          <td>${d.nome || "-"}</td>
          <td>${d.data || "-"}</td>
          <td>${d.horario || "-"}</td>
          <td>${d.telefone || "-"}</td>
          <td>${d.primeiraConsulta || "-"}</td>
          <td>${d.observacoes || "-"}</td>
          <td>
            <span class="status status-agendado">
              ${d.status || "Agendado"}
            </span>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
  }
}