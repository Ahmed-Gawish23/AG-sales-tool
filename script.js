document.addEventListener("DOMContentLoaded", () => {
    $(".select2").select2();

    const distributorColumns = {
        PharmaOverseas: { territory: "Territory Name", product: "Product Name", qty: "Sales" },
        Ibnsina: { territory: "Territory Name", product: "Item Name", qty: "QTY" },
        "ABOU KIR": { territory: "ZONE_NAME", product: "PRODUCT_NAME", qty: "NET_QUANTITY" },
    };

    let sheetData = [];
    let selectedDistributor = "";

    document.getElementById("upload").addEventListener("change", (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Detect distributor and handle merged rows
            selectedDistributor = detectDistributor(rows);
            const { territory, product, qty } = distributorColumns[selectedDistributor];
            sheetData = rows.slice(1).map((row) => ({
                territory: row[rows[0].indexOf(territory)],
                product: row[rows[0].indexOf(product)],
                qty: row[rows[0].indexOf(qty)],
            }));

            populateDropdowns(sheetData);
        };
        reader.readAsBinaryString(file);
    });

    function detectDistributor(rows) {
        if (rows[0].includes("Territory Name") && rows[0].includes("Product Name")) return "PharmaOverseas";
        if (rows[0].includes("Territory Name") && rows[0].includes("Item Name")) return "Ibnsina";
        if (rows[0].includes("ZONE_NAME")) return "ABOU KIR";
        return "";
    }

    function populateDropdowns(data) {
        const territories = [...new Set(data.map((item) => item.territory))];
        const products = [...new Set(data.map((item) => item.product))];

        $("#territory").empty().append(territories.map((t) => `<option>${t}</option>`));
        $("#product").empty().append(products.map((p) => `<option>${p}</option>`));
    }

    window.filterData = () => {
        const selectedTerritories = $("#territory").val();
        const selectedProducts = $("#product").val();

        const filtered = sheetData.filter(
            (row) =>
                selectedTerritories.includes(row.territory) &&
                selectedProducts.includes(row.product)
        );

        displayResults(filtered);
    };

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