self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.message,
      icon: '/icon-192x192.png', // Add these if you have them, otherwise optional
      badge: '/badge-72x72.png', // Add these if you have them, otherwise optional
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
        url: data.url || '/dashboard'
      }
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  } else {
    event.waitUntil(clients.openWindow('/dashboard'))
  }
})
