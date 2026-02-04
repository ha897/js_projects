const JsStore = require("jsstore");

let dbName = "electron_shortcuts";

function getDbSchema() {
    let tableShortcutsFiles = {
        name: "FilesShortcuts",
        columns: {
            id: { primaryKey: true, autoIncrement: true },
            shortcut: { notNull: true, dataType: "string" },
            file_path: { notNull: true, dataType: "string" }
        }
    };
    let tableShortcutsCommands = {
        name: "CommandShortcuts",
        columns: {
            id: { primaryKey: true, autoIncrement: true },
            shortcut: { notNull: true, dataType: "string" },
            command: { notNull: true, dataType: "string" }
        }
    };
    
    let db = {
        name:dbName,
        tables: [tableShortcutsFiles, tableShortcutsCommands]
    }
    return db
}
let connection = new JsStore.Connection(
    new Worker("node_modules/jsstore/dist/jsstore.worker.js")
)
async function initJsStore(){
    let database = getDbSchema();
    let isDbCreated = await connection.initDb(database);
    if (isDbCreated === true) {
        // db is created first time
        console.log("db is created")
    }else{
        // db is already created
        console.log("db is connected")
    }
}
initJsStore()
module.exports = connection