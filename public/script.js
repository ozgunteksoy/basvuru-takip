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
