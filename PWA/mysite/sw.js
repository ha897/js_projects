const CACHE_NAME = "CalculatorCache-v1.1";
 
self.addEventListener("install", installHandler);
self.addEventListener("activate", activateHandler);
self.addEventListener("fetch", fetchHandler);

async function installHandler(event) {
  console.log("installing..." + Date.now());
  //   حفظ الموارد في الكاش والتاكد من انها تم حفظها قبل انتهاء حدث التثبيت
  event.waitUntil(AddResources());
}
async function activateHandler(event) {
  event.waitUntil(deleteAllKeys());
}

async function getResponse(event) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(event.request);

  if (response && response.ok) {
    return response;
  }else{    
    return tryFetchFromNetwork(event, cache)
  }
}
function createNotFoundPage() {
    const html = "<html>" +
        "<head><title>Custom response</title></head>" +
        "<body>" +
        "<h1>Hello from service worker!</h1>" +
        "<a href='/index.html'>Home</a>" +
        "</body>" +
        "</html>";

    let htmlRes = new Response(html, { headers: { 'Content-Type': 'text/html' } });
    return htmlRes;
}

async function tryFetchFromNetwork(event, cache) {
    try{
        const response = await fetch(event.request);
        if (response && response.ok) {
            cache.put(event.request, response.clone());
            return response;
        }else{
            //
            return createNotFoundPage();
        }
    }catch(error){
//
return createNotFoundPage();
    }
}


async function fetchHandler(event) {
  //   console.log(event.request);
  event.respondWith(getResponse(event));

}

async function AddResources() {
  const cache = await caches.open(CACHE_NAME);
  // العناوين المراد حفضها بالكاش
  // اذا كان مورد واحد غؤير موجود لن يحفض شيء
  await cache.addAll([
    // الملوارد التي هي يمكن ان توضع بعد الرابط فيضهر محتواها
    "/",
    "/index.html",
    "/images/HsoubAcademy.png",
    "/icons/ico256.png",
    "/manifest.json",
    "/about.html",
    "/styles/style.css",
    "/js/script.js",
    "/js/dbActions.js",
    "/js/dexie.js"
  ]);
}
async function deleteAllKeys() {
    try {
        const keys = await caches.keys();
        await Promise.all(
            keys.map(async (key) => {
                if (key !== CACHE_NAME) {
                    try {
                        await caches.delete(key);
                    } catch (error) {
                        console.error(`Failed to delete cache: ${key}`, error);
                    }
                }
            })
        );
    } catch (error) {
        console.error("Error during cache cleanup", error);
    }
}

self.addEventListener("sync", syncHandler);

function syncHandler(event) {
    if (event.tag == "add") {
        console.log('Start syncing...');
    }
}

self.addEventListener('push', pushHandler);

function pushHandler(event) {
    var data = {title: 'إشعار جديد', body: 'أثم نشر بيانات جديدة'};

    if(event.data){
        data = JSON.parse(event.data.text());
    }

    self.registration.showNotification(data.notification.title, {
        body: data.notification.body,
        icon: data.notification.icon,
    });
}