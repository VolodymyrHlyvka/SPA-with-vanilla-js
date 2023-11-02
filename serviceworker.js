const version = 1;
let isOnline = true;
let cacheName = `coffe-shop-${version}`;

const urlsToCache = {
  loggedOut: [],
  loggedIn: [
    "/",
    "/index.html",
    "/serviceworker.js",
    "/app.webmanifest",
    "/data/menu.json",
    "/styles.css",
    "/app.js",
    "/data/images/blackamericano.png",
    "/data/images/blacktea.png",
    "/data/images/cappuccino.png",
    "/data/images/coldbrew.png",
    "/data/images/croissant.png",
    "/data/images/flatwhite.png",
    "/data/images/frappuccino.png",
    "/data/images/greentea.png",
    "/data/images/icedcoffee.png",
    "/data/images/macchiato.png",
    "/data/images/muffin.png",
    "/images/icons/icon.png",
    "/images/logo.svg",
    "/components/CartItem.js",
    "/components/DetailsPage.css",
    "/components/DetailsPage.js",
    "/components/MenuPage.css",
    "/components/MenuPage.js",
    "/components/OrderPage.js",
    "/components/ProductItem.js",
    "/services/API.js",
    "/services/Menu.js",
    "/services/Order.js",
    "/services/Router.js",
    "/services/SW.js",
    "/services/Store.js",
  ],
};

self.addEventListener("install", function callback() {
  console.log(`SW install ${version}`);
  self.skipWaiting();
});

self.addEventListener("activate", function callback(event) {
  console.log(`SW activate ${version}`);
  event.waitUntil(handleActivation());
});

self.addEventListener("message", onMessage);

self.addEventListener("fetch", onFetch);

self.addEventListener("sync", function (event) {
  console.log("here");
  if (event.tag === "formSync") {
    event.waitUntil(submitFormData());
  }
});

async function submitFormData() {
  let index;

  const indexedDBOpenRequest = indexedDB.open("order", 1);
  indexedDBOpenRequest.onsuccess = async function callback() {
    let db = indexedDBOpenRequest.result;
    let transaction = db.transaction("order_requests", "readwrite");
    let storeObj = transaction.objectStore("order_requests");
    // const cursorRequest = storeObj.openCursor();

    const getAllRequests = storeObj.getAll();

    getAllRequests.onsuccess = function (event) {
      const values = event.target.result;
      console.log("values", values);
      values.forEach(async function createOrder(user) {
        const userObj = JSON.parse(user);
        try {
          console.log(`Thanks for your order ${userObj.name} from sw.`);
          // TODO Send the data to the server
          // if success storeObj.delete(index);
        } catch (err) {
          console.log(err);
        }
      });
    };

    // cursorRequest.onsuccess = function callback(evt) {
    //   const cursor = evt.target.result;
    //   sendUser(cursor);
    // };

    // async function sendUser(cursor) {
    //   if (cursor) {
    //     formData = cursor.value;
    //     index = cursor.key;
    //     // try {
    //     //   let response = await fetch("https://httpbin.org/post", {
    //     //     method: "POST",
    //     //     body: JSON.stringify(formData),
    //     //   });

    //     //   if (response.status === 200) {
    //     //     storeObj.delete(index);
    //     //   } else {
    //     //     setMessage("Something go wrong inside SW");
    //     //   }
    //     // } catch (err) {
    //     //   console.log(err);
    //     // }
    //     if (transaction.active) {
    //       cursor.continue();
    //     } else {
    //       console.log("Transaction has finished");
    //     }
    //   } else {
    //     transaction.commit();
    //     db.close();
    //   }
    // }
  };

  indexedDBOpenRequest.onerror = function callback(error) {
    console.error("IndexedDB error:", error);
  };
}

main().catch(console.error);

async function main() {
  console.log(`SW starting ${version}`);
  await sendMessage({ requestStatusUpdate: true });
  await cacheFiles();
}

async function sendMessage(msg) {
  let allClients = await clients.matchAll({ includeUncontrolled: true });
  return Promise.all(
    allClients.map(function callback(client) {
      let chan = new MessageChannel();
      chan.port1.onmessage = onMessage;
      client.postMessage(msg, [chan.port2]);
    })
  );
}

function onMessage({ data }) {
  if (data.statusUpdate) {
    ({ isOnline } = data.statusUpdate);
    console.log("Service worker status update", isOnline);
  }
}

async function handleActivation() {
  await clearCaches();
  await clients.claim();
  await cacheFiles(true);
}

async function clearCaches() {
  let cacheNames = await caches.keys();
  let oldCacheNames = cacheNames.filter(function callback(name) {
    return name !== cacheName;
  });

  return Promise.all(
    oldCacheNames.map(function callback(name) {
      return caches.delete(name);
    })
  );
}

async function cacheFiles(forceReload = false) {
  let cache = await caches.open(cacheName);

  return Promise.all(
    urlsToCache.loggedIn.map(async function callback(url) {
      try {
        let res;
        if (!forceReload) {
          res = await cache.match(url);
          if (res) {
            return res;
          }
        }
        let fetchOptions = {
          method: "GET",
          credentials: "omit",
          cache: "no-cache",
        };
        res = await fetch(url, fetchOptions);
        if (res.ok) {
          await cache.put(url, res);
        }
      } catch (e) {
        console.log(e);
      }
    })
  );
}

function onFetch(evt) {
  evt.respondWith(router(evt.request));
}

async function router(req) {
  var url = new URL(req.url);
  var reqURL = url.pathname;
  var cache = await caches.open(cacheName);

  // request for site's own URL?
  // if (url.origin == location.origin) {
  if (/^.*api.*$/.test(url)) {
    let fetchOptions = {
      credentials: "same-origin",
      cache: "no-store",
    };
    let res = await safeRequest(
      reqURL,
      req,
      fetchOptions,
      /*cacheResponse=*/ false,
      /*checkCacheFirst=*/ false,
      /*checkCacheLast=*/ true,
      /*useRequestDirectly=*/ true
    );
    if (res) {
      if (req.method == "GET") {
        await cache.put(reqURL, res.clone());
      }

      return res;
    }
    return notFoundResponse();
  }
  // all other files use "cache-first"
  else {
    let fetchOptions = {
      method: req.method,
      headers: req.headers,
      cache: "no-store",
    };
    let res = await safeRequest(
      reqURL,
      req,
      fetchOptions,
      /*cacheResponse=*/ true,
      /*checkCacheFirst=*/ true
    );
    if (res) {
      return res;
    }

    // otherwise, force a network-level 404 response
    return notFoundResponse();
  }
}
// }

// set different strategies
async function safeRequest(
  reqURL,
  req,
  options,
  cacheResponse = false,
  checkCacheFirst = false,
  checkCacheLast = false,
  useRequestDirectly = false
) {
  var cache = await caches.open(cacheName);
  var res;

  if (checkCacheFirst) {
    res = await cache.match(reqURL);
    if (res) {
      return res;
    }
  }

  if (isOnline) {
    try {
      if (useRequestDirectly) {
        res = await fetch(req, options);
      } else {
        res = await fetch(req.url, options);
      }

      // page redirect
      if (res && (res.ok || res.type == "opaqueredirect")) {
        if (cacheResponse) {
          await cache.put(reqURL, res.clone());
        }
        return res;
      }
    } catch (err) {}
  }

  if (checkCacheLast) {
    res = await cache.match(reqURL);
    if (res) {
      return res;
    }
  }
}

function notFoundResponse() {
  return new Response("", {
    status: 404,
    statusText: "Not found",
  });
}
