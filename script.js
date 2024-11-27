let data = [];
let columnMap = {};

document.getElementById('file-input').addEventListener('change', handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            processSheetData(sheetData);
        };
        reader.readAsBinaryString(file);
    }
}

function processSheetData(sheetData) {
    const firstValidRow = sheetData.findIndex(row => Array.isArray(row) && row.some(cell => cell));
    const headers = sheetData[firstValidRow];
    data = sheetData.slice(firstValidRow + 1).map(row =>
        row.reduce((acc, value, index) => {
            acc[headers[index]] = value;
            return acc;
        }, {})
    );

    columnMap = mapColumns(headers);
    populateFilters(data, columnMap);

    document.getElementById('filter-container').style.display = 'block';
}

function mapColumns(headers) {
    const mappings = {
        'Territory Name': 'territory',
        'ZONE_NAME': 'territory',
        'Product Name': 'product',
        'Item Name': 'product',
        'PRODUCT_NAME': 'product',
        'Sales': 'sales',
        'QTY': 'sales',
        'NET_QUANTITY': 'sales'
    };

    return headers.reduce((map, header) => {
        if (mappings[header]) map[mappings[header]] = header;
        return map;
    }, {});
}

function populateFilters(data, columns) {
    const territories = [...new Set(data.map(row => row[columns.territory]).filter(Boolean))].sort();
    const products = [...new Set(data.map(row => row[columns.product]).filter(Boolean))].sort();

    populateDropdown('territory-dropdown', territories);
    populateDropdown('product-dropdown', products);

    setupDropdownSearch('territory-dropdown');
    setupDropdownSearch('product-dropdown');
}

function populateDropdown(id, items) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '<option disabled>Search</option>';
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
}

function setupDropdownSearch(dropdownId) {
    const dropdown = document.getElementById(dropdownId);

    dropdown.addEventListener('click', (event) => {
        if (event.target.textContent === 'Search') {
            enableSearchMode(dropdown);
        }
    });
}

function enableSearchMode(dropdown) {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Type to search...';
    searchInput.style.width = '100%';

    dropdown.style.display = 'none';
    dropdown.parentNode.insertBefore(searchInput, dropdown);

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        Array.from(dropdown.options).forEach(option => {
            if (option.textContent.toLowerCase().includes(searchTerm) || option.textContent === 'Search') {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });

    searchInput.addEventListener('blur', () => {
        searchInput.remove();
        dropdown.style.display = 'block';
    });
}

document.getElementById('filter-btn').addEventListener('click', filterData);

function filterData() {
    const selectedTerritories = getSelectedDropdownValues('territory-dropdown');
    const selectedProducts = getSelectedDropdownValues('product-dropdown');

    const filtered = data.filter(row =>
        selectedTerritories.includes(row[columnMap.territory]) &&
        selectedProducts.includes(row[columnMap.product])
    );

    displayFilteredData(filtered);
}

function getSelectedDropdownValues(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    return Array.from(dropdown.selectedOptions).map(option => option.value);
}

function displayFilteredData(filteredData) {
    const table = document.getElementById('filtered-data-table');
    const tbody = table.querySelector('tbody');

    tbody.innerHTML = '';
    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row[columnMap.territory]}</td>
            <td>${row[columnMap.product]}</td>
            <td>${row[columnMap.sales]}</td>
        `;
        tbody.appendChild(tr);
    });

    table.style.display = 'table';
}