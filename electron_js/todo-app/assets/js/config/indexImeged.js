const { ipcRenderer } = require("electron");
const connection = require("./connection");
const fs = require("fs");
let newImaged = document.querySelector(".todo-imaged-list ~ .todo-button > .add-new-task")
newImaged.addEventListener("click",()=>{
    ipcRenderer.send("new-imaged");
})
ipcRenderer.on("add-imaged-task", function (event, note, imgURI) {
    addImagedTask(note, imgURI);
});
function addImagedTask(note, imgURI) {
    connection.insert({
        into: "imaged",
        values: [{
            note: note,
            img_uri: imgURI
        }]

    }).then(showImaged)
}
function deleteImagedTask(taskId, imgURL) {
    if (imgURL) {
        ipcRenderer.send("remove-file", imgURL)
        // fs.unlink(imgURL, (err) => {
        //     if (err) {
        //         console.log(err)
        //         return
        //     }
        // })
    }
    return connection.remove({
        from: "imaged",
        where: {
            id: taskId
        }
    }).then(showImaged)
}

function updateImagedTask(taskId, taskValue) {
    connection.update({
        in: "imaged",
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }
    }).then(showImaged)

}
function showImaged() {
    let clearImagedBTN = document.querySelector(".todo-imaged-list ~ .todo-button > .clear-all")

    let imagedList = document.querySelector(".todo-imaged-list");
    imagedList.innerHTML = "";

    connection.select({
        from: "imaged"
    }).then((tasks) => {
        if (tasks.length == 0) {
            imagedList.innerHTML = '<li class="empty-list">ﻻ يوجد صور</li>';
            clearImagedBTN.style.display = "none";
        } else {
            clearImagedBTN.style.display = "flex";
            clearImagedBTN.addEventListener("click", () => {
                return connection.remove({
                    from: 'imaged'
                }).then(showImaged)
            })
            for (let task of tasks) {
                clearImagedBTN.addEventListener("click", function() {
                    deleteImagedTask(task.id, task.img_uri)
                });                
                let listItem = document.createElement("li"),
                    taskInput = document.createElement("input"),
                    imageHolder = document.createElement("div"),
                    taskImage = document.createElement("img"),
                    buttonsHolder = document.createElement("div"),
                    noteContentHolder = document.createElement("div"),
                    deleteBTN = document.createElement("button"),
                    updateBTN = document.createElement("button"),
                    exportBTN = document.createElement("button");

                taskInput.value = task.note;
                buttonsHolder.classList.add("buttons-holder")

                
                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                taskImage.setAttribute("src", task.img_uri)
                deleteBTN.addEventListener("click", () => {
                    deleteImagedTask(task.id, task.img_uri)
                })
                updateBTN.addEventListener("click", () => {
                    updateImagedTask(task.id, taskInput.value)
                })
                exportBTN.addEventListener("click", () => {
                    ipcRenderer.send("create-txt", task.note)
                })

                // buttonsHolder.appendChild(deleteBTN)
                // buttonsHolder.appendChild(updateBTN)
                // buttonsHolder.appendChild(exportBTN)
                // noteContentHolder.appendChild(buttonsHolder)

                // imageHolder.appendChild(taskImage)
                // listItem.appendChild(noteContentHolder);
                // listItem.appendChild(imageHolder);
                // listItem.appendChild(taskInput);
                // imagedList.appendChild(listItem);
                buttonsHolder.appendChild(deleteBTN);
buttonsHolder.appendChild(updateBTN);
buttonsHolder.appendChild(exportBTN);
noteContentHolder.appendChild(taskInput);
noteContentHolder.appendChild(buttonsHolder);
imageHolder.appendChild(taskImage);
listItem.appendChild(noteContentHolder);
listItem.appendChild(imageHolder);
imagedList.appendChild(listItem);
            }
        }
    });
}
showImaged()