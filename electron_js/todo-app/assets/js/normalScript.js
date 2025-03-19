const {ipcRenderer} = require("electron")

const form = document.getElementById("form")
form.addEventListener("submit",(event)=>{
    event.preventDefault()
    const note = document.getElementById("task").value;
    ipcRenderer.send("add-normal-task",note)
})