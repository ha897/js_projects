require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const http = require('http');

const port = process.env.SERVER_PORT;
const dbUrl = process.env.DATABASE_URL;

http.createServer(app);
app.set('trust proxy', true);

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

mongoose.connect(dbUrl);
const dbConnection = mongoose.connection;
dbConnection.on('error', (error) => console.log(error));
dbConnection.on('open', () => console.log('Connected to Database!'));

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

const DataSchema = new mongoose.Schema({
    id: Number,
    name: String,
    audio: Buffer,
    title: String,
    status: String
});

const Data = mongoose.model("Recording", DataSchema);
app.get("/api/data", async (req, res) => {
  try {
    const data = await Data.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Can not fetch data" });
  }
});


app.get("/api/data/:id", async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});


app.post("/api/data", async (req, res) => {
  try {
    const { name, audio, title, status } = req.body;

    if (!name || !audio || !title) {
      return res.status(400).json({ error: "Required fields missing: name, audio, title" });
    }

    const data = new Data({ name, audio, title, status });
    const saved = await data.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to add item" });
  }
});


app.put("/api/data/:id", async (req, res) => {
  try {
    const updated = await Data.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update item" });
  }
});


app.delete("/api/data/:id", async (req, res) => {
  try {
    const deleted = await Data.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});
const webPush = require('web-push');
// اذا معك اكسبرس قديم استخدم body-parser اصدار اقل من 4.16 اكتب السطرين التاليين:
//const bodyParser = require('body-parser');
//app.use(bodyParser.json());

const vapidKeys = {
    publicKey: 'BD-w4MIi-W2DFcID3705AvbIxYfVXqYEpnXez6Da6bhjQ8ne17PfzvREfkQLdESG1wV7LuHzGuowFPC7DLpDVeI',
    privateKey: 'pxHxxhBwWNG1Hm2FDlZlmgiYLBzrA_tJfqAHh21PTV4'
};

webPush.setVapidDetails(
    'mailto:your-email@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
// users subscripetions
let subscriptions = [];
// انشاء اشتراك
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
    console.log('Subscription received:', subscription);
});
// ارسال اشعار
app.post('/sendnotification', (req, res) => {
    const notificationPayload = JSON.stringify({
        title: req.body.title,
        body: req.body.message
    });

    Promise.all(
        subscriptions.map(subscription => webPush.sendNotification(subscription, notificationPayload))
    )
    .then(() => res.status(200).json({ message: 'Notification sent!' }))
    .catch(err => {
        console.error('Error sending notification:', err);
        res.sendStatus(500);
    });
});