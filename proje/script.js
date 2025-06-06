document.getElementById("basvuruForm").addEventListener("submit",function(e) {
    e.preventDefault(); // Sayfa yenilenmesini engelle

    const form = e.target;
    const data = {
        ad: form.ad.value,
        soyad: form.soyad.value,
        email: form.email.value,
        tip: form.tip.value,
        aciklama: form.aciklama.value
    };

    console.log("Başvuru Alındı",data);
    
    alert("Başvurunuz alındı, teşekkür ederiz!");
    form.reset();
});