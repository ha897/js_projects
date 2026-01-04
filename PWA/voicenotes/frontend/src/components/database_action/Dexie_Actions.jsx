import Dexie from "dexie";

const AllActions = {};

const INDEXEDDB_NAME = "VoicedB";

const TABLES = {
  recordings: {
    tableName: "recordings",
    columns: {
      _id: "_id",
      name: "name",
      title: "title",
      audion: "audio",
      status: "status",
    },
  },
};

AllActions.OpenDb = function OpenDatabase() {
  const db = new Dexie(INDEXEDDB_NAME);
  db.version(1).stores({ recordings: "_id, status" });
  return db;
};
AllActions.InsertBulk = async function (data) {
  let db;
  try {
    db = AllActions.OpenDb();
    const rec = db.table(TABLES.recordings.tableName);
    await rec.bulkPut(data);
    // db.close();
  } catch (ex) {
    console.log("error insert bulk", ex);
    throw ex;
  } finally {
    if (db) {
      db.close();
    }
  }
};
AllActions.DatabaseExists = async function () {
  return Dexie.exists(INDEXEDDB_NAME);
};
AllActions.ReadData = async function () {
  const db = AllActions.OpenDb();
  const rec = db.table(TABLES.recordings.tableName);
  const result = await rec
    .orderBy("_id")
    .and((item) => item.status !== "0")
    .toArray();
  db.close();
  return result;
};
AllActions.ReadDataByID = async function (id) {
  const db = AllActions.OpenDb();
  const rec = db.table(TABLES.recordings.tableName);
  const result = await rec
    .where(TABLES.recordings.columns._id)
    .equals(Number(id))
    .toArray();
  db.close();
  return result;
};
AllActions.ReadDataByStatus = async function (status) {
  const db = AllActions.OpenDb();
  const rec = db.table(TABLES.recordings.tableName);
  const result = await rec
    .where(TABLES.recordings.columns.status)
    // myOf
    .anyOf(status)
    .toArray();
  db.close();
  return result;
};
  AllActions.DeleteByStatus = async function (status) {
    let db;
    try {
        db = AllActions.OpenDb();
        const rec = db.table(TABLES.recordings.tableName);
        await rec.where("status").equals(status).delete();
    } catch (ex) {
        console.log("Error delete...", ex);
        throw ex;
    } finally {
        if (db) {
            db.close();
        }
    }
}
AllActions.DeleteById = async function (id) {
  let db;
  try {
    db = AllActions.OpenDb();
    const rec = db.table(TABLES.recordings.tableName);
    await rec.delete(id);
    console.log("Delated.");
  } catch (ex) {
    console.log("Error delete...", ex);
    throw ex;
  } finally {
    if (db) {
      db.close();
    }
  }
};
AllActions.Update = async function (id, newData){
    let db;
    try {
        db = AllActions.OpenDb()
        const rec = db.table(TABLES.recordings.tableName)
        await rec.update(id, newData)
    }
    catch (ex) {
        console.log("Error update.. ", ex)
        throw ex;
    }
    finally {
        if (db) {
            db.close();
        }
    }
}
export default AllActions;
