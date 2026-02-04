const { ipcRenderer } = require("electron");

// Set initial width for existing keyboard input fields
document.querySelectorAll(".keyboardInput").forEach(elem => {
    elem.style.width = "30px";
});

// Handle key press inside shortcut input fields
// Prevents normal typing and captures the pressed key
function handleKeydown(event) {
    event.preventDefault();
    event.target.value = event.key;
    event.target.style.width = `${event.target.value.length + 4}ch`;
}

const addKeyButton = document.querySelector(".addKey");
const addShortcutForm = document.querySelector("form");
let filePath;

// Handle "+" button click to add a new shortcut key input
addKeyButton.addEventListener("click", () => {
    const shortcutContainer = document.querySelector(".shortcutContainer");
    const plusText = document.createTextNode(" + ");

    const newInput = document.createElement("input");
    newInput.classList.add("keyboardInput");
    newInput.classList.add("form-control");
    newInput.style.width = "30px";
    newInput.required = true;

    // Capture key presses in the new input
    newInput.addEventListener("keydown", (event) => {
        handleKeydown(event);
    });

    shortcutContainer.appendChild(plusText);
    shortcutContainer.appendChild(newInput);
});

// Attach keydown listener to existing shortcut inputs
document.querySelectorAll(".keyboardInput").forEach(input => {
    input.addEventListener("keydown", (event) => {
        handleKeydown(event);
    });
});

// Handle form submission
// Collects shortcut keys and creates a file shortcut
addShortcutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const shortcutKeys = document.querySelectorAll(".keyboardInput");
    const shortcutKeysArray = Array.from(shortcutKeys).map(input => input.value);

    console.log(shortcutKeysArray.join("+"));
    console.log(filePath);

    createShortcutFile(shortcutKeysArray, filePath);
    filePath = undefined;
});

// Handle program file selection button
const programFile = document.querySelector(".programFile");
programFile.addEventListener("click", () => {
    // Request file selection from main process
    ipcRenderer.send("upload-file");
});

// Receive selected file path from main process
ipcRenderer.on("file-path", (event, path) => {
    if (path) {
        filePath = path;
        programFile.classList.remove("btn-primary");
        programFile.classList.add("btn-success");
    }
});

// Create and register file shortcut
function createShortcutFile(shortcutKeysArray, filePath) {
    const shortcutFormula = shortcutKeysArray.join("+");
    console.log(shortcutFormula);

    // Send shortcut data to main process
    ipcRenderer.send("addShortcutFile", shortcutFormula, filePath);
}
