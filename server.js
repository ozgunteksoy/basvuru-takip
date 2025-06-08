const connectToDatabase = require('./db');
connectToDatabase();

const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/duzenle/:id", (req, res) => {
  const id = req.params.id;
  const dosyaYolu = path.join(__dirname, "veriler.json");

  if (!fs.existsSync(dosyaYolu)) {
    return res.status(404).json({ mesaj: "Veri dosyası bulunamadı" });
  }

  const veriler = JSON.parse(fs.readFileSync(dosyaYolu, "utf-8"));
  const kayit = veriler.find(v => String(v.id) === id);

  if (kayit) {
    res.json(kayit);
  } else {
    res.status(404).json({ mesaj: "Kayıt bulunamadı" });
  }
});

// POST /basvuru: Form verisini JSON dosyasına kaydeder
app.post("/basvuru", (req, res) => {
  const yeniVeri = {
    id: Date.now(), // Benzersiz ID
    ad: req.body.ad,
    soyad: req.body.soyad,
    email: req.body.email,
    tip: req.body.tip,
    aciklama: req.body.aciklama
  };

  const dosyaYolu = path.join(__dirname, "veriler.json");

  let mevcutVeriler = [];
  if (fs.existsSync(dosyaYolu)) {
    const data = fs.readFileSync(dosyaYolu, "utf-8");
    mevcutVeriler = JSON.parse(data);
  }

  mevcutVeriler.push(yeniVeri);

  fs.writeFileSync(dosyaYolu, JSON.stringify(mevcutVeriler, null, 2), "utf-8");

  res.json({ mesaj: "Başvuru başarıyla kaydedildi!" });
});

app.get("/liste", (req, res) => {
  const dosyaYolu = path.join(__dirname, "veriler.json");
  if (fs.existsSync(dosyaYolu)) {
    const veri = fs.readFileSync(dosyaYolu, "utf-8");
    res.json(JSON.parse(veri));
  } else {
    res.json([]);
  }
});

app.delete("/basvuru/:id", (req, res) => {
  const dosyaYolu = path.join(__dirname, "veriler.json");
  const id = parseInt(req.params.id); // ID sayıya çevriliyor

  if (!fs.existsSync(dosyaYolu)) {
    return res.status(404).json({ mesaj: "Kayıt bulunamadı." });
  }

  let veriler = JSON.parse(fs.readFileSync(dosyaYolu, "utf-8"));

  const oncekiUzunluk = veriler.length;

  // ID karşılaştırması yaparken veri tipi önemli!
  const yeniVeriler = veriler.filter(item => item.id !== id);

  if (yeniVeriler.length === oncekiUzunluk) {
    return res.status(404).json({ mesaj: "Bu ID ile eşleşen veri bulunamadı." });
  }

  fs.writeFileSync(dosyaYolu, JSON.stringify(yeniVeriler, null, 2), "utf-8");

  res.json({ mesaj: "Silindi" });
});

app.use(express.json());

app.put("/guncelle/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let veriler = JSON.parse(fs.readFileSync("veriler.json"));
  const index = veriler.findIndex(v => v.id === id);
  if (index !== -1) {
    veriler[index] = { id, ...req.body };
    fs.writeFileSync("veriler.json", JSON.stringify(veriler, null, 2));
    res.json({ mesaj: "Kayıt başarıyla güncellendi" });
  } else {
    res.status(404).json({ mesaj: "Kayıt bulunamadı" });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
