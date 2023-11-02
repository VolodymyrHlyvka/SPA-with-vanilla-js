let isOnline = "onLine" in navigator ? navigator.onLine : true;
let swWorker;

window.addEventListener("online", function callback() {
  console.log("go online");
  isOnline = true;
  sendSwStatusUpdate();
});

window.addEventListener("offline", function callback() {
  console.log("go offline");
  isOnline = false;
  sendSwStatusUpdate();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function callback() {
    navigator.serviceWorker
      .register("./serviceworker.js", { updateViaCache: "none" })
      .then((registration) => {
        console.log("SW registered: ", registration);
        swWorker =
          registration.installing ||
          registration.waiting ||
          registration.active;

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          function callback() {
            swWorker = navigator.serviceWorker.controller;
            sendSwStatusUpdate(swWorker);
          }
        );

        navigator.serviceWorker.addEventListener(
          "message",
          function callback(event) {
            const { data } = event;
            if (data.requestStatusUpdate) {
              console.log("receive status update request from sw");
              sendSwStatusUpdate(event.ports && event.ports[0]);
            }
          }
        );
      })
      .catch(function callback(registrationError) {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

function sendSwStatusUpdate(target) {
  sendSwMessage({ statusUpdate: { isOnline } }, target);
}

function sendSwMessage(msg, target) {
  if (target) {
    target.postMessage(msg);
  } else if (swWorker) {
    swWorker.postMessage(msg);
  } else {
    navigator.serviceWorker.controller.postMessage(msg);
  }
}
