const connection = require("./connection");
const { ipcRenderer } = require("electron");

const deleteAllBTN = document.querySelector(".command-shortcut .delete-all");
const addShortcutBTN = document.querySelector(".command-shortcut .new-shortcut");
const commandsShortcut = document.querySelector(".commandes-shortcut");

// Listen for delete event coming from main process
// Deletes a shortcut from the database only (no UI reload here)
ipcRenderer.on("delete-shortcut-command-DB", async (event, shortcut) => {
    try {
        await connection.remove({ 
            from: "CommandShortcuts",
            where: { shortcut: shortcut }
        });
        console.log(`Shortcut ${shortcut} deleted from database`);
    } catch (err) {
        console.error("Error deleting shortcut:", err);
    }            
});

// Function to display command shortcuts without re-registering them
async function showCommandsShortcut() {
    commandsShortcut.innerHTML = "";

    let shortcuts = [];
    try {
        // Fetch all shortcuts from the database
        shortcuts = await connection.select({ from: "CommandShortcuts" });
    } catch (err) {
        console.error("Error fetching shortcuts:", err);
        commandsShortcut.innerHTML = "<p class='no-shortcuts'>Failed to load shortcuts</p>";
        return;
    }

    // Handle empty state
    if (shortcuts.length === 0) {
        deleteAllBTN.style.display = "none";
        commandsShortcut.innerHTML = "<p class='no-shortcuts'>No shortcuts found</p>";
        return;
    }

    deleteAllBTN.style.display = "initial";

    // Create table header
    const tHeaderCommandsShortcut = document.createElement("thead");
    const tableHeadContainer = document.createElement("tr");

    ["Shortcut", "Command", "Delete"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        tableHeadContainer.appendChild(th);
    });

    tHeaderCommandsShortcut.appendChild(tableHeadContainer);
    commandsShortcut.appendChild(tHeaderCommandsShortcut);

    const commandsShortcutTableBody = document.createElement("tbody");

    for (const shortcutINFO of shortcuts) {
        // This shortcut is already registered on app startup,
        // so we do NOT register it again here

        const shortcutContainer = document.createElement("tr");

        const shortcutCell = document.createElement("td");
        shortcutCell.textContent = shortcutINFO.shortcut;

        const commandCell = document.createElement("td");
        commandCell.textContent = shortcutINFO.command;

        const deleteShortcutBTNCell = document.createElement("td");
        const deleteShortcutBTN = document.createElement("button");
        deleteShortcutBTN.textContent = "Delete";
        deleteShortcutBTN.className = "btn btn-danger delete-shortcut";

        // Handle single shortcut deletion
        deleteShortcutBTN.addEventListener("click", async () => {
            try {
                // Remove global shortcut from main process
                ipcRenderer.send("remove-global-shortcut", shortcutINFO.shortcut);

                // Remove shortcut from database
                await connection.remove({
                    from: "CommandShortcuts",
                    where: { shortcut: shortcutINFO.shortcut }
                });

                // Refresh shortcut list
                await showCommandsShortcut();
            } catch (err) {
                console.error("Error deleting shortcut:", err);
            }
        });

        deleteShortcutBTNCell.appendChild(deleteShortcutBTN);

        shortcutContainer.appendChild(shortcutCell);
        shortcutContainer.appendChild(commandCell);
        shortcutContainer.appendChild(deleteShortcutBTNCell);

        commandsShortcutTableBody.appendChild(shortcutContainer);
    }

    commandsShortcut.appendChild(commandsShortcutTableBody);
}

// Listen for new shortcut creation event
// Saves shortcut to database and updates UI only
ipcRenderer.on("create-shortcut-command-DB", async (event, shortcutKeysArray, command, WDPath) => {
    const shortcutFormula = shortcutKeysArray.join("+");

    try {
        // Insert new shortcut into database
        await connection.insert({
            into: "CommandShortcuts",
            values: [{ shortcut: shortcutFormula, command, file_path: WDPath }]
        });
        
        console.log(`Command ${command} added to database`);
        
        // Refresh shortcut list
        await showCommandsShortcut();
    } catch (err) {
        console.error("Insert error:", err);
    }
});

// Handle "Delete All" button click
deleteAllBTN.addEventListener("click", async () => {
    try {
        const shortcuts = await connection.select({ from: "CommandShortcuts" });

        // Remove all global shortcuts from main process
        shortcuts.forEach(s => {
            ipcRenderer.send("remove-global-shortcut", s.shortcut);
        });

        // Remove all shortcuts from database
        await connection.remove({ from: "CommandShortcuts" });
        await showCommandsShortcut();
    } catch (err) {
        console.error("Error deleting all shortcuts:", err);
    }
});

// Handle "Add New Shortcut" button click
addShortcutBTN.addEventListener("click", () => {
    ipcRenderer.send("open-shortcut-command-win");
});

// Initialize shortcuts on app startup
// Displays shortcuts and registers them in main process
(async function initShortcuts() {
    await showCommandsShortcut();
    
    try {
        const shortcuts = await connection.select({ from: "CommandShortcuts" });
        
        shortcuts.forEach(shortcutINFO => {
            ipcRenderer.send(
                "addShortcutCommand",
                shortcutINFO.shortcut,
                shortcutINFO.command,
                shortcutINFO.file_path || "",
                false // Do not save again in database
            );
        });
        
        console.log(`Loaded ${shortcuts.length} shortcuts`);
    } catch (err) {
        console.error("Error loading shortcuts:", err);
    }
})();
