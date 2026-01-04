import { useState } from "react";

const subscribe_url = import.meta.env.VITE_APP_SUBSCRIBE_URL;

const SubscriptionButton = () => {
  const publicKey ="BD-w4MIi-W2DFcID3705AvbIxYfVXqYEpnXez6Da6bhjQ8ne17PfzvREfkQLdESG1wV7LuHzGuowFPC7DLpDVeI";
  async function Subscribe() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Service Worker or Push Messaging is not supported");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        alert("Service Worker not registered! Please refresh the page.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.error("Rejected permission");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await fetch(subscribe_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
      console.log(subscription);
      alert("...تم الإشتراك بنجاح");
    } catch (error) {
        alert("Failed to subscribe the user: " + error);
    }
  }
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
return (
    <button onClick={()=>Subscribe()}>الاشتراك بالاشعارات</button>
)
};

export default SubscriptionButton;