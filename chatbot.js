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

  // Mensaje del usuario
  const userWrapper = document.createElement("div");
  userWrapper.classList.add("message-wrapper", "user");

  const userMessage = document.createElement("div");
  userMessage.classList.add("notification", "is-primary");
  userMessage.style.maxWidth = "70%";
  userMessage.textContent = mensaje;

  userWrapper.appendChild(userMessage);
  chatContainer.appendChild(userWrapper);

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

      const botWrapper = document.createElement("div");
      botWrapper.classList.add("message-wrapper");

      const botMessage = document.createElement("div");
      botMessage.classList.add("notification", "is-light");
      botMessage.style.maxWidth = "70%";
      botMessage.textContent = respuesta;

      botWrapper.appendChild(botMessage);
      chatContainer.appendChild(botWrapper);
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
