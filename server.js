const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Gelen verileri alabilmek için middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Statik dosyaları sun (HTML, CSS, JS dosyaları)
app.use(express.static(path.join(__dirname, "public")));

// Ana sayfa yönlendirmesi (isteğe bağlı)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Form verisini al ve veriler.json dosyasına kaydet
app.post("/basvuru", (req, res) => {
  const yeniBasvuru = req.body;
  const dosyaYolu = path.join(__dirname, "veriler.json");

  // Önce dosya varsa oku, yoksa boş bir dizi başlat
  let mevcutVeriler = [];
  if (fs.existsSync(dosyaYolu)) {
    try {
      const veri = fs.readFileSync(dosyaYolu, "utf-8");
      mevcutVeriler = JSON.parse(veri);
    } catch (e) {
      console.error("veriler.json okunamadı veya bozuk, yeni başlıyoruz.");
      mevcutVeriler = [];
    }
  }

  // Yeni başvuruyu ekle
  mevcutVeriler.push(yeniBasvuru);

  // Dosyaya yaz
  try {
    fs.writeFileSync(dosyaYolu, JSON.stringify(mevcutVeriler, null, 2), "utf-8");
    res.json({ mesaj: "Başvurunuz başarıyla kaydedildi." });
  } catch (e) {
    console.log("Gelen veri:", req.body);
    res.status(500).json({ mesaj: "Veri kaydedilirken hata oluştu." });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
