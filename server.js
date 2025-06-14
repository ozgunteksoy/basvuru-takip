const connectToDatabase = require('./db');
connectToDatabase();

const express = require("express");
const fs = require("fs");
const sql = require("mssql")
const path = require("path");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.post("/login", async (req, res) => {
  const { kullanici_adi, sifre } = req.body;

  try {
    // 1. Kullanıcıyı sorgula
    const request = new sql.Request();
    request.input("kullanici_adi", sql.NVarChar, kullanici_adi);

    const result = await request.query(
      "SELECT * FROM Admin WHERE kullanici_adi = @kullanici_adi"
    );

    if (result.recordset.length === 0) {
      return res.send("Kullanıcı bulunamadı.");
    }

    const user = result.recordset[0];
    const hashedPassword = user.sifre;

    // 2. Şifre doğrulama
    const passwordMatch = await bcrypt.compare(sifre, hashedPassword);

    if (passwordMatch) {
      // Giriş başarılıysa yönlendir
      res.redirect("/anaSayfa.html");
    } else {
      res.send("Şifre yanlış.");
    }

  } catch (err) {
    console.error("Giriş hatası:", err);
    res.status(500).send("Sunucu hatası.");
  }
});


app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.send("Şifre en az 8 karakter olmalı, bir büyük harf, bir küçük harf ve bir noktalama işareti içermelidir.");
  }

  try {
    // 1. Kullanıcı var mı kontrolü
    const checkRequest = new sql.Request();
    checkRequest.input("kullanici_adi", sql.NVarChar, username);
    const check = await checkRequest.query(
      "SELECT * FROM Admin WHERE kullanici_adi = @kullanici_adi"
    );

    if (check.recordset.length > 0) {
      return res.send("Bu kullanıcı adı zaten kayıtlı.");
    }

    // 2. Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Yeni kullanıcıyı Admin tablosuna kaydet
    const insertRequest = new sql.Request();
    insertRequest
      .input("kullanici_adi", sql.NVarChar, username)
      .input("sifre", sql.NVarChar, hashedPassword);

    await insertRequest.query(
      "INSERT INTO Admin (kullanici_adi, sifre) VALUES (@kullanici_adi, @sifre)"
    );

    res.send(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Kayıt Başarılı</title>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body style="font-family:sans-serif;text-align:center;padding-top:50px;">
        <h2>Kayıt başarılı!</h2>
        <p>Ana sayfaya dönmek için için aşağıdaki butona tıklayın:</p>
        <a href="/index.html">
          <button style="padding: 10px 20px; font-size: 16px;">Ana Sayfa</button>
        </a>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).send("Sunucu hatası.");
  }
});

app.post('/kaydet', async (req, res) => {
  const { ad, soyad, email, tip, aciklama } = req.body;
  console.log("Gelen veri:", { ad, soyad, email, tip, aciklama });

  try {
    const pool = await connectToDatabase();
    await pool.request()
      .input('ad', sql.VarChar, ad)
      .input('soyad', sql.VarChar, soyad)
      .input('email', sql.VarChar, email)
      .input('tip', sql.VarChar, tip)
      .input('aciklama', sql.VarChar, aciklama)
      .query(`INSERT INTO Basvurular (ad, soyad, email, tip, aciklama)
              VALUES (@ad, @soyad, @email, @tip, @aciklama)`);

    res.status(200).send('Başvuru başarıyla kaydedildi.');
  } catch (err) {
    console.error('Kayıt hatası:', err.message);
    res.status(500).send('Veri kaydedilemedi.');
  }
});

app.get('/verileri-getir',async(req,res)=>{
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().query('SELECT * FROM Basvurular');
    res.json(result.recordset);
  } catch(err) {
    console.error('Listeleme hatası:',err.message);
    res.status(500).send('Veriler alınamadı.');
  }
});

app.delete('/basvuru/:id',async (req,res)=>{
  const id = parseInt(req.params.id);

  try{
    const pool = await connectToDatabase();
    const result = await pool
    .request()
    .input('id',sql.Int,id)
    .query('DELETE FROM Basvurular WHERE id=@id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ mesaj: "Silinecek kayıt bulunamadı." });
    }
    
    res.json({mesaj:'Silme işlemi başarılı.'});
  } catch(err) {
    console.error('Silme hatası',err.message);
    res.status(500).json({mesaj:'Silme işlemi başarısız'});
  }
});

app.put('/guncelle/:id',async(req,res)=> {
  const id = parseInt(req.params.id);
  console.log("Güncellenen ID:", id);
  const {ad,soyad,email,tip,aciklama} = req.body;

  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('id',sql.Int,id)
      .input('ad', sql.VarChar(50), ad)
      .input('soyad', sql.VarChar(50), soyad)
      .input('email', sql.VarChar(50), email)
      .input('tip', sql.VarChar(20), tip)
      .input('aciklama', sql.VarChar(100), aciklama)
      .query('UPDATE Basvurular SET ad=@ad,soyad=@soyad,email=@email,tip=@tip,aciklama=@aciklama WHERE id=@id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ mesaj: "Güncellenecek kayıt bulunamadı." });
    }
    res.json({mesaj:'Kayıt başarıyla güncellendi.'});
  } catch(err) {
    console.error('Güncelleme hatası',err.message);
    res.status(500).json({mesaj:'Kayıt güncellenemedi.'});
  }
});

app.get('/duzenle/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Basvurular WHERE id = @id');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]);
    } else {
      res.status(404).json({ mesaj: 'Kayıt bulunamadı' });
    }
  } catch (err) {
    console.error('Kayıt çekme hatası:', err.message);
    res.status(500).json({ mesaj: 'Veri çekilemedi' });
  }
});

/*
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
*/
// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
