document.addEventListener("DOMContentLoaded", () => {
  $(".select2").select2();

  const columnMapping = {
    PharmaOverseas: { territory: "Territory Name", product: "Product Name", qty: "Sales" },
    Ibnsina: { territory: "Territory Name", product: "Item Name", qty: "QTY" },
    ABOUKIR: { territory: "ZONE_NAME", product: "PRODUCT_NAME", qty: "NET_QUANTITY" },
  };

  let sheetData = [];

  document.getElementById("fileInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headers = data[0];
      const distributor = detectDistributor(headers);
      const mapping = columnMapping[distributor];

      if (!mapping) {
        alert("Unknown distributor type.");
        return;
      }

      sheetData = data.slice(1).map((row) => ({
        territory: row[headers.indexOf(mapping.territory)] || "",
        product: row[headers.indexOf(mapping.product)] || "",
        qty: row[headers.indexOf(mapping.qty)] || 0,
      }));

      populateDropdowns(sheetData);
    };
    reader.readAsBinaryString(file);
  });

  function detectDistributor(headers) {
    if (headers.includes("Territory Name") && headers.includes("Product Name")) return "PharmaOverseas";
    if (headers.includes("Territory Name") && headers.includes("Item Name")) return "Ibnsina";
    if (headers.includes("ZONE_NAME") && headers.includes("PRODUCT_NAME")) return "ABOUKIR";
    return "";
  }

  function populateDropdowns(data) {
    const territories = [...new Set(data.map((d) => d.territory).filter(Boolean))].sort();
    const products = [...new Set(data.map((d) => d.product).filter(Boolean))].sort();

    $("#territorySelect").html(territories.map((t) => `<option>${t}</option>`));
    $("#productSelect").html(products.map((p) => `<option>${p}</option>`));
  }

  document.getElementById("filterButton").addEventListener("click", () => {
    const selectedTerritories = $("#territorySelect").val();
    const selectedProducts = $("#productSelect").val();

    const results = sheetData.filter(
      (row) =>
        selectedTerritories.includes(row.territory) &&
        selectedProducts.includes(row.product)
    );

    displayResults(results);
  });

  function displayResults(data) {
    const table = document.getElementById("results");
    table.innerHTML = `
      <tr>
        <th>Territory</th>
        <th>Product</th>
        <th>Quantity</th>
      </tr>
    `;

    data.forEach((row) => {
      table.innerHTML += `
        <tr>
          <td>${row.territory}</td>
          <td>${row.product}</td>
          <td>${row.qty}</td>
        </tr>
      `;
    });
  }
});
