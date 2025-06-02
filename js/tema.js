const botaoTema = document.getElementById("toggle-tema");
const body = document.body;

function aplicarTema(tema) {
  if (tema === "dark") {
    body.classList.add("dark");
    botaoTema.textContent = "☀️";
  } else {
    body.classList.remove("dark");
    botaoTema.textContent = "🌙";
  }
}

// Verifica tema salvo
const temaSalvo = localStorage.getItem("tema") || "light";
aplicarTema(temaSalvo);

// Alterna o tema ao clicar
botaoTema?.addEventListener("click", () => {
  const novoTema = body.classList.contains("dark") ? "light" : "dark";
  aplicarTema(novoTema);
  localStorage.setItem("tema", novoTema);
});
