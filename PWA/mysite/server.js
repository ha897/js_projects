const express = require("express");
const path = require("path");
// لفهم البينات المرسلة من المستخدم
const bodyParser = require("body-parser");
// ارسال الاشعارات للمتصفح
const webPush = require("web-push");

const app = express();
// افهم بينات جسون المرسلة من المستخدم
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, ".")));

const vapidKeys = {
  publicKey:
    "BIK1SZHHP16IJw92M1KvGz3wD_AzJEGF1qErZ8SSBLZkKRXz8Hb6E68xBZ92PwQH-cYV1vUfVQIornPfXFYpYuQ",
  privateKey: "vBoOL4oRUutCS01mPOKaK3jcEZkwgtCLgzuwAUNMvA0",
};

webPush.setVapidDetails(
  "mailto:your-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
// المشتركين الذين قبلة الاشعارات
let subscriptions = [];
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
})
// استقبال اسشتراك المستخدم
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
  console.log("New subscription added: ", subscription);
});

// ارسال اشعار لكل المشتركين
app.post("/send-notification", async (req, res) => {
  const notificationPayload = {
    notification: {
      title: "اشعار جديد",
      body: "هذا هو نص الاشعار",
      icon: "/icons/ico64.png",
    },
  };
    Promise.all(
      subscriptions.map((sub) =>
        webPush.sendNotification(sub, JSON.stringify(notificationPayload))
      )
    )
      .then(() => res.status(200).json({ message: "Notifications sent" }))
      .catch((err) => {
        console.error("Error sending notification, reason: ", err);
        res.sendStatus(500);
      });
});

app.listen(3000,()=>{
console.log("run on 3000")
})