const { ipcRenderer } = require("electron");
const connection = require("./connection");

const $ = require("jquery");

const deleteAllBTN = $(".file-shortcut .delete-all");
const addShortcutBTN = $(".file-shortcut .new-shortcut");
const filesShortcut = $(".files-shortcut");

// Listen for event to add a new file shortcut to the database
ipcRenderer.on("add-file-shortcut-DB", async (event, shortcutFormula, filePath) => {
    try {
        await connection.insert({
            into: "FilesShortcuts",
            values: [{
                shortcut: shortcutFormula,
                file_path: filePath
            }]
        });

        console.log(`File shortcut added: ${shortcutFormula}`);
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
    filesShortcut.empty();

    let shortcuts = [];
    try {
        shortcuts = await connection.select({ from: "FilesShortcuts" });
    } catch (err) {
        console.error("Error fetching file shortcuts:", err);
        filesShortcut.html("<p class='no-shortcuts'>Failed to load shortcuts</p>");
        return;
    }

    if (shortcuts.length === 0) {
        deleteAllBTN.hide();
        filesShortcut.html("<p class='no-shortcuts'>No shortcuts found</p>");
        return;
    }

    deleteAllBTN.show();

    const tHeaderFilesShortcut = $("<thead>");
    const tableHeadContainer = $("<tr>");

    ["Shortcut", "File Path", "Delete"].forEach(text => {
        tableHeadContainer.append($("<th>").text(text));
    });

    tHeaderFilesShortcut.append(tableHeadContainer);
    filesShortcut.append(tHeaderFilesShortcut);

    const filesShortcutTableBody = $("<tbody>");

    for (const shortcutINFO of shortcuts) {
        const shortcutContainer = $("<tr>");

        const shortcutCell = $("<td>");
        const filepathCell = $("<td>")
            .text(shortcutINFO.file_path)
            .attr("title", shortcutINFO.file_path);

        const deleteShortcutBTN = $("<button>")
            .text("Delete")
            .addClass("btn btn-danger btn-sm delete-shortcut")
            .on("click", async () => {
                try {
                    ipcRenderer.send("remove-global-shortcut", shortcutINFO.shortcut);

                    await connection.remove({
                        from: "FilesShortcuts",
                        where: { shortcut: shortcutINFO.shortcut }
                    });

                    await showFilesShortcut();
                } catch (err) {
                    console.error("Error deleting shortcut:", err);
                }
            });

        const deleteShortcutBTNCell = $("<td>").append(deleteShortcutBTN);

                    shortcutCell.addClass("shortcut-cell");
                    const spanElement = $("<span>").text(shortcutINFO.shortcut);
                    shortcutCell.addClass("shortcut-cell").append(spanElement);



        shortcutContainer.append(
            shortcutCell,
            filepathCell,
            deleteShortcutBTNCell
        );

        filesShortcutTableBody.append(shortcutContainer);
    }

    filesShortcut.append(filesShortcutTableBody);
}

// Handle "Delete All" button click
deleteAllBTN.on("click", async () => {
    try {
        const shortcuts = await connection.select({ from: "FilesShortcuts" });

        shortcuts.forEach(s => {
            ipcRenderer.send("remove-global-shortcut", s.shortcut);
        });

        await connection.remove({ from: "FilesShortcuts" });
        await showFilesShortcut();
    } catch (err) {
        console.error("Error deleting all shortcuts:", err);
    }
});

// Handle "Add New Shortcut" button click
addShortcutBTN.on("click", () => {
    ipcRenderer.send("open-shortcut-file-win");
});

// Initialize file shortcuts on app startup
(async function initFileShortcuts() {
    await showFilesShortcut();

    try {
        const shortcuts = await connection.select({ from: "FilesShortcuts" });

        shortcuts.forEach(shortcutINFO => {
            ipcRenderer.send(
                "addShortcutFile",
                shortcutINFO.shortcut,
                shortcutINFO.file_path,
                false
            );
        });

        console.log(`Loaded ${shortcuts.length} file shortcuts`);
    } catch (err) {
        console.error("Error loading file shortcuts:", err);
    }
})();
