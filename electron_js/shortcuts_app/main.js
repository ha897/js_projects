const { 
  app, BrowserWindow, Tray, Menu,
  ipcMain, dialog, shell, globalShortcut
} = require("electron");

const path = require("path");
const { exec } = require("child_process");

let tray;
let mainWin;
let shortcutFileWin;
let shortcutCommandWin;

/* ================= Tray ================= */

// Create system tray and its menu
function createTray() {
    createMainWin();

    tray = new Tray(path.join(__dirname, "assets/images/icon.png"));
    tray.setToolTip("Shortcut Application");

    tray.addListener("double-click", () => {
        if (mainWin) {
            mainWin.restore();
        } else {
            createMainWin();
        }
    });

    const template = [
        {
            label: "Open",
            click() {
                createMainWin();
            }
        },
        {
            label: "Exit",
            click() {
                globalShortcut.unregisterAll();
                app.exit(0);
            }
        }
    ];

    tray.setContextMenu(Menu.buildFromTemplate(template));
}

/* ================= Main Window ================= */

// Create main application window
function createMainWin() {
    mainWin = new BrowserWindow({
        width: 860,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    const template = [
        {
            label: "Demo",
            submenu: [
                {
                    label: "Create File Shortcut",
                    click() {
                        createShortcutFileWin();
                    }
                },
                {
                    label: "Create Command Shortcut",
                    click() {
                        createShortcutCommandWin();
                    }
                }
            ]
        },
        {
            label: "Developer Tools",
            submenu: [
                {
                    label: "Open DevTools",
                    accelerator: process.platform === "darwin" ? "Cmd+D" : "Ctrl+D",
                    click() {
                        mainWin.webContents.openDevTools();
                    }
                },
                {
                    label: "Reload",
                    role: "reload"
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));

    mainWin.on("close", (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWin.destroy();
            mainWin = null;
        }
    });

    mainWin.loadFile("./index.html");
}

/* ================= App Lifecycle ================= */

app.on("ready", createTray);

app.on("window-all-closed", () => {
    // Keep app running in tray
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});

/* ================= File Shortcuts ================= */

ipcMain.on("addShortcutFile", addShortcutFile);

// Handle adding file shortcuts
function addShortcutFile(event, shortcutFormula, filePath, saveInDB = true) {
    const isAlreadyRegistered = globalShortcut.isRegistered(shortcutFormula);

    // If shortcut already exists and comes from user action
    if (isAlreadyRegistered && saveInDB === true) {
        dialog.showMessageBox(shortcutFileWin || mainWin, {
            type: "question",
            title: "Shortcut Exists",
            message: `Shortcut ${shortcutFormula} already exists.\nReplace it?`,
            buttons: ["Yes", "Cancel"],
            defaultId: 1
        }).then(({ response }) => {
            if (response === 1) return;

            globalShortcut.unregister(shortcutFormula);
            mainWin.webContents.send("delete-file-shortcut-DB", shortcutFormula);

            registerFileShortcut(shortcutFormula, filePath, saveInDB);
        });
        return;
    }

    // If shortcut exists during DB reload, ignore
    if (isAlreadyRegistered && saveInDB === false) {
        return;
    }

    registerFileShortcut(shortcutFormula, filePath, saveInDB);
}

// Register file shortcut and optionally save to DB
function registerFileShortcut(shortcutFormula, filePath, saveInDB) {
    const registered = globalShortcut.register(shortcutFormula, () => {
        shell.openPath(filePath).then(result => {
            if (result) {
                dialog.showMessageBox({
                    type: "error",
                    title: "Error",
                    message: `Failed to open file:\n${result}`
                });
            }
        });
    });

    if (!registered) {
        dialog.showMessageBox(shortcutFileWin || mainWin, {
            type: "error",
            title: "Registration Failed",
            message: `Shortcut ${shortcutFormula} could not be registered.`
        });
        return;
    }

    if (saveInDB === true) {
        mainWin.webContents.send("add-file-shortcut-DB", shortcutFormula, filePath);

        if (shortcutFileWin) {
            setTimeout(() => shortcutFileWin.close(), 500);
        }
    }
}

/* ================= Command Shortcuts ================= */

ipcMain.on("addShortcutCommand", addShortcutCommand);

// Handle adding command shortcuts
function addShortcutCommand(event, shortcutFormula, command, WDPath, saveInDB = true) {
    const isAlreadyRegistered = globalShortcut.isRegistered(shortcutFormula);

    if (isAlreadyRegistered && saveInDB === true) {
        dialog.showMessageBox(shortcutCommandWin || mainWin, {
            type: "question",
            title: "Shortcut Exists",
            message: `Shortcut ${shortcutFormula} already exists.\nReplace it?`,
            buttons: ["Yes", "Cancel"],
            defaultId: 1
        }).then(({ response }) => {
            if (response === 1) return;

            globalShortcut.unregister(shortcutFormula);
            mainWin.webContents.send("delete-shortcut-command-DB", shortcutFormula);

            registerCommandShortcut(shortcutFormula, command, WDPath, saveInDB);
        });
        return;
    }

    if (isAlreadyRegistered && saveInDB === false) {
        return;
    }

    registerCommandShortcut(shortcutFormula, command, WDPath, saveInDB);
}

// Register command shortcut and optionally save to DB
function registerCommandShortcut(shortcutFormula, command, WDPath, saveInDB) {
    const registered = globalShortcut.register(shortcutFormula, () => {
        commandRun(command, WDPath);
    });

    if (!registered) {
        dialog.showMessageBox(shortcutCommandWin || mainWin, {
            type: "error",
            title: "Registration Failed",
            message: `Shortcut ${shortcutFormula} could not be registered.`
        });
        return;
    }

    if (saveInDB === true) {
        mainWin.webContents.send(
            "create-shortcut-command-DB",
            shortcutFormula.split("+"),
            command,
            WDPath
        );

        if (shortcutCommandWin) {
            setTimeout(() => shortcutCommandWin.close(), 500);
        }
    }
}

/* ================= Command Execution ================= */

// Execute shell command with working directory
function commandRun(command, WDPath) {
    exec(command, { cwd: WDPath }, (error, stdout) => {
        if (error) {
            dialog.showMessageBox({
                type: "error",
                title: "Execution Error",
                message: error.message
            });
            return;
        }

        if (stdout && stdout.trim() !== "") {
            dialog.showMessageBox({
                type: "info",
                title: "Command Output",
                message: stdout
            });
        }
    });
}

/* ================= File Dialog ================= */

// Open file selection dialog
ipcMain.on("upload-file", (event) => {
    dialog.showOpenDialog(mainWin, {
        properties: ["openFile"]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            event.sender.send("file-path", result.filePaths[0]);
        }
    });
});

/* ================= Child Windows ================= */

// Create file shortcut window
function createShortcutFileWin() {
    if (shortcutFileWin) {
        shortcutFileWin.focus();
        return;
    }

    shortcutFileWin = new BrowserWindow({
        width: 400,
        height: 400,
        parent: mainWin,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    shortcutFileWin.loadFile("./views/shortcutFile.html");
    shortcutFileWin.removeMenu();

    shortcutFileWin.on("close", (event) => {
        event.preventDefault();
        shortcutFileWin.destroy();
        shortcutFileWin = undefined;
    });
}

// Create command shortcut window
function createShortcutCommandWin() {
    if (shortcutCommandWin) {
        shortcutCommandWin.focus();
        return;
    }

    shortcutCommandWin = new BrowserWindow({
        width: 400,
        height: 450,
        parent: mainWin,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    shortcutCommandWin.loadFile("./views/shortcutCommmand.html");
    shortcutCommandWin.removeMenu();

    shortcutCommandWin.on("close", (event) => {
        event.preventDefault();
        shortcutCommandWin.destroy();
        shortcutCommandWin = undefined;
    });
}

ipcMain.on("open-shortcut-file-win", createShortcutFileWin);
ipcMain.on("open-shortcut-command-win", createShortcutCommandWin);

/* ================= Utilities ================= */

// Return desktop path
ipcMain.handle("get-desktop-path", () => {
    return app.getPath("desktop");
});

// Remove global shortcut
ipcMain.on("remove-global-shortcut", (event, shortcut) => {
    if (globalShortcut.isRegistered(shortcut)) {
        globalShortcut.unregister(shortcut);
    }
});
