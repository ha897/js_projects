const connection = require("./connection");
const { ipcRenderer } = require("electron");

const $ = require("jquery");

const deleteAllBTN = $(".command-shortcut .delete-all");
const addShortcutBTN = $(".command-shortcut .new-shortcut");
const commandsShortcut = $(".commandes-shortcut");

// Listen for delete event coming from main process
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
    commandsShortcut.empty();

    let shortcuts = [];
    try {
        shortcuts = await connection.select({ from: "CommandShortcuts" });
    } catch (err) {
        console.error("Error fetching shortcuts:", err);
        commandsShortcut.html("<p class='no-shortcuts'>Failed to load shortcuts</p>");
        return;
    }

    if (shortcuts.length === 0) {
        deleteAllBTN.hide();
        commandsShortcut.html("<p class='no-shortcuts'>No shortcuts found</p>");
        return;
    }

    deleteAllBTN.show();

    const tHeaderCommandsShortcut = $("<thead>");
    const tableHeadContainer = $("<tr>");

    ["Shortcut", "Command","Path", "Delete"].forEach(text => {
        tableHeadContainer.append($("<th>").text(text));
    });

    tHeaderCommandsShortcut.append(tableHeadContainer);
    commandsShortcut.append(tHeaderCommandsShortcut);

    const commandsShortcutTableBody = $("<tbody>");
    
    for (const shortcutINFO of shortcuts) {
        const shortcutContainer = $("<tr>");

        const shortcutCell = $("<td>");
        const commandCell = $("<td>").text(shortcutINFO.command);
        const pathCell = $("<td>").text(shortcutINFO.file_path || "No Path");
            pathCell.attr("title", shortcutINFO.file_path);

        const deleteShortcutBTN = $("<button>")
            .text("Delete")
            .addClass("btn btn-danger btn-sm delete-shortcut")
            .on("click", async () => {
                try {
                    ipcRenderer.send("remove-global-shortcut", shortcutINFO.shortcut);

                    await connection.remove({
                        from: "CommandShortcuts",
                        where: { shortcut: shortcutINFO.shortcut }
                    });

                    await showCommandsShortcut();
                } catch (err) {
                    console.error("Error deleting shortcut:", err);
                }
            });

        const deleteShortcutBTNCell = $("<td>").append(deleteShortcutBTN);

                    shortcutCell.addClass("shortcut-cell");
                    const spanElement = $("<span>").text(shortcutINFO.shortcut);
                    shortcutCell.addClass("shortcut-cell").append(spanElement);

                    // .text(shortcutINFO.shortcut)

        shortcutContainer.append(
            shortcutCell,
            commandCell,
            pathCell,
            deleteShortcutBTNCell
        );

        commandsShortcutTableBody.append(shortcutContainer);
    }

    commandsShortcut.append(commandsShortcutTableBody);
}

// Listen for new shortcut creation event
ipcRenderer.on("create-shortcut-command-DB", async (event, shortcutKeysArray, command, WDPath) => {
    const shortcutFormula = shortcutKeysArray.join("+");

    try {
        await connection.insert({
            into: "CommandShortcuts",
            values: [{ shortcut: shortcutFormula, command, file_path: WDPath }]
        });

        console.log(`Command ${command} added to database`);
        await showCommandsShortcut();
    } catch (err) {
        console.error("Insert error:", err);
    }
});

// Handle "Delete All" button click
deleteAllBTN.on("click", async () => {
    try {
        const shortcuts = await connection.select({ from: "CommandShortcuts" });

        shortcuts.forEach(s => {
            ipcRenderer.send("remove-global-shortcut", s.shortcut);
        });

        await connection.remove({ from: "CommandShortcuts" });
        await showCommandsShortcut();
    } catch (err) {
        console.error("Error deleting all shortcuts:", err);
    }
});

// Handle "Add New Shortcut" button click
addShortcutBTN.on("click", () => {
    ipcRenderer.send("open-shortcut-command-win");
});

// Initialize shortcuts on app startup
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
                false
            );
        });

        console.log(`Loaded ${shortcuts.length} shortcuts`);
    } catch (err) {
        console.error("Error loading shortcuts:", err);
    }
})();
