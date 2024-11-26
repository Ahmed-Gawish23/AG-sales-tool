document.getElementById("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  const items = [...new Set(jsonData.map(row => row["Item Name"]))];
  const territories = [...new Set(jsonData.map(row => row["Territory Name"]))];

  const itemSelect = document.getElementById("itemSelect");
  const territorySelect = document.getElementById("territorySelect");

  // Populate item dropdown
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    itemSelect.appendChild(option);
  });

  // Populate territory dropdown
  territories.forEach(territory => {
    const option = document.createElement("option");
    option.value = territory;
    option.textContent = territory;
    territorySelect.appendChild(option);
  });

  document.getElementById("applyFilter").addEventListener("click", () => {
    const selectedItems = Array.from(itemSelect.selectedOptions).map(option => option.value);
    const selectedTerritories = Array.from(territorySelect.selectedOptions).map(option => option.value);

    const filteredData = jsonData.filter(row =>
      selectedItems.includes(row["Item Name"]) &&
      selectedTerritories.includes(row["Territory Name"])
    );

    // Aggregate QTY by Item and Territory
    const result = {};
    filteredData.forEach(row => {
      const key = `${row["Item Name"]} - ${row["Territory Name"]}`;
      if (!result[key]) result[key] = 0;
      result[key] += row["QTY"];
    });

    // Display results
    const output = document.getElementById("output");
    output.innerHTML = "<h3>Filtered Results:</h3>";
    Object.entries(result).forEach(([key, qty]) => {
      const p = document.createElement("p");
      p.textContent = `${key}: ${qty} boxes`;
      output.appendChild(p);
    });
  });
});