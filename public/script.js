document.getElementById("basvuruForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    ad: form.ad.value,
    soyad: form.soyad.value,
    email: form.email.value,
    tip: form.tip.value,
    aciklama: form.aciklama.value
  };

  try {
    const response = await fetch("/basvuru", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.mesaj || "Başvuru alındı!");
    form.reset();
  } catch (err) {
    alert("Başvuru gönderilirken hata oluştu.");
    console.error(err);
  }
});
