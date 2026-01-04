import React, { useState, useEffect } from "react";
import RecordRTC from "recordrtc";
import AllActions from "../database_action/Dexie_Actions";
import DbActions from "../database_action/Mongo_Actions";
import SubscriptionButton from "../Subscribe";

const RecorderRTC = () => {
  const [isRecording, setIsRecording] = useState(false);
  let [blob, setBlob] = useState(null);
  const [data, setData] = useState([]);
  const [voicestream, setVoicestream] = useState(null);
  const [recorder, setRecorder] = useState(null);

  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setVoicestream(stream);
        const newRecorder = new RecordRTC(stream, { type: "audio" });
        setRecorder(newRecorder);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
    getMedia();
  }, []);
  function getData() {
    try {
      AllActions.DatabaseExists().then((db) => {
        if (db) {
          AllActions.ReadData()
            .then((res) => {
              setData(res);
            })
            .catch((err) => console.log(err));
        } else {
          console.log("Database not found...");
        }
      });
    } catch (ex) {
      console.log("Error fetching data ", ex);
    }
  }
  useEffect(() => {
    getData();
  }, []);

  const startRecording = async () => {
    recorder.startRecording();
    setIsRecording(true);
  };
  const stopRecording = async () => {
    console.log("Stop recording..");
    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      setBlob(blob);
      saveNote(blob);
    });
  };
  async function registerSynch(tag) {
    if ("SyncManager" in window) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.sync
            .register(tag)
            .then(() => {
              console.log("Sync event waiting...");
            })
            .catch((error) => {
              console.error("Sync registration failed:", error);
            });
        })
        .catch((error) => {
          console.error("Service Worker not ready:", error);
        });
    }
  }
  const saveNote = (voiceData) => {
    const newTitle = prompt(":عنوان الملاحضة", "الملاحظة" + Date.now());
    if (newTitle != null) {
      voiceData.arrayBuffer().then((res) => {
        const uint8 = new Uint8Array(res);
        const audioContents = JSON.stringify(uint8);
        const savedObject = {
          _id: Date.now(),
          name: "n" + Date.now(),
          title: newTitle,
          audio: audioContents,
          status: "1",
        };

        DbActions.SaveToServer(savedObject)
          .then((response) => {
            if (response === null) {
              throw new Error("Error while saving to server...");
            }
            DbActions.Push({title: "ملاحضة جديدة", message: "تم اضافة بعض الملاحضات الجديدة"})
          })
          .catch((err) => {
            console.log(err);
            // "w" wating, means not saved to server yet server is down or no internet
            savedObject.status = "w";
            registerSynch("Waiting...");
          })
          .finally(() => {
            AllActions.InsertBulk([savedObject]);
            getData();
          });
      });
    }
    setIsRecording(false);
  };

  async function Delete(id) {
    var result = window.confirm("هل أنت متأكد من الحذف؟");

    if (result) {
      id = Number(id);
      try {
        const noteToDelete = await AllActions.ReadDataByID(id);
        if (!noteToDelete || noteToDelete.length === 0) {
          console.error("Not found");
          return;
        }

        const status = noteToDelete[0].status;
        if (status === "w") {
          await deleteFromLocal(id);
        } else {
          const response = await DbActions.DeleteFromServer(id);
          if (response?.ok) {
            await deleteFromLocal(id);
            await DbActions.Push({title: "ملاحضة جديدة", message: "تم حذف بعض الملاحضات الجديدة"})
            
          } else {
            // await AllActions.Update(id, { status: "0" });
            await DeleteOfline(id);
          }
        }
      } catch (error) {
        // server doun or no internet
        console.error("Error deleting note: ", error);
        // await AllActions.Update(id, { status: "0" });
        await DeleteOfline(id);
      } finally {
        getData();
      }
    }
  }
  async function DeleteOfline(id) {
    await AllActions.Update(id, { status: "0" });
    registerSynch("Waiting...");
  }
  async function deleteFromLocal(id) {
    await AllActions.DeleteById(id);
  }
  function Select(id) {
    AllActions.ReadDataByID(id).then((item) => {
      const obj = JSON.parse(item[0].audio);
      const data = Object.values(obj);
      const uint8Array = new Uint8Array(data); // تصحيح: Uint8Array بدلاً من uint8Array
      const blob = new Blob([uint8Array], { type: "audio/ogg; codecs=opus" }); // تصحيح: audio/ogg بدلاً من audio/088

      setBlob(blob);
    });
  }
  async function ManualSync() {
    try {
      const result = await DbActions.Sync();

      if (result) {
        alert("Result: " + result);
      }
    } catch (ex) {
      alert("لم يتم التصدير: " + ex);
    }
  }
  async function ImportNotes() {
    try {
      await DbActions.ImportFromServer();
      getData();

      alert("تم استيراد البيانات");
    } catch (error) {
      alert("حدث خطأ، من فضلك حاول مرة أخرى: " + error);
    }
  }

  return (
    <div>
      <h1>مسجل الملاحظات</h1>
      <SubscriptionButton>
      </SubscriptionButton>
      <div>
        <hr></hr>
        {data.map((item) => (
          <div className="item-row" key={item._id}>
            <div className="item-title">{item.title}</div>
            <div className="buttons-container">
              {/* <button className="delete-item" onClick={() => Delete(item._id)}>X</button> */}
              <button
                className="delete-item"
                value={item._id}
                onClick={(event) => Delete(event.target.value)}
              >
                X
              </button>
              <button
                className="selected-item"
                value={item._id}
                onClick={(event) => Select(event.target.value)}
              >
                O
              </button>
            </div>
          </div>
        ))}
        <hr></hr>
      </div>
      <main>
        <div className="voice-controls">
          <button onClick={startRecording} disabled={isRecording}>
            <i className="fa fa-microphone"></i>
            ابدأ التعديل
          </button>

          <button onClick={stopRecording} disabled={!isRecording}>
            <i className="fa fa-stop"></i>
            أوقف التعديل
          </button>

          <button onClick={ManualSync}>
            <i className="fa fa-paper-plane"></i>
            تصدير
          </button>
          <button onClick={ImportNotes}>
            <i className="fa fa-download"></i>
            استيراد من الخادم
          </button>
        </div>
        {blob && (
          <div className="voice-player">
            <audio src={URL.createObjectURL(blob)} controls />
          </div>
        )}
      </main>
    </div>
  );
};
export default RecorderRTC;
