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

// 🔥 FUNÇÃO QUE BUSCA E MOSTRA OS DADOS OTIMIZADA
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

    // 1️⃣ COLOCA OS DADOS EM UMA LISTA PARA PODER ORDENAR
    const listaAgendamentos = [];
    snapshot.forEach((doc) => {
      listaAgendamentos.push(doc.data());
    });

    // 2️⃣ ORDENA POR DATA E DEPOIS POR HORÁRIO (QUEM VAI PRIMEIRO)
    listaAgendamentos.sort((a, b) => {
      // Se as datas forem diferentes, ordena pela data
      if (a.data !== b.data) {
        return a.data.localeCompare(b.data);
      }
      // Se as datas forem iguais, desempata pelo horário
      return a.horario.localeCompare(b.horario);
    });

    // 3️⃣ GERA AS LINHAS DA TABELA JÁ COM A DATA FORMATADA
    listaAgendamentos.forEach((d) => {
      console.log(d);

      // Converte "2026-06-21" para "21/06/2026"
      let dataFormatada = "-";
      if (d.data && d.data.includes("-")) {
        const [ano, mes, dia] = d.data.split("-");
        dataFormatada = `${dia}/${mes}/${ano}`;
      } else if (d.data) {
        dataFormatada = d.data; // Mantém caso já esteja formatada por algum motivo
      }

      tabela.innerHTML += `
        <tr>
          <td>${d.nome || "-"}</td>
          <td>${dataFormatada}</td>
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
