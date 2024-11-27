document.getElementById('file-upload').addEventListener('change', handleFile);

let data = [];
let columnMap = {};

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        handleHeader(rows);
    };
    reader.readAsBinaryString(file);
}

function handleHeader(rows) {
    // Skip merged headers if present
    const headerRowIndex = rows.findIndex(row => row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('territory')));
    if (headerRowIndex === -1) {
        alert('Invalid file format!');
        return;
    }

    data = rows.slice(headerRowIndex + 1);

    // Dynamically detect column names
    columnMap = detectColumns(rows[headerRowIndex]);
    populateFilters(data, columnMap);
}

function detectColumns(headerRow) {
    const map = {};
    headerRow.forEach((col, index) => {
        if (/territory/i.test(col)) map.territory = index;
        if (/product|item/i.test(col)) map.product = index;
        if (/sales|qty|quantity/i.test(col)) map.sales = index;
    });
    return map;
}

function populateFilters(data, columns) {
    const territories = [...new Set(data.map(row => row[columns.territory]).filter(Boolean))].sort();
    const products = [...new Set(data.map(row => row[columns.product]).filter(Boolean))].sort();

    populateDropdown('territory', territories);
    populateDropdown('product', products);
}

function populateDropdown(id, items) {
    const select = document.getElementById(id);
    select.innerHTML = '';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

document.getElementById('filter-btn').addEventListener('click', filterData);

function filterData() {
    const selectedTerritories = Array.from(document.getElementById('territory').selectedOptions).map(option => option.value);
    const selectedProducts = Array.from(document.getElementById('product').selectedOptions).map(option => option.value);

    const filtered = data.filter(row =>
        selectedTerritories.includes(row[columnMap.territory]) &&
        selectedProducts.includes(row[columnMap.product])
    );

    displayFilteredData(filtered);
}

function displayFilteredData(filteredData) {
    const table = document.getElementById('filtered-data');
    const headerRow = `<tr>
        <th>Territory</th>
        <th>Product</th>
        <th>Sales</th>
    </tr>`;
    const rows = filteredData.map(row =>
        `<tr>
            <td>${row[columnMap.territory]}</td>
            <td>${row[columnMap.product]}</td>
            <td>${row[columnMap.sales]}</td>
        </tr>`
    ).join('');
    table.innerHTML = `<thead>${headerRow}</thead><tbody>${rows}</tbody>`;
}