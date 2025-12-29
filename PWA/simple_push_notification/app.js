const express = require("express")
const path = require("path")
// const open = require('open');
const { exec } = require('child_process');
const webpush = require('web-push');
const bodyParser = require("body-parser");

const app = express()
const PORT = "3000"
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get("/",(req, res)=>{
    res.sendFile(path.join(__dirname,"index.html"))
})
app.get("/subscribe",(req, res)=>{

console.log(webpush.generateVAPIDKeys());

    res.sendFile(path.join(__dirname,"index.html"))
})
// Public Key:
// BHQhFebrzHA-ZZuhkx7LdwIzT1YUGaU0MIAhk8tGo_IRw8QnySPbOiWkmJCNf5Ff6FV-1IWFu0lBJVTee72c0zQ

// Private Key:
// kzEG2b4Pglvv8un-sWBC0ZsNTlu4uHKwkNY30Kt0M20
VAPID_PUBLIC_KEY =  "BHQhFebrzHA-ZZuhkx7LdwIzT1YUGaU0MIAhk8tGo_IRw8QnySPbOiWkmJCNf5Ff6FV-1IWFu0lBJVTee72c0zQ";
VAPID_PRIVATE_KEY = "kzEG2b4Pglvv8un-sWBC0ZsNTlu4uHKwkNY30Kt0M20";

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

app.use(bodyParser.json());

// تخزين الاشتراكات (يفضل DB لاحقًا)
const subscriptions = [];

app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }

  // حفظ الاشتراك
  subscriptions.push(subscription);

  console.log("New subscription saved:", subscription.endpoint);

  res.status(201).json({ success: true });
});


// test
app.post("/send-notification", async (req, res) => {

  const payload = JSON.stringify({
    title: "إشعار من السيرفر",
    body: "تم إرسال هذا الإشعار بنجاح 🚀",
  });

  try {
    await Promise.all(
      subscriptions.map(sub =>
        webpush.sendNotification(sub, payload)
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Push error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

function openUrlInBrowser(url) {
let command;
if (process.platform === 'win32') {
    command = `start ${url}`;
} else if (process.platform === 'darwin') {
    command = `open ${url}`;
} else {
    command = `xdg-open ${url}`;
}

exec(command, (error) => {
    if (error) {
        console.error('فشل في فتح المتصفح:', error);
    }
});
}

app.listen(PORT,()=>{
  console.log(`Server running on http://localhost:${PORT}`);
    // openUrlInBrowser(`http://127.0.0.1:${PORT}` );
})

