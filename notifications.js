document.addEventListener("DOMContentLoaded", function () {
    const sheetId = "1a0wZPIqrwQYR91kUX2oRgnKFgWJuy_U-qMDkfa9MR4g";
    const sheetName = "Новости";
    const apiKey = "AIzaSyBjkQ3At6u0EoA4PawDGWzFDRccVGPuCb4";

    // URL для загрузки уведомлений
    const notificationsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A2:D?key=${apiKey}`;

    console.log("Загружаем уведомления из Google Sheets...");

    // Функция для загрузки уведомлений
    function fetchNotifications(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.values && Array.isArray(data.values)) {
                    return data.values;
                }
                return [];
            })
            .catch(error => {
                console.error("Ошибка при загрузке уведомлений:", error.message);
                return [];
            });
    }

    // Загружаем уведомления
    fetchNotifications(notificationsUrl)
        .then(notifications => {
            console.log("Уведомления загружены:", notifications.length);

            const notificationsList = document.querySelector('.notifications-list');
            const emptyNotifications = document.querySelector('.empty-notifications');

            if (notifications.length === 0) {
                // Показываем пустое состояние
                if (notificationsList) notificationsList.style.display = 'none';
                if (emptyNotifications) emptyNotifications.style.display = 'block';
            } else {
                // Показываем уведомления
                if (notificationsList) notificationsList.style.display = 'flex';
                if (emptyNotifications) emptyNotifications.style.display = 'none';

                // Очищаем существующие уведомления
                if (notificationsList) {
                    notificationsList.innerHTML = '';
                }

                // Добавляем уведомления
                notifications.forEach(notification => {
                    if (notification.length >= 4) {
                        const type = notification[0] || 'info';
                        const title = notification[1] || '';
                        const message = notification[2] || '';
                        const date = notification[3] || '';

                        const notificationItem = createNotificationItem(type, title, message, date);
                        if (notificationsList) {
                            notificationsList.appendChild(notificationItem);
                        }
                    }
                });
            }
        })
        .catch(error => {
            console.error("Ошибка при загрузке уведомлений:", error.message);
            // Показываем пустое состояние при ошибке
            const notificationsList = document.querySelector('.notifications-list');
            const emptyNotifications = document.querySelector('.empty-notifications');
            
            if (notificationsList) notificationsList.style.display = 'none';
            if (emptyNotifications) emptyNotifications.style.display = 'block';
        });

    // Функция для создания элемента уведомления
    function createNotificationItem(type, title, message, date) {
        const item = document.createElement('div');
        item.className = 'notification-item';

        const iconColors = {
            'info': '#0071e3',
            'success': '#34c759',
            'warning': '#ff9500',
            'error': '#ff3b30'
        };

        const iconPaths = {
            'info': '<path d="M12 2v20M2 12h20" stroke="' + iconColors[type] + '" stroke-width="1.5" stroke-linecap="round"/>',
            'success': '<path d="M9 12l2 2 4-4" stroke="' + iconColors[type] + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
            'warning': '<path d="M12 6v6l4 2" stroke="' + iconColors[type] + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
            'error': '<path d="M12 8v4M12 16h.01" stroke="' + iconColors[type] + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
        };

        item.innerHTML = `
            <div class="notification-icon">
                <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="${iconColors[type]}" stroke-width="2"/>
                    ${iconPaths[type]}
                </svg>
            </div>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
                <span class="notification-date">${date}</span>
            </div>
        `;

        return item;
    }
}); 