const { ipcRenderer } = require("electron");
const connection = require("./connection");

const deleteAllBTN = document.querySelector(".file-shortcut .delete-all");
const addShortcutBTN = document.querySelector(".file-shortcut .new-shortcut");
const filesShortcut = document.querySelector(".files-shortcut");

// Listen for event to add a new file shortcut to the database
ipcRenderer.on("add-file-shortcut-DB", async (event, shortcutFormula, filePath) => {
    try {
        // Insert new file shortcut into database
        await connection.insert({
            into: "FilesShortcuts",
            values: [{
                shortcut: shortcutFormula,
                file_path: filePath
            }]
        });
        
        console.log(`File shortcut added: ${shortcutFormula}`);
        
        // Refresh UI only (do not re-register shortcuts here)
        await showFilesShortcut();
    } catch (err) {
        console.error("Error adding file shortcut:", err);
    }
});

// Listen for event to delete a file shortcut from database only
ipcRenderer.on("delete-file-shortcut-DB", async (event, shortcut) => {
    try {
        await connection.remove({ 
            from: "FilesShortcuts",
            where: { shortcut: shortcut }
        });
        console.log(`Shortcut ${shortcut} deleted from database`);
    } catch (err) {
        console.error("Error deleting file shortcut:", err);
    }            
});

// Function to display file shortcuts without re-registering them
async function showFilesShortcut() {
    filesShortcut.innerHTML = "";

    let shortcuts = [];
    try {
        // Fetch all file shortcuts from database
        shortcuts = await connection.select({ from: "FilesShortcuts" });
    } catch (err) {
        console.error("Error fetching file shortcuts:", err);
        filesShortcut.innerHTML = "<p class='no-shortcuts'>Failed to load shortcuts</p>";
        return;
    }

    // Handle empty state
    if (shortcuts.length === 0) {
        deleteAllBTN.style.display = "none";
        filesShortcut.innerHTML = "<p class='no-shortcuts'>No shortcuts found</p>";
        return;
    }

    deleteAllBTN.style.display = "initial";

    // Create table header
    const tHeaderFilesShortcut = document.createElement("thead");
    const tableHeadContainer = document.createElement("tr");

    ["Shortcut", "File Path", "Delete"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        tableHeadContainer.appendChild(th);
    });

    tHeaderFilesShortcut.appendChild(tableHeadContainer);
    filesShortcut.appendChild(tHeaderFilesShortcut);

    // Create table body
    const filesShortcutTableBody = document.createElement("tbody");

    for (const shortcutINFO of shortcuts) {
        // Shortcuts are registered once at app startup,
        // so we do not register them again here

        const shortcutContainer = document.createElement("tr");

        const shortcutCell = document.createElement("td");
        shortcutCell.textContent = shortcutINFO.shortcut;

        const filepathCell = document.createElement("td");
        filepathCell.textContent = shortcutINFO.file_path;
        filepathCell.title = shortcutINFO.file_path; // Show full path on hover

        const deleteShortcutBTNCell = document.createElement("td");
        const deleteShortcutBTN = document.createElement("button");
        deleteShortcutBTN.textContent = "Delete";
        deleteShortcutBTN.className = "btn btn-danger delete-shortcut";

        // Handle single file shortcut deletion
        deleteShortcutBTN.addEventListener("click", async () => {
            try {
                // Remove global shortcut from main process
                ipcRenderer.send("remove-global-shortcut", shortcutINFO.shortcut);

                // Remove shortcut from database
                await connection.remove({
                    from: "FilesShortcuts",
                    where: { shortcut: shortcutINFO.shortcut }
                });

                // Refresh UI
                await showFilesShortcut();
            } catch (err) {
                console.error("Error deleting shortcut:", err);
            }
        });

        deleteShortcutBTNCell.appendChild(deleteShortcutBTN);

        shortcutContainer.appendChild(shortcutCell);
        shortcutContainer.appendChild(filepathCell);
        shortcutContainer.appendChild(deleteShortcutBTNCell);

        filesShortcutTableBody.appendChild(shortcutContainer);
    }

    filesShortcut.appendChild(filesShortcutTableBody);
}

// Handle "Delete All" button click
deleteAllBTN.addEventListener("click", async () => {
    try {
        const shortcuts = await connection.select({ from: "FilesShortcuts" });

        // Remove all global shortcuts from main process
        shortcuts.forEach(s => {
            ipcRenderer.send("remove-global-shortcut", s.shortcut);
        });

        // Remove all shortcuts from database
        await connection.remove({ from: "FilesShortcuts" });

        // Refresh UI
        await showFilesShortcut();
    } catch (err) {
        console.error("Error deleting all shortcuts:", err);
    }
});

// Handle "Add New Shortcut" button click
addShortcutBTN.addEventListener("click", () => {
    ipcRenderer.send("open-shortcut-file-win");
});

// Initialize file shortcuts on app startup
// Displays shortcuts and registers them in main process
(async function initFileShortcuts() {
    await showFilesShortcut();
    
    try {
        const shortcuts = await connection.select({ from: "FilesShortcuts" });
        
        shortcuts.forEach(shortcutINFO => {
            ipcRenderer.send(
                "addShortcutFile",
                shortcutINFO.shortcut,
                shortcutINFO.file_path,
                false // Do not save again in database
            );
        });
        
        console.log(`Loaded ${shortcuts.length} file shortcuts`);
    } catch (err) {
        console.error("Error loading file shortcuts:", err);
    }
})();
