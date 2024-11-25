document.getElementById('upload-file').addEventListener('change', handleFileUpload);

let workbookData = null;

function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        workbookData = workbook;

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        displayColumns(json[0]);
        displayRows(json.slice(1));
    };

    reader.readAsArrayBuffer(file);
}

function displayColumns(columns) {
    const columnSelection = document.getElementById('column-selection');
    columnSelection.innerHTML = '<h3>Select Columns:</h3>';
    columns.forEach((col, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `col-${index}`;
        checkbox.value = col;

        const label = document.createElement('label');
        label.htmlFor = `col-${index}`;
        label.textContent = col;

        columnSelection.appendChild(checkbox);
        columnSelection.appendChild(label);
        columnSelection.appendChild(document.createElement('br'));
    });
}

function displayRows(rows) {
    const rowSelection = document.getElementById('row-selection');
    rowSelection.innerHTML = '<h3>Select Rows:</h3>';
    rows.forEach((row, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `row-${index}`;
        checkbox.value = index;

        const label = document.createElement('label');
        label.htmlFor = `row-${index}`;
        label.textContent = `Row ${index + 1}`;

        rowSelection.appendChild(checkbox);
        rowSelection.appendChild(label);
        rowSelection.appendChild(document.createElement('br'));
    });
}

document.getElementById('apply-filters').addEventListener('click', () => {
    const selectedColumns = [];
    document.querySelectorAll('#column-selection input:checked').forEach(col => {
        selectedColumns.push(col.value);
    });

    const selectedRows = [];
    document.querySelectorAll('#row-selection input:checked').forEach(row => {
        selectedRows.push(parseInt(row.value));
    });

    const sheetName = workbookData.SheetNames[0];
    const sheet = workbookData.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const filteredData = selectedRows.map(rowIndex => {
        return selectedColumns.map(col => json[rowIndex + 1][json[0].indexOf(col)]);
    });

    const resultDiv = document.getElementById('filtered-results');
    resultDiv.innerHTML = '<h3>Filtered Data:</h3>' + JSON.stringify(filteredData, null, 2);
});