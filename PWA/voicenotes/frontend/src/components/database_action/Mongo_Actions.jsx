import AllActions from "./Dexie_Actions";

const DbActions = {};
const api_url = import.meta.env.VITE_APP_API_URL;
const push_url = import.meta.env.VITE_APP_PUSH_URL;

DbActions.SaveToServer = async function (objectToSave) {
  try {
    const response = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(objectToSave),
    });
    if (!response.ok) {
      throw new Error("HTTP Error! Status: ${response.status}");
    }
    return await response.json();
  } catch (error) {
    console.error("Error saving to server: ", error);
    return null;
  }
};
DbActions.DeleteFromServer = async function (id) {
  return await fetch(`${api_url}/${id}`, {
    method: "DELETE",
  });
};

DbActions.Sync = async function () {
  try {
    const waitingData = await AllActions.ReadDataByStatus(["o", "w"]);

    if (waitingData.length == 0) {
      return "No items to sync...";
    }

    for (let itm of waitingData) {
      if (itm.status === "w") {
        itm.status = "i";
      }

      const result =
        itm.status === "o"
          ? await DbActions.DeleteFromServer(itm.id)
          : await DbActions.SaveToServer(itm);

      if (result && result.ok) {
        itm.status === "o"
          ? await AllActions.DeleteById(itm.id)
          : await AllActions.Update(itm.id, itm);
      } else {
        throw new Error(
          "Error during deleting or saving some items to server."
        );
      }
    }
    return "Sync completed successfully.";
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
};
DbActions.ReadFromServer = async function () {
    try {
        const res = await fetch(api_url);
        
        if (!res.ok) {
            throw new Error(`Fetch failed with status: ${res.status}`);
        }
        
        const data = await res.json();
        
        return data.map(item => {
            if (item.audio && item.audio.data) {
                item.audio = new TextDecoder("utf-8").decode(new Uint8Array(item.audio.data));
            }
            return item;
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
DbActions.ImportFromServer = async function () {
    try {
        const data = await DbActions.ReadFromServer();
        await AllActions.DeleteByStatus("i");
        return await AllActions.InsertBulk(data);
    } catch (error) {
        console.error("Import failed:", error);
        throw error;
    }
}
DbActions.Push = async function (objectToSave) {
    return await fetch(push_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(objectToSave)
    });
}
export default DbActions;
