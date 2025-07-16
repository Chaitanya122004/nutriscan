function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

function getSafeValue(val) {
  return (val === undefined || val === null) ? 0 : val;
}

async function fetchNutrition() {
  const input = document.getElementById("barcodeInput").value.trim();
  const resultDiv = document.getElementById("result");
  const loading = document.getElementById("loadingSpinner");

  if (!input) {
    resultDiv.innerHTML = "❗ Please enter a barcode or product name.";
    return;
  }

  loading.classList.remove("hidden");
  resultDiv.innerHTML = "";

  const url = `https://world.openfoodfacts.org/api/v0/product/${input}.json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    loading.classList.add("hidden");

    if (data.status === 1) {
      const product = data.product;
      const name = product.product_name || "Unknown Product";

      const sugar = getSafeValue(product.nutriments.sugars_100g);
      const fat = getSafeValue(product.nutriments.fat_100g);
      const protein = getSafeValue(product.nutriments.proteins_100g);

      let feedback = "✅ Looks okay!";
      if (sugar > 20) feedback = "❌ Too much sugar!";
      else if (fat > 20) feedback = "⚠️ High fat content.";
      else if (protein < 3) feedback = "⚠️ Low in protein.";

      resultDiv.innerHTML = `
        <div class="border border-gray-300 dark:border-gray-600 rounded p-4 bg-gray-50 dark:bg-gray-700 shadow">
          <h3 class="text-xl font-semibold mb-2">${name}</h3>
          <ul class="space-y-1">
            <li><strong>Sugar:</strong> ${sugar}g</li>
            <li><strong>Fat:</strong> ${fat}g</li>
            <li><strong>Protein:</strong> ${protein}g</li>
            <li class="mt-2 text-lg"><strong>🩺 Health Verdict:</strong> ${feedback}</li>
          </ul>
        </div>
      `;
    } else {
      resultDiv.innerHTML = "❌ Product not found.";
    }
  } catch (err) {
    loading.classList.add("hidden");
    resultDiv.innerHTML = "⚠️ Error fetching data.";
    console.error(err);
  }
}

function startScanner() {
  const scannerElement = document.getElementById("scanner");
  const scanButton = document.querySelector('button[onclick="startScanner()"]');
  scannerElement.classList.remove("hidden");
  scanButton.disabled = true;

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: scannerElement,
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader"]
    }
  }, function (err) {
    if (err) {
      alert("Scanner failed to start.");
      console.error(err);
      scannerElement.classList.add("hidden");
      scanButton.disabled = false;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    document.getElementById("barcodeInput").value = code;
    fetchNutrition();
    Quagga.stop();
    scannerElement.classList.add("hidden");
    scanButton.disabled = false;
  });
}

