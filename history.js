document.addEventListener("DOMContentLoaded", function () {
    const sheetId = "1a0wZPIqrwQYR91kUX2oRgnKFgWJuy_U-qMDkfa9MR4g";
    const sheetName = "Утя";
    const apiKey = "AIzaSyBjkQ3At6u0EoA4PawDGWzFDRccVGPuCb4";
    const referralsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A6:F?key=${apiKey}`;

    fetch(referralsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById("history-table");
            const summary = document.getElementById("history-summary");
            tableBody.innerHTML = "";
            let total = 0;
            if (data.values && Array.isArray(data.values)) {
                data.values.forEach(row => {
                    const name = row[0] || "";
                    const status = row[1] || "";
                    const paymentInfo = row.length >= 6 ? row[5] : "";
                    if (status === "Выплата получена" && name && paymentInfo) {
                        // Преобразуем выплату в число
                        let payment = 0;
                        if (typeof paymentInfo === 'string') {
                            payment = parseFloat(paymentInfo.replace(/\s/g, '').replace(',', '.')) || 0;
                        } else if (typeof paymentInfo === 'number') {
                            payment = paymentInfo;
                        }
                        total += payment;
                        const tr = document.createElement("tr");
                        tr.innerHTML = `<td>${name}</td><td>${paymentInfo}</td>`;
                        tableBody.appendChild(tr);
                    }
                });
            }
            summary.textContent = `Всего выплачено: ${total.toLocaleString('ru-RU', {maximumFractionDigits: 2})} ₽`;
            if (tableBody.innerHTML === "") {
                tableBody.innerHTML = `<tr><td colspan='2'>Нет данных</td></tr>`;
            }
        })
        .catch(error => {
            const tableBody = document.getElementById("history-table");
            tableBody.innerHTML = `<tr><td colspan='2'>Ошибка загрузки истории</td></tr>`;
            console.error("Ошибка при загрузке истории выплат:", error.message);
        });
}); 