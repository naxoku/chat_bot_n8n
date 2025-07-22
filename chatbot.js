const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");
const modeToggle = document.getElementById("modeToggle");
const chatbotToggle = document.getElementById("chatbotToggle"); // Botón flotante
const chatWidget = document.getElementById("chatWidget"); // Contenedor del widget
const navbar = document.querySelector('.navbar');
const chatInputArea = document.querySelector('.chat-input-area');

// Helper function para aplicar/remover clases de modo oscuro a los elementos del chat
function applyChatDarkMode(isDarkModeEnabled) {
  if (chatWidget.classList.contains('is-open')) { // Solo aplicar si el chat está abierto
    chatWidget.classList.toggle("dark-mode", isDarkModeEnabled);
    chatContainer.classList.toggle("dark-mode", isDarkModeEnabled);
    // Aplicar a los mensajes ya existentes
    document.querySelectorAll('.notification.is-primary').forEach(msg => msg.classList.toggle('dark-mode', isDarkModeEnabled));
    document.querySelectorAll('.notification.is-info').forEach(msg => msg.classList.toggle('dark-mode', isDarkModeEnabled));
    document.querySelectorAll('.notification.is-danger').forEach(msg => msg.classList.toggle('dark-mode', isDarkModeEnabled));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".navbar-burger");
  const menu = document.getElementById(burger.dataset.target);
  if (burger && menu) { // Asegurarse de que existen antes de agregar el listener
    burger.addEventListener("click", () => {
      burger.classList.toggle("is-active");
      menu.classList.toggle("is-active");
    });
  }

  // Inicializa historial si no existe
  if (!sessionStorage.getItem("historial")) {
    sessionStorage.setItem("historial", JSON.stringify([]));
  }

  // Cargar preferencia de modo oscuro al cargar la página
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "enabled") {
    document.documentElement.classList.add("dark-mode");
    document.body.classList.add("dark-mode");
    navbar.classList.add("dark-mode");
    chatInputArea.classList.add("dark-mode");
    modeToggle.innerHTML = '<span class="icon is-large"><i class="fas fa-sun"></i></span>'; // Cambiar a sol
  }

  // Cargar preferencia de estado del chatbot (abierto/cerrado)
  const savedChatState = localStorage.getItem("chatOpen");
  if (savedChatState === "open") {
    chatWidget.classList.add("is-open");
    chatbotToggle.innerHTML = '<span class="icon"><i class="fas fa-times"></i></span>'; // Icono de cerrar
    applyChatDarkMode(document.documentElement.classList.contains('dark-mode')); // Aplicar modo oscuro si ya estaba activo
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll al final
  } else {
    chatbotToggle.innerHTML = '<span class="icon"><i class="fas fa-comment-dots"></i></span>'; // Icono de chat
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
  navbar.classList.toggle("dark-mode");
  chatInputArea.classList.toggle("dark-mode");

  applyChatDarkMode(isDarkMode); // Aplicar/remover modo oscuro de los elementos del chat

  // Cambiar el ícono del botón
  if (isDarkMode) {
    modeToggle.innerHTML = '<span class="icon is-large"><i class="fas fa-sun"></i></span>'; // Sol
    localStorage.setItem("darkMode", "enabled"); // Guardar preferencia
  } else {
    modeToggle.innerHTML = '<span class="icon is-large"><i class="fas fa-moon"></i></span>'; // Luna
    localStorage.setItem("darkMode", "disabled"); // Guardar preferencia
  }
});

// Lógica para alternar el chatbot plegable
chatbotToggle.addEventListener("click", () => {
  const isOpen = chatWidget.classList.toggle("is-open");
  if (isOpen) {
    chatbotToggle.innerHTML = '<span class="icon"><i class="fas fa-times"></i></span>'; // Icono de cerrar
    localStorage.setItem("chatOpen", "open");
    applyChatDarkMode(document.documentElement.classList.contains('dark-mode')); // Aplicar modo oscuro al abrir
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll al final
  } else {
    chatbotToggle.innerHTML = '<span class="icon"><i class="fas fa-comment-dots"></i></span>'; // Icono de chat
    localStorage.setItem("chatOpen", "closed");
    applyChatDarkMode(false); // Remover modo oscuro al cerrar
  }
});

// NUEVA FUNCIÓN: Formatea el texto plano del bot a HTML (respetando saltos de línea y listas)
function formatBotResponseAsHtml(text) {
    // Primero, escapa caracteres HTML para prevenir XSS y asegurar que el texto sea seguro
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Divide el texto en párrafos usando doble salto de línea
    const paragraphs = html.split('\n\n');
    let formattedHtml = [];

    paragraphs.forEach(paragraph => {
        // Si el párrafo es una lista (empieza con un guion), lo procesa como lista
        if (paragraph.trim().startsWith('- ')) {
            const listItems = paragraph.split('\n').map(line => {
                if (line.trim().startsWith('- ')) {
                    return '<li>' + line.trim().substring(2).trim() + '</li>';
                }
                return ''; // Ignora líneas que no son ítems de lista dentro de un bloque de lista
            }).filter(item => item !== '').join(''); // Filtra vacíos
            if (listItems) {
                formattedHtml.push('<ul>' + listItems + '</ul>');
            }
        } else {
            // Si no es una lista, lo procesa como párrafo normal, reemplazando saltos de línea simples por <br>
            const pContent = paragraph.replace(/\n/g, '<br>').trim();
            if (pContent) { // Solo si no está vacío
                formattedHtml.push('<p>' + pContent + '</p>');
            }
        }
    });

    return formattedHtml.join('');
}


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
  userMessage.textContent = mensaje; // El mensaje del usuario sigue siendo texto plano
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
  // CAMBIO AQUI: Usar la URL de producción para el webhook
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
      // Usar innerHTML y la función para formatear la respuesta del bot
      botMessage.innerHTML = formatBotResponseAsHtml(respuesta);
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
