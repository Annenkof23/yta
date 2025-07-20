document.addEventListener("DOMContentLoaded", function () {
    const sheetId = "1a0wZPIqrwQYR91kUX2oRgnKFgWJuy_U-qMDkfa9MR4g";
    const sheetName = "Тарифы";
    const apiKey = "AIzaSyBjkQ3At6u0EoA4PawDGWzFDRccVGPuCb4";
    const tariffsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!A2:C?key=${apiKey}`;

    let allTariffs = [];

    function renderTariffs(data) {
        const tableBody = document.getElementById("tariffs-table");
        tableBody.innerHTML = "";
        data.forEach(row => {
            const city = row[0] || "";
            const sum = row[2] || "";
            if (city && sum) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td>${city}</td><td>${sum}</td>`;
                tableBody.appendChild(tr);
            }
        });
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan='2'>Нет совпадений</td></tr>`;
        }
    }

    fetch(tariffsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            allTariffs = (data.values && Array.isArray(data.values)) ? data.values : [];
            renderTariffs(allTariffs);
        })
        .catch(error => {
            const tableBody = document.getElementById("tariffs-table");
            tableBody.innerHTML = `<tr><td colspan='2'>Ошибка загрузки тарифов</td></tr>`;
            console.error("Ошибка при загрузке тарифов:", error.message);
        });

    // Фильтрация по поиску
    const searchInput = document.getElementById('tariff-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const value = this.value.trim().toLowerCase();
            if (!value) {
                renderTariffs(allTariffs);
                return;
            }
            const filtered = allTariffs.filter(row => (row[0] || "").toLowerCase().includes(value));
            renderTariffs(filtered);
        });
    }
}); 