const chatContainer = document.getElementById("chat");
const mensajeInput = document.getElementById("mensajeInput");
const enviarBtn = document.getElementById("enviarBtn");

enviarBtn.addEventListener("click", () => {
  const mensaje = mensajeInput.value.trim();
  if (mensaje === "") return;

  // Mostrar mensaje del usuario
  const userMessage = document.createElement("div");
  userMessage.classList.add("message", "user");
  userMessage.textContent = mensaje;
  chatContainer.appendChild(userMessage);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  mensajeInput.value = "";

  // Fecha y hora actual
  const fecha = new Date().toLocaleDateString("es-CL");
  const hora = new Date().toLocaleTimeString("es-CL");

  // Envía el mensaje al webhook de n8n
  // fetch("https://skynet.uct.cl/webhook-test/chat", {
  fetch("https://skynet.uct.cl/webhook/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pregunta: mensaje,
      fecha: fecha,
      hora: hora,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // data debe tener la propiedad "respuesta"
      const respuesta = data.respuesta || "No hay respuesta disponible.";

      // Muestra la respuesta del bot
      const botMessage = document.createElement("div");
      botMessage.classList.add("message", "has-background-light", "p-2");
      botMessage.textContent = respuesta;
      chatContainer.appendChild(botMessage);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    })
    .catch((err) => {
      console.error("Error:", err);
      const errorMessage = document.createElement("div");
      errorMessage.classList.add("message", "has-background-danger", "p-2");
      errorMessage.textContent = "Error al conectar con el servidor.";
      chatContainer.appendChild(errorMessage);
    });
});
