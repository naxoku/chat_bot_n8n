const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");

// Menu contraible del navbar
document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById(burger.dataset.target);

  burger.addEventListener("click", () => {
    burger.classList.toggle("is-active");
    menu.classList.toggle("is-active");
  });
});

// Mensajes del chatbot
enviarBtn.addEventListener("click", () => {
  const mensaje = mensajeInput.value.trim();
  if (!mensaje) return;

  // Mensaje usuario
  const userMessage = document.createElement("div");
  userMessage.classList.add("notification", "is-primary", "ml-auto", "mb-3");
  userMessage.style.maxWidth = "70%"; // para no ocupar toda la línea
  userMessage.textContent = mensaje;
  chatContainer.appendChild(userMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  mensajeInput.value = "";

  // Fecha y hora
  const fecha = new Date().toLocaleDateString("es-CL");
  const hora = new Date().toLocaleTimeString("es-CL");

  // Petición POST al webhook de N8N
  fetch("https://skynet.uct.cl/webhook/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pregunta: mensaje, fecha, hora }),
  })
    .then((res) => res.json())
    .then((data) => {
      const respuesta = data.respuesta || "No hay respuesta disponible.";

      // Mensaje bot
      const botMessage = document.createElement("div");
      botMessage.classList.add("notification", "is-light", "mb-3");
      botMessage.style.maxWidth = "70%";
      botMessage.textContent = respuesta;
      chatContainer.appendChild(botMessage);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch((err) => {
      console.error("Error:", err);
      const errorMessage = document.createElement("div");
      errorMessage.classList.add("notification", "is-danger", "mb-3");
      errorMessage.style.maxWidth = "70%";
      errorMessage.textContent = "Error al conectar con el servidor.";
      chatContainer.appendChild(errorMessage);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
});
