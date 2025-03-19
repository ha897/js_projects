const { app, BrowserWindow, Menu, ipcMain, dialog, Notification, Tray } = require("electron")
const fs = require("fs");
const { platform } = require("os");
const path = require("path")
const appPath = app.getPath("userData");

process.env.NODE_ENV = "production"

let mainMenuTemplate = []

let MainWin;
let addWindow;
let addTimedWindow;
let addImagedWindow;
let tray = null;
app.on("ready", () => {
    MainWin = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    MainWin.loadFile("./index.html");
    mainMenuTemplate.push({
        label: "القائمة",
        submenu: [
            {
                label: "اضافة مهمة",
                click() {
                    initAddWindow()
                }
            }, {
                label: "اضافة مهمة مؤقتة",
                click() {
                    createTimedWindow()
                }
            }, {
                label: "اضافة مهمة بصورة",
                click() {
                    createImagedWindow()
                }
            }, {
                label: "خروج",
                accelerator: process.platform == "darwin" ? "Cmd+Q" : "Ctrl+Q",
                click() {
                    app.quit()
                }
            }
        ]
    });

    if (process.env.NODE_ENV !== "production") {
        mainMenuTemplate.push({
            label: "ادوات المطور",
            submenu: [
                {
                    label: "فتح ادوات المطور",
                    accelerator: process.platform == "darwin" ? "Cmd+D" : "Ctrl+D",
                    click() {
                        MainWin.webContents.openDevTools()
                    }
                }, {
                    label: "اعادة تحميل التطبيق",
                    role: "reload"
                }
            ]
        })
    }
    if (process.platform == "darwin") {
        mainMenuTemplate.unshift({})
    }
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    MainWin.on("minimize", (event) => {
        event.preventDefault();
        MainWin.hide();
        tray = createTray();

    })
    MainWin.on("restore", (event) => {
        MainWin.show();
        tray.destroy();
    })


    MainWin.on("closed", () => {
        app.quit()
    })
    Menu.setApplicationMenu(mainMenu)
})

function createTray() {
    let iconPath = path.join(__dirname, "./assets/images/icon.png");
    let appIcon = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate(iconMenuTemplate);
    appIcon.on("double-click", function(event) {
        MainWin.show();
    });
    // الكلام الي يضهر عندما نسوي هافر للتطبيق
    appIcon.setToolTip("تطبيق ادارة المهام");
    appIcon.setContextMenu(contextMenu);
    return appIcon

}
const iconMenuTemplate = [{
    label: "فتح التطبيق",
    click() {
        MainWin.show()
    }
}, {
    label: "اغلاق",
    click() {
        app.quit()
    }
}]
function initAddWindow() {
    addWindow = new BrowserWindow({
        width: 400,
        height: 250,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    addWindow.once("ready-to-show", () => {
        addWindow.show()
    })

    addWindow.removeMenu()
    addWindow.loadFile("./views/normalTask.html");
    addWindow.on("closed", (event) => {
        // event.preventDefault()
        addWindow = null
    })
}
function createTimedWindow() {
    addTimedWindow = new BrowserWindow({
        width: 400,
        height: 400,
        // show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    // addTimedWindow.once("ready-to-show", () => {
    //     addTimedWindow.show()
    // })
    addTimedWindow.removeMenu()
    addTimedWindow.loadFile("./views/timedTask.html");
    addTimedWindow.on("closed", (event) => {
        // event.preventDefault()
        addTimedWindow = null
    })
}

ipcMain.on("add-normal-task", (event, item) => {
    // يرسل الرساله للكل
    MainWin.webContents.send("add-normal-task", item);
    addWindow.close();
})
ipcMain.on("add-timed-task", (event, note, navicationDate) => {
    // يرسل الرساله للكل
    MainWin.webContents.send("add-timed-task", note, navicationDate);
    addTimedWindow.close();
})


ipcMain.on("create-txt", (event, note) => {
    let dest = Date.now() + "-task.txt"
    dialog.showSaveDialog({
        title: "اختر مكان حفض الملف",
        defaultPath: path.join(__dirname, "./" + dest),
        buttonLabel: "Save",
        filters: [{
            name: "Text Files",
            extensions: ["txt"]
        }]
    }).then((file) => {
        if (!file.canceled) {
            fs.writeFile(file.filePath.toString(), note, (err) => {
                if (err) {
                    throw err
                }
            })
        }
    }).catch(err => console.log(err))
})
ipcMain.on("new-normal-task", () => {
    initAddWindow()
})
ipcMain.on("new-timed-task", () => {
    createTimedWindow()
})
ipcMain.on("notify", (event, noteVale) => {
    new Notification({
        title: "لديك تنبيه من مهامك",
        body: noteVale,
        icon: path.join(__dirname, "assets/images/icon.png")
    }).show()
})
function createImagedWindow() {
    addImagedWindow = new BrowserWindow({
        width: 400,
        height: 450,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    // 
    addImagedWindow.removeMenu()
    addImagedWindow.once("ready-to-show", () => {
        addImagedWindow.show()
    })

    addImagedWindow.loadFile("./views/imagedTask.html")
    addImagedWindow.on("closed", (event) => {
        // gbt
        // event.preventDefault()
        addImagedWindow = null;
    })
}


ipcMain.on("upload-image", function (event) {
    dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
            { name: "images", extensions: ["jpg", "png", "gif"] }
        ]
    }).then(result => {
        event.sender.send("open-file", result.filePaths, appPath)
    })
});
ipcMain.on("add-imaged-task", function (e, note, imgURI) {
    MainWin.webContents.send("add-imaged-task", note, imgURI);
    addImagedWindow.close();

});

ipcMain.on("new-imaged", () => {
    createImagedWindow()
})

ipcMain.on("create-file", (event, imagePath, filePath) => {
    fs.copyFile(imagePath, filePath, (err) => {
        console.log(err)
    });
})
ipcMain.on("remove-file", (event, img_uri) => {

    fs.unlink(img_uri, (err) => {
        if (err) {
            console.log(err);
            return;
        }
    });
})
