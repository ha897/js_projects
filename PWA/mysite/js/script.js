import { AddOperation, LoadHistory } from "/js/dbActions.js";
document.addEventListener("DOMContentLoaded", LoadHistory);
let btn = document.getElementById("btnAdd");
btn.addEventListener("click", add);
function add() {
  let n1 = Number(document.getElementById("n1").value);
  let n2 = Number(document.getElementById("n2").value);

  let d = Date.now();
  AddOperation(`${n1} + ${n2} = ${n1 + n2} (${d})`);

  alert(n1 + n2);
  fetch("/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
const publicKey = "BIK1SZHHP16IJw92M1KvGz3wD_AzJEGF1qErZ8SSBLZkKRXz8Hb6E68xBZ92PwQH-cYV1vUfVQIornPfXFYpYuQ";

document.getElementById("btnSubscribe").addEventListener("click", Subscribe);

async function Subscribe() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("المتصفح لا يدعم الاشعارات");
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      alert("لم يتم تسجيل عامل خدمة لهذا الموقع");
      return;
    }
    // طلب اذن من المستخدم
    const permission = await Notification.requestPermission();
// اذلا رفض المستخدم
    if (permission !== "granted") {
      console.error("Rejected permission");
      return;
    }
// ارسال رساله الاشتراك الى الخادم
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    await fetch("/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ؤساله تاكيد الاشتراك
      body: JSON.stringify(subscription),
    });

    console.log(subscription);

    console.log("subscription is done");
  } catch (error) {
    console.log("failed subscription: ", error);
  }
}
// تحول بيز64 الى مصفوفه من نوع Uint8Array مصفوفة ارقام صحيحة
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}