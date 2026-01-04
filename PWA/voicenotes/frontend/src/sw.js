import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import DbActions from "./components/database_action/Mongo_Actions"
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  // (request) => request.destination === 'document',
  ({request}) => true,
  new StaleWhileRevalidate({
    cacheName: 'html-cache',
  })
)

self.addEventListener("sync", synchandler);

async function synchandler(event) {
    if (event.tag == "Waiting...") {
        console.log("Syncing...");
    }

    try {
        await DbActions.Sync();
        console.log("Sync operation successful!");
                    DbActions.Push({title: "حدث تغييرات بالملاحضات", message: "تم اجراء بعض التغييرات على الملاحضات"})
        
    } catch (error) {
        console.log("Sync failed, retrying sync after 10 seconds...", error);
        
        setTimeout(async () => {
            try {
                await self.registration.sync.register("Waiting...");
                console.log("Sync re-registered successfully!");
            } catch (regError) {
                console.error("Failed to re-register sync:", regError);
            }
        }, 10000);
    }
}
// 
self.addEventListener('push', pushHandler);

function pushHandler(event) {
    var data = { 
        title: 'إشعار جديد', 
        body: 'تم نشر بيانات جديدة' 
    };

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    self.registration.showNotification(data.title, {
        body: data.body,
    });
}
