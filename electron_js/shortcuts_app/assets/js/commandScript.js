const { ipcRenderer } = require("electron");

// Set initial width for existing keyboard input fields
document.querySelectorAll(".keyboardInput").forEach(elem => {
    elem.style.width = "30px";
});

// Get command path input and set default desktop path
const commandPath = document.querySelector(".command-path");
ipcRenderer.invoke("get-desktop-path").then((path) => 
    commandPath.value = path
);

// Handle "+" button click to add a new shortcut key input
// Prevents form submission when clicking the button
document.querySelector(".addKey").addEventListener("click", (e) => {
  e.preventDefault();

  const container = document.querySelector(".shortcutContainer");
  const plus = document.createTextNode(" + ");
  const input = document.createElement("input");

  input.className = "form-control keyboardInput";
  input.required = true;
  input.style.width = "40px";

  // Capture key presses inside the new input
  input.addEventListener("keydown", handleKeydown);

  container.appendChild(plus);
  container.appendChild(input);
});

// Handle key press inside shortcut input fields
// Prevents normal typing and captures the pressed key
function handleKeydown(event) {
  event.preventDefault();
  event.target.value = event.key;
  event.target.style.width = `${event.key.length + 4}ch`;
}

// Attach keydown listener to existing shortcut inputs
document.querySelectorAll(".keyboardInput").forEach((input) => {
  input.addEventListener("keydown", handleKeydown);
});

// Handle form submission
// Collects shortcut keys and sends them to main process
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  const keys = [...document.querySelectorAll(".keyboardInput")]
    .map((i) => i.value)
    .filter(val => val)
    .join("+");

  const command = document.querySelector(".command").value.trim();
  const cwd = document.querySelector(".command-path").value.trim();

  // Validate data before sending
  if (keys && command && cwd) {
    console.log("Sending:", keys, command, cwd);
    ipcRenderer.send("addShortcutCommand", keys, command, cwd);
  }
});
