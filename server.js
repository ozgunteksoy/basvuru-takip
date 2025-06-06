const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Gelen verileri JSON ve form formatında al
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Statik dosyaları sun (HTML,CSS,JS)
app.use(express.static(path.join(__dirname,"public")));

// Formdan gelen verileri işle
app.post("/basvuru",(req,res) => {
    console.log("Başvuru Alındı:", req.body);
    res.json({mesaj: "Başvurunuz başarıyla alındı."});
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`)
});

