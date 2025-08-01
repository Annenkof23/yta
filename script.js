document.addEventListener("DOMContentLoaded", function () {
    const sheetId = "1a0wZPIqrwQYR91kUX2oRgnKFgWJuy_U-qMDkfa9MR4g";
    const sheetName = "Утя";
    const apiKey = "AIzaSyBjkQ3At6u0EoA4PawDGWzFDRccVGPuCb4";

    // Загружаем данные из конкретных ячеек
    const balanceUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!D2?key=${apiKey}`;
    const incomeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!E2?key=${apiKey}`;
    const invitedUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!F2?key=${apiKey}`;
    const inviteLinkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!C3:F3?key=${apiKey}`;
    const referralsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A6:F?key=${apiKey}`;

    console.log("Загружаем данные из Google Sheets...");

    // Функция для загрузки данных из одной ячейки
    function fetchCellData(url, defaultValue = "—") {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.values && data.values[0] && data.values[0][0]) {
                    return data.values[0][0];
                }
                return defaultValue;
            })
            .catch(error => {
                console.error("Ошибка при загрузке ячейки:", error.message);
                return defaultValue;
            });
    }

    // Функция для загрузки диапазона ячеек
    function fetchRangeData(url, defaultValue = "—") {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.values && data.values[0]) {
                    return data.values[0].join('').trim();
                }
                return defaultValue;
            })
            .catch(error => {
                console.error("Ошибка при загрузке диапазона:", error.message);
                return defaultValue;
            });
    }

    // Функция для загрузки таблицы рефералов
    function fetchReferralsData(url) {
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
                console.error("Ошибка при загрузке рефералов:", error.message);
                return [];
            });
    }

    // Загружаем все данные параллельно
    Promise.all([
        fetchCellData(balanceUrl),
        fetchCellData(incomeUrl),
        fetchCellData(invitedUrl),
        fetchRangeData(inviteLinkUrl),
        fetchReferralsData(referralsUrl)
    ])
    .then(([balance, expectedIncome, invitedCount, inviteLink, referrals]) => {
        console.log("Все данные загружены:", {
            balance,
            expectedIncome,
            invitedCount,
            inviteLink,
            referralsCount: referrals.length
        });

        // Обновляем интерфейс
        document.getElementById("balance").textContent = `${balance} ₽`;
        document.getElementById("expected-income").textContent = `${expectedIncome} ₽`;
        document.getElementById("invited-count").textContent = invitedCount;
        document.getElementById("invite-link").value = inviteLink;

        // Обновляем таблицу рефералов
        const tableBody = document.getElementById("referrals-table");
        tableBody.innerHTML = "";
        const applicationsBody = document.getElementById("applications-table");
        applicationsBody.innerHTML = "";

        // Списки статусов для фильтрации
        const mainStatuses = ["Создан", "Приглашен в хаб", "Активный"];
        // Исключаем 'Выплата получена' из applicationStatuses
        const applicationStatuses = ["Заявка создана", "Заявка обработана"];

        // Суммируем выплаты для каждой группы
        let mainSum = 0;
        let appSum = 0;

        referrals.forEach(row => {
            if (row.length >= 4) {
                const name = row[0] || "";
                const status = row[1] || "";
                const daysLeft = row[3] || "";
                const completedTasks = row[4] || ""; // Данные из столбца E
                // Корректно получаем выплаты даже если строка короче
                const paymentInfo = row.length >= 6 ? row[5] : "";

                // Преобразуем выплату в число
                let payment = 0;
                if (typeof paymentInfo === 'string') {
                    // Удаляем все пробелы, затем заменяем запятую на точку
                    payment = parseFloat(paymentInfo.replace(/\s/g, '').replace(',', '.')) || 0;
                } else if (typeof paymentInfo === 'number') {
                    payment = paymentInfo;
                }

                if (mainStatuses.includes(status)) {
                    mainSum += payment;
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td data-label="Имя">${name}</td>
                        <td data-label="Статус">${status}</td>
                        <td data-label="Выполнено зз">${completedTasks}</td>
                        <td data-label="Осталось дней">${daysLeft}</td>
                    `;
                    tableBody.appendChild(tr);
                } else if (applicationStatuses.includes(status)) {
                    // Исключаем из таблицы и суммы, если статус 'Выплата получена'
                    // (этот блок теперь не выполнится для 'Выплата получена')
                    appSum += payment;
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td data-label="Имя">${name}</td>
                        <td data-label="Статус">${status}</td>
                        <td data-label="Выплаты">${paymentInfo}</td>
                    `;
                    applicationsBody.appendChild(tr);
                }
                // Статус "Не лид" не отображаем нигде
            }
        });

        // Обновляем блоки с суммами
        document.getElementById("expected-income").textContent = mainSum.toLocaleString('ru-RU', {maximumFractionDigits: 2}) + " ₽";
        document.getElementById("balance").textContent = appSum.toLocaleString('ru-RU', {maximumFractionDigits: 2}) + " ₽";

        console.log("Данные успешно загружены и отображены");

        // === КОПИРОВАНИЕ ССЫЛКИ ===
        const copyBtn = document.getElementById('copy-invite');
        const inviteInput = document.getElementById('invite-link');
        if (copyBtn && inviteInput) {
            copyBtn.onclick = function () {
                // Для современных браузеров
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(inviteInput.value).then(() => {
                        copyBtn.classList.add('copied');
                        copyBtn.textContent = 'Скопировано!';
                        setTimeout(() => {
                            copyBtn.classList.remove('copied');
                            copyBtn.textContent = 'Скопировать';
                        }, 1200);
                    });
                } else {
                    // Для старых браузеров
                    inviteInput.select();
                    inviteInput.setSelectionRange(0, 99999);
                    try {
                        document.execCommand('copy');
                        copyBtn.classList.add('copied');
                        copyBtn.textContent = 'Скопировано!';
                        setTimeout(() => {
                            copyBtn.classList.remove('copied');
                            copyBtn.textContent = 'Скопировать';
                        }, 1200);
                    } catch (e) {
                        copyBtn.textContent = 'Ошибка';
                    }
                }
            }
        }
    })
    .catch(error => {
        console.error("Ошибка при загрузке данных:", error.message);
        alert("Не удалось загрузить данные. Проверьте подключение к интернету или таблицу.");
    });
});
