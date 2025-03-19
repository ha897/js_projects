const {ipcRenderer} =require("electron")
const connection = require("./connection")

ipcRenderer.on("add-timed-task", (event, note, navicationDate)=>{
    addTimedTask(note, navicationDate)
})
function addTimedTask(note, navicationDate){
    connection.insert({
        into:"timed",
        values:[{
            note:note,
            pick_status: 0 ,
            pick_time:navicationDate
        }]
    }).then(showTimedTask)
}
function deleteTimedTask(taskId){
    return connection.remove({
        from: "timed",
        where: {
            id: taskId
        }
    }).then(showTimedTask)
}
function updateTimedTask(taskId, taskValue){
    return connection.update({
        in:"timed",
        where:{
            id:taskId
        },
        set:{
            note:taskValue
        }
    }).then(showTimedTask)
}
function showTimedTask(){
    let clearTimedBTN = document.querySelector(".todo-timed-list ~ .todo-button > .clear-all")
    let newTimedBTN = document.querySelector(".todo-timed-list ~ .todo-button > .add-new-task")
    newTimedBTN.addEventListener("click",()=>{
        ipcRenderer.send("new-timed-task")
    })
   

    let timedList = document.getElementsByClassName("todo-timed-list")[0]
    timedList.innerHTML = ""
    connection.select({
        from: 'timed'
    }).then((tasks) => {
        if (tasks.length == 0) {
            timedList.innerHTML = "<li class='empty-list'>لا توجد مهام</li>";
            clearTimedBTN.style.display = "none";
        } else {
            clearTimedBTN.style.display = "flex";
            clearTimedBTN.addEventListener("click",()=>{
                return connection.remove({from: "timed"}).then(showTimedTask)
            })
            

            for (let task of tasks) {
                let listItem = document.createElement("li"),
                    taskInput = document.createElement("input"),
                    timeHolder = document.createElement("div"),
                    deleteBTN = document.createElement("button"),
                    updateBTN = document.createElement("button"),
                    exportBTN = document.createElement("button"),
                    buttonsHolder = document.createElement("div")
                    
                    
                timeHolder.classList.add("time-holder");
                buttonsHolder.classList.add("buttons-holder");
                

                deleteBTN.innerHTML = "حذف <i class='fas fa-trash-alt'></i>";
                updateBTN.innerHTML = "تحديث <i class='fas fa-cloud-upload-alt'></i>";
                exportBTN.innerHTML = "تصدير <i class='fas fa-file-export'></i>";
                taskInput.value = task.note;
                
                deleteBTN.addEventListener("click",()=>{
                    deleteTimedTask(task.id)
                })
                updateBTN.addEventListener("click",()=>{
                    updateTimedTask(task.id, taskInput.value)  
                })
                exportBTN.addEventListener("click",()=>{
                    ipcRenderer.send("create-txt", task.note)  
                })
                if (task.pick_status === 1) {
                    timeHolder.innerHTML = "<bdi>"+" جرى التهيئة في الساعة " + task.pick_time.toLocaleTimeString() +"</bdi>";
                }else{
                    timeHolder.innerHTML = "<bdi>"+ " يتم التنبيه بالساعة " + task.pick_time.toLocaleTimeString()+"</bdi>" ;
                }
                let checkInterval = setInterval(function() {
                    let currentDate = new Date();
                
                    if (task.pick_time.toString() === currentDate.toString()) {
                        connection.update({
                            in: "timed",
                            where: {
                                id: task.id
                            },
                            set: {
                                pick_status: 1
                            }
                        }).then(() => showTimedTask());
                        ipcRenderer.send("notify", task.note)
                        clearInterval(checkInterval);
                    }
                }, 1000);

                buttonsHolder.appendChild(deleteBTN)
                buttonsHolder.appendChild(updateBTN)
                buttonsHolder.appendChild(exportBTN)
                listItem.appendChild(taskInput);
                listItem.appendChild(timeHolder);
                listItem.appendChild(buttonsHolder)
                timedList.appendChild(listItem);
            }
        }
        
    });
    
}

showTimedTask()
