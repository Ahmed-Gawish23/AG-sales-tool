document.getElementById("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // قراءة ملف Excel
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  // استخراج القيم الفريدة وترتيبها أبجديًا
  const items = [...new Set(jsonData.map(row => row["Item Name"]).filter(Boolean))].sort();
  const territories = [...new Set(jsonData.map(row => row["Territory Name"]).filter(Boolean))].sort();

  // القوائم المنسدلة
  const itemSelect = document.getElementById("itemSelect");
  const territorySelect = document.getElementById("territorySelect");

  // تفريغ القوائم قبل ملئها
  itemSelect.innerHTML = "";
  territorySelect.innerHTML = "";

  // ملء قائمة الأدوية
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    itemSelect.appendChild(option);
  });

  // ملء قائمة المناطق
  territories.forEach(territory => {
    const option = document.createElement("option");
    option.value = territory;
    option.textContent = territory;
    territorySelect.appendChild(option);
  });

  // عند الضغط على زر الفلترة
  document.getElementById("filterButton").addEventListener("click", () => {
    const selectedItems = Array.from(itemSelect.selectedOptions).map(option => option.value);
    const selectedTerritories = Array.from(territorySelect.selectedOptions).map(option => option.value);

    // فلترة البيانات بناءً على الاختيارات
    const filteredData = jsonData.filter(row =>
      selectedItems.includes(row["Item Name"]) &&
      selectedTerritories.includes(row["Territory Name"])
    );

    // حساب الكميات لكل دواء في كل منطقة
    const result = {};
    filteredData.forEach(row => {
      const key = `${row["Item Name"]} - ${row["Territory Name"]}`;
      if (!result[key]) result[key] = 0;
      result[key] += row["QTY"];
    });

    // عرض النتائج
    const output = document.getElementById("output");
    output.innerHTML = "<h3>Filtered Results:</h3>";
    Object.entries(result).forEach(([key, qty]) => {
      const p = document.createElement("p");
      p.textContent = `${key}: ${qty} boxes`;
      output.appendChild(p);
    });
  });
});