/**
 * Pushbots Service Worker for ONVOR Web Push & Notification Automations
 */

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || payload.notification?.title || "ONVOR";
    const options = {
      body: payload.body || payload.message || payload.notification?.body || "",
      icon: payload.icon || "/onvor/logo.png",
      badge: payload.badge || "/onvor/icon-everyday.png",
      data: {
        url: payload.url || payload.click_action || payload.link || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("ONVOR", {
        body: text,
        icon: "/onvor/logo.png",
        data: { url: "/" },
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
