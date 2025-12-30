const databaseName = "Calculator";
export async function AddOperation(newData) {
  try {
    const operationData = { Add: newData };
    const db = new Dexie(databaseName);
    db.version(1).stores({ Operations: "++_id" });
    const rec = db.table("Operations");
    await rec.add(operationData);

    LoadHistory();
    db.close();
    console.log("The process was added successfully.");
    //   التاكد من ان الكمبيوتر يدعم السرفس ولكر و SyncManager 
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then(function (sw) {
        console.log("Sync registering...");
        sw.sync.register("add").then(() => {
          console.log("Sync registered successfully");
        });
      });
    }

  } catch (error) {
    console.error("error: ", error);
  }
}

export function LoadHistory() {
  const db = new Dexie(databaseName);
  db.version(1).stores({ Operations: "++_id" });
  const rec = db.table("Operations");

  db.open().catch(function (error) {
    alert("Error while opening database: " + error);
  });

  const historyList = document.getElementById("history");
  historyList.innerHTML = "";

  rec.each(function (operation) {
    const li = document.createElement("li");
    li.textContent = operation.Add;
    historyList.appendChild(li);
  });
}
