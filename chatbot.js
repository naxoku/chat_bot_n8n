const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById(burger.dataset.target);
  burger.addEventListener("click", () => {
    burger.classList.toggle("is-active");
    menu.classList.toggle("is-active");
  });

  // Inicializa historial si no existe
  if (!sessionStorage.getItem("historial")) {
    sessionStorage.setItem("historial", JSON.stringify([]));
  }
});

// Permitir enviar con Enter
mensajeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    enviarMensaje();
  }
});

enviarBtn.addEventListener("click", enviarMensaje);

function enviarMensaje() {
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return;

  const fecha = new Date().toLocaleDateString("es-CL");
  const hora = new Date().toLocaleTimeString("es-CL");

  // Mostrar mensaje del usuario
  const userWrapper = document.createElement("div");
  userWrapper.classList.add("message-wrapper", "user");

  const userMessage = document.createElement("div");
  userMessage.classList.add("notification", "is-primary");
  userMessage.style.maxWidth = "70%";
  userMessage.textContent = mensaje;

  userWrapper.appendChild(userMessage);
  chatContainer.appendChild(userWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  mensajeInput.value = "";

  // 🧠 Cargar historial actual
  const historial = JSON.parse(sessionStorage.getItem("historial"));

  // Agregar mensaje del usuario al historial
  historial.push({ role: "user", content: mensaje });

  // Enviar todo al backend
  fetch("https://skynet.uct.cl/webhook/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: mensaje, fecha, hora, historial }),
  })
    .then((res) => res.json())
    .then((data) => {
      const respuesta = data.respuesta || "No hay respuesta disponible.";

      const botWrapper = document.createElement("div");
      botWrapper.classList.add("message-wrapper");

      const botMessage = document.createElement("div");
      botMessage.classList.add("notification", "is-info");
      botMessage.style.maxWidth = "70%";
      botMessage.textContent = respuesta;

      botWrapper.appendChild(botMessage);
      chatContainer.appendChild(botWrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // ✅ Agregar respuesta del bot al historial
      historial.push({ role: "bot", content: respuesta });
      sessionStorage.setItem("historial", JSON.stringify(historial));
    })
    .catch((err) => {
      console.error("Error:", err);
      const errorWrapper = document.createElement("div");
      const errorMessage = document.createElement("div");

      errorWrapper.classList.add("message-wrapper");
      errorMessage.classList.add("notification", "is-danger");
      errorMessage.style.maxWidth = "70%";
      errorMessage.textContent = "Error al conectar con el servidor.";

      errorWrapper.appendChild(errorMessage);
      chatContainer.appendChild(errorWrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}
