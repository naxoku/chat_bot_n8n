const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");
const modeToggle = document.getElementById("modeToggle"); // Nuevo: botón de modo oscuro

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

  // Cargar preferencia de modo oscuro al cargar la página
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "enabled") {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
    document.querySelector('.navbar').classList.add("dark-mode");
    document.querySelector('.chat-box-container').classList.add("dark-mode");
    document.querySelector('.chat-container').classList.add("dark-mode");
    document.querySelector('.chat-input-area').classList.add("dark-mode");
    modeToggle.innerHTML = '<span class="icon is-large"><i class="fas fa-sun"></i></span>'; // Cambiar a sol
  }
});

// Permitir enviar con Enter
mensajeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    enviarMensaje();
  }
});

enviarBtn.addEventListener("click", enviarMensaje);

// Lógica para alternar el modo oscuro
modeToggle.addEventListener("click", () => {
  const isDarkMode = document.documentElement.classList.toggle("dark-mode");
  document.body.classList.toggle("dark-mode");
  document.querySelector('.navbar').classList.toggle("dark-mode");
  document.querySelector('.chat-box-container').classList.toggle("dark-mode");
  document.querySelector('.chat-container').classList.toggle("dark-mode");
  document.querySelector('.chat-input-area').classList.toggle("dark-mode");

  // Cambiar el ícono del botón
  if (isDarkMode) {
    modeToggle.innerHTML = '<span class="icon is-large"><i class="fas fa-sun"></i></span>'; // Sol
    localStorage.setItem("darkMode", "enabled"); // Guardar preferencia
  } else {
    modeToggle.innerHTML = '<span class="icon is-large"><i class="fas fa-moon"></i></span>'; // Luna
    localStorage.setItem("darkMode", "disabled"); // Guardar preferencia
  }

  // Esto es para los mensajes que YA ESTÁN en el chat.
  // Es importante si el usuario cambia el modo con mensajes ya visibles.
  document.querySelectorAll('.notification.is-primary').forEach(msg => msg.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('.notification.is-info').forEach(msg => msg.classList.toggle('dark-mode', isDarkMode));
});


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
  // Añadir la clase dark-mode si está activado
  if (document.documentElement.classList.contains('dark-mode')) {
    userMessage.classList.add('dark-mode');
  }


  userWrapper.appendChild(userMessage);
  chatContainer.appendChild(userWrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  mensajeInput.value = "";

  // 🧠 Cargar historial actual
  const historial = JSON.parse(sessionStorage.getItem("historial"));

  // Agregar mensaje del usuario al historial
  historial.push({ role: "user", content: mensaje });

  // Enviar todo al backend
  fetch("https://skynet.uct.cl/webhook-test/chat", {
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
      // Añadir la clase dark-mode si está activado
      if (document.documentElement.classList.contains('dark-mode')) {
        botMessage.classList.add('dark-mode');
      }

      botWrapper.appendChild(botMessage);
      chatContainer.appendChild(botWrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch((err) => {
      console.error("Error:", err);
      const errorWrapper = document.createElement("div");
      const errorMessage = document.createElement("div");

      errorWrapper.classList.add("message-wrapper");
      errorMessage.classList.add("notification", "is-danger");
      errorMessage.style.maxWidth = "70%";
      errorMessage.textContent = "Error al conectar con el servidor.";
      // Añadir la clase dark-mode si está activado
      if (document.documentElement.classList.contains('dark-mode')) {
        errorMessage.classList.add('dark-mode');
      }

      errorWrapper.appendChild(errorMessage);
      chatContainer.appendChild(errorWrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}