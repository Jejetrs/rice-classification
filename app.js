let model;

// 1) Muat model
async function loadModel() {
  model = await tf.loadGraphModel('modeltfjs/model.json');
  console.log('Model berhasil dimuat!');
}

loadModel();

// 2) Daftar nama kelas
const classNames = ['Arborio', 'Basmati', 'Ipsala', 'Jasmine', 'Karacadag'];

// 3) Event listener untuk mengunggah gambar
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = document.getElementById('imagePreview');
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// 4) Event listener untuk prediksi
document.getElementById('predictButton').addEventListener('click', async function () {
  try {
    if (!model) {
      alert("Model belum dimuat!");
      return;
    }

    const imageElement = document.getElementById('imagePreview');
    if (!imageElement.src || imageElement.src === window.location.href) {
      alert("Silakan unggah gambar terlebih dahulu.");
      return;
    }

    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([150, 150])
      .toFloat()
      .div(tf.scalar(255.0))
      .expandDims();

    const prediction = model.predict(tensor);
    const predictionData = await prediction.data();
    const predictedClass = predictionData.indexOf(Math.max(...predictionData));
    const confidence = predictionData[predictedClass];

    // Logika threshold
    const THRESHOLD = 0.85;
    const label = confidence < THRESHOLD ? 'Unknown' : classNames[predictedClass];

    // Menampilkan hasil prediksi
    document.getElementById('predictionResult').innerText = 
      `${label} (Confidence: ${(confidence * 100).toFixed(2)}%)`;

    // Menampilkan nilai "Jenis Asli" dari input pengguna
    const actualLabel = document.getElementById('actualLabel').value;
    document.getElementById('actualLabelResult').innerText = actualLabel ? actualLabel : 'Tidak ada input';

  } catch (error) {
    console.error("Prediction error:", error);
    alert("Terjadi kesalahan saat prediksi. Silakan cek konsol.");
  }
});
