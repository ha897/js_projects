self.addEventListener("install", (event) => {
  try {
    event.waitUntil(
      caches.open("test_v1").then((cache) => {
        return cache.addAll([
          "/",
          "/index.html",
              '/manifest.json',
          "../app.js",
        ]);
      })
    );
  } catch (error) {
    return createNotFoundPage();
  }
});

async function getFromCache(event, cache) {
  console.log(cache);
  const response = await cache.match(event.request);
  console.log(response);
  if (response && response.ok) {
    return response;
  }
}

// async function tryFetchFromNetwork(event, cache) {
//     try{
//         const response = await fetch(event.request);
//         if (response && response.ok) {
//             cache.put(event.request, response.clone());
//             return response;
//         }else{
//             //
//             return createNotFoundPage();
//         }
//     }catch(error){
// //
// return createNotFoundPage();
//     }
// }
function createNotFoundPage() {
  const html =
    "<html>" +
    "<head><title>Custom response</title></head>" +
    "<body>" +
    "<h1>Hello from service worker!</h1>" +
    "<a href='/index.html'>Home</a>" +
    "</body>" +
    "</html>";

  let htmlRes = new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
  return htmlRes;
}

async function set_response(event) {
  const cache = await caches.open("test_v1");

  const response = await getFromCache(event, cache);
  if (response !== undefined) {
    return response;
  } else {
    try {
      const netResponse = await fetch(event.request);
      return netResponse;
    } catch (error) {
      return createNotFoundPage();
    }
    // return await tryFetchFromNetwork(event, cache);
  }
}
self.addEventListener("fetch", (event) => {
  event.respondWith(set_response(event));
});

self.addEventListener("sync", (event) => {
  console.log("Sync event fired:", event.tag);
});

self.addEventListener("push", pushHandler);

function pushHandler(event) {
  var data = { title: "إشعار جديد", body: "أثم نشر بيانات جديدة" };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
    })
  );
}
