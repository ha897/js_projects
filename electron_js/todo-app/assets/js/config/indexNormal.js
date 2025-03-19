const { ipcRenderer } = require("electron")
const connection = require("./connection.js")

let newNormal = document.getElementsByClassName("add-new-task")[0]
newNormal.addEventListener("click", () => {
    ipcRenderer.send("new-normal-task")
})
ipcRenderer.on("add-normal-task", (event, task) => {
    addNormalTask(task)
})
function addNormalTask(task) {
    connection.insert({
        into: "tasks",
        values: [{
            note: task
        }]
    }).then(() => showNormalTask())
}
function deleteTask(taskId) {
    return connection.remove({
        from: "tasks",
        where: {
            id: taskId
        }
    }).then(() => {
        showNormalTask()
    })
}
function updateTask(taskId, taskValue) {
    return connection.update({
        in: "tasks",
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }
    }).then(() => showNormalTask())
}
function showNormalTask() {



    let clearNormalBTN = document.querySelector(".todo-normal .clear-all");
    let normalTaskList = document.getElementsByClassName("todo-normal-list")[0];
    normalTaskList.innerHTML = "";
    connection.select({
        from: "tasks"
    }).then((tasks) => {
        if (tasks.length === 0) {
            normalTaskList.innerHTML = "<li class='empty-list'>لا توجد مهام</li>";
            clearNormalBTN.style.display = "none";
        } else {
            clearNormalBTN.style.display = "flex";
            let clearAll = document.querySelector(".todo-normal-list  ~ .todo-button > .clear-all")

            clearAll.addEventListener("click", () => {
                connection.remove({
                    from: "tasks"
                }).then(showNormalTask)
            })


            let listItem;
            let taskInput;
            let deleteBTN;
            let updateBTN;
            let buttonsHolder;
            let exportBTN;

            for (let task of tasks) {
                listItem = document.createElement("li");
                taskInput = document.createElement("input");

                deleteBTN = document.createElement("button");
                updateBTN = document.createElement("button");
                exportBTN = document.createElement("button");
                // deleteBTN.innerHTML = "حذف"
                // updateBTN.innerHTML = "تعديل"
                // exportBTN.innerHTML = "تصدير"


                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";

                deleteBTN.addEventListener("click", () => {
                    deleteTask(task.id)
                })

                updateBTN.addEventListener("click", () => {
                    updateTask(task.id, taskInput.value)
                })

                exportBTN.addEventListener("click", () => {
                    ipcRenderer.send("create-txt", task.note)
                })

                buttonsHolder = document.createElement("div");
                buttonsHolder.classList.add("buttons-holder");
                taskInput.value = task.note;
                buttonsHolder.appendChild(deleteBTN)
                buttonsHolder.appendChild(updateBTN)
                buttonsHolder.appendChild(exportBTN)

                listItem.appendChild(taskInput);
                listItem.appendChild(buttonsHolder);

                normalTaskList.appendChild(listItem);

            }
        }
    })
}
showNormalTask()
