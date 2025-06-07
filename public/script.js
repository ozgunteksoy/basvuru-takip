document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Formdan verileri al
    const formData = {
      ad: document.getElementById("ad").value,
      soyad: document.getElementById("soyad").value,
      email: document.getElementById("email").value,
      tip: document.getElementById("tip").value,
      aciklama: document.getElementById("aciklama").value
    };

    // Konsola da yaz (isteğe bağlı)
    console.log("Gönderilen veri:", formData);

    // POST isteği ile server.js'e gönder
    fetch("/basvuru", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (!res.ok) throw new Error("İstek başarısız.");
        return res.json();
      })
      .then(data => {
        alert(data.mesaj || "Başvuru başarıyla gönderildi!");
        form.reset(); // Formu temizle
      })
      .catch(err => {
        console.error("Hata:", err);
        alert("Başvuru gönderilemedi.");
      });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const tablo = document.querySelector("#veriTablosu tbody");
  const aramaKutusu = document.getElementById("aramaKutusu");
  let tumVeriler = [];

  fetch("/liste")
    .then(res => res.json())
    .then(veriler => {
      tumVeriler = veriler;
      tabloyuGuncelle(tumVeriler);
    });

  aramaKutusu.addEventListener("input", () => {
    console.log("Yazılıyor:", aramaKutusu.value);
    const aranan = aramaKutusu.value.toLowerCase();
    const filtreli = tumVeriler.filter(veri =>
      (veri.ad || "").toLowerCase().includes(aranan) ||
      (veri.soyad || "").toLowerCase().includes(aranan) ||
      (veri.tip || "").toLowerCase().includes(aranan)
    );
    tabloyuGuncelle(filtreli);
  });

  function tabloyuGuncelle(veriler) {
    tablo.innerHTML = "";
    veriler.forEach(veri => {
      const satir = document.createElement("tr");
      satir.innerHTML = `
        <td>${veri.ad}</td>
        <td>${veri.soyad}</td>
        <td>${veri.email}</td>
        <td>${veri.tip}</td>
        <td>${veri.aciklama}</td>
        <td><button onclick="sil(${veri.id})">Sil</button></td>
      `;
      tablo.appendChild(satir);
    });
  }
});
