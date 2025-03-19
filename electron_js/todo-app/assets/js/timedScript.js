const {ipcRenderer} = require("electron")

const form = document.getElementById("form")
form.addEventListener("submit",(event)=>{
    event.preventDefault()
    let note = document.getElementById("task").value;

    let pickHours = document.getElementById("hours").value * 3600000;
    let pickMinutes = document.getElementById("minutes").value * 60000;
    let navicationDate = Date.now();

    navicationDate += (pickHours + pickMinutes);
navicationDate = new Date(navicationDate);


    ipcRenderer.send("add-timed-task",note, navicationDate)
})
