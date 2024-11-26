document.getElementById("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  // Skip invalid rows
  let validRowIndex = jsonData.findIndex(row =>
    row.includes("Territory Name") ||
    row.includes("ZONE_NAME") ||
    row.includes("Item Name") ||
    row.includes("Product Name") ||
    row.includes("PRODUCT_NAME") ||
    row.includes("Sales") ||
    row.includes("QTY") ||
    row.includes("NET_QUANTITY")
  );

  if (validRowIndex === -1) {
    alert("No valid data found in the file");
    return;
  }

  jsonData = jsonData.slice(validRowIndex);
  const headers = jsonData.shift();

  const validData = jsonData.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  const columnMapping = headers.includes("Product Name") && headers.includes("Territory Name") && headers.includes("Sales")
    ? { item: "Product Name", territory: "Territory Name", qty: "Sales" }
    : headers.includes("Item Name") && headers.includes("Territory Name") && headers.includes("QTY")
    ? { item: "Item Name", territory: "Territory Name", qty: "QTY" }
    : headers.includes("PRODUCT_NAME") && headers.includes("ZONE_NAME") && headers.includes("NET_QUANTITY")
    ? { item: "PRODUCT_NAME", territory: "ZONE_NAME", qty: "NET_QUANTITY" }
    : null;

  if (!columnMapping) {
    alert("Unknown file format");
    return;
  }

  const items = [...new Set(validData.map(row => row[columnMapping.item]).filter(Boolean))].sort();
  const territories = [...new Set(validData.map(row => row[columnMapping.territory]).filter(Boolean))].sort();

  const itemSelect = $("#itemSelect").empty();
  const territorySelect = $("#territorySelect").empty();

  items.forEach(item => {
    itemSelect.append(new Option(item, item));
  });

  territories.forEach(territory => {
    territorySelect.append(new Option(territory, territory));
  });

  $(".select2").select2(); // تفعيل ميزة البحث داخل القوائم

  $("#filterButton").off("click").on("click", () => {
    const selectedItems = $("#itemSelect").val();
    const selectedTerritories = $("#territorySelect").val();

    const filteredData = validData.filter(row =>
      selectedItems.includes(row[columnMapping.item]) &&
      selectedTerritories.includes(row[columnMapping.territory])
    );

    const table = document.createElement("table");
    const headerRow = table.insertRow();
    [columnMapping.item, columnMapping.territory, columnMapping.qty].forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });

    filteredData.forEach(row => {
      const tableRow = table.insertRow();
      [columnMapping.item, columnMapping.territory, columnMapping.qty].forEach(col => {
        const td = tableRow.insertCell();
        td.textContent = row[col];
      });
    });

    const output = document.getElementById("output");
    output.innerHTML = "";
    output.appendChild(table);
  });
});
