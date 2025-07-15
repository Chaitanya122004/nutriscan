async function fetchNutrition() {
  const input = document.getElementById("barcodeInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!input) {
    resultDiv.innerHTML = "❗ Please enter a barcode or product name.";
    return;
  }

  resultDiv.innerHTML = "⏳ Fetching data...";

  const url = `https://world.openfoodfacts.org/api/v0/product/${input}.json`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 1) {
      const product = data.product;
      const name = product.product_name || "Unknown Product";

      const getSafeValue = (val) => (val === undefined || val === null ? 0 : val);

      const sugar = getSafeValue(product.nutriments.sugars_100g);
      const fat = getSafeValue(product.nutriments.fat_100g);
      const protein = getSafeValue(product.nutriments.proteins_100g);

      let feedback = "✅ Looks okay!";
      if (sugar > 20) feedback = "❌ Too much sugar!";
      else if (fat > 20) feedback = "⚠️ High fat content.";
      else if (protein < 3) feedback = "⚠️ Low in protein.";

      resultDiv.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Sugar:</strong> ${sugar}g</p>
        <p><strong>Fat:</strong> ${fat}g</p>
        <p><strong>Protein:</strong> ${protein}g</p>
        <p><strong>Health Check:</strong> ${feedback}</p>
      `;
    } else {
      resultDiv.innerHTML = "❌ Product not found.";
    }
  } catch (err) {
    resultDiv.innerHTML = "⚠️ Error fetching data.";
    console.error(err);
  }
}

function startScanner() {
  const scanButton = document.querySelector('button[onclick="startScanner()"]');
  scanButton.disabled = true; // Disable button while scanning

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#scanner'),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader"]
    }
  }, function (err) {
    if (err) {
      console.error(err);
      scanButton.disabled = false;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((data) => {
    const code = data.codeResult.code;
    document.getElementById("barcodeInput").value = code;
    fetchNutrition(); // Fetch nutrition info
    Quagga.stop(); // Stop scanner
    scanButton.disabled = false; // Re-enable button
  });
}
