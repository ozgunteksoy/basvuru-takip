document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const tablo = document.querySelector("#veriTablosu tbody");
  const aramaKutusu = document.getElementById("aramaKutusu");
  let tumVeriler = [];

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = {
        ad: document.getElementById("ad").value,
        soyad: document.getElementById("soyad").value,
        email: document.getElementById("email").value,
        tip: document.getElementById("tip").value,
        aciklama: document.getElementById("aciklama").value
      };

      fetch("/kaydet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
        .then(res => {
          if (!res.ok) throw new Error("İstek başarısız.");
          return res.text();
        })
        .then(mesaj => {
          alert(mesaj || "Başvuru başarıyla gönderildi!");
          form.reset();
        })
        .catch(err => {
          console.error("Hata:", err);
          alert("Başvuru gönderilemedi.");
        });
    });
  }
  // Eğer tablo varsa veri getir
  if (tablo) {
    fetch("/verileri-getir")
      .then(res => res.json())
      .then(veriler => {
        tumVeriler = veriler;
        tabloyuGuncelle(tumVeriler);
      });

    aramaKutusu.addEventListener("input", () => {
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
  }
});
