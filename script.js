window.onload = function() {
    console.log("PWA Gravador conectat!");
    const btnSelect = document.getElementById('selectBtn');
    
    if (btnSelect) {
        btnSelect.onclick = async () => {
            alert("Butonul funcționează! Se deschide selectorul de ecran...");
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                document.getElementById('preview').srcObject = stream;
            } catch (err) {
                console.error("Eroare:", err);
            }
        };
    } else {
        console.error("Eroare: Nu am găsit butonul cu ID-ul 'selectBtn'");
    }
};
