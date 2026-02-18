// Aguarda a página carregar totalmente
window.onload = function() {
    console.log("Sistema pronto!");

    const selectBtn = document.getElementById('selectBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const preview = document.getElementById('preview');

    let mediaRecorder;
    let recordedChunks = [];

    // 1. Clicar em Selecionar Tela
    selectBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: true
            });
            preview.srcObject = stream;
            
            // Ativa o próximo botão
            startBtn.disabled = false;
            selectBtn.innerText = "✅ Tela Selecionada";
            console.log("Streaming iniciado");
        } catch (err) {
            console.error("Erro ao selecionar:", err);
            alert("Você precisa escolher uma tela para gravar.");
        }
    };

    // 2. Clicar em Gravar
    startBtn.onclick = () => {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(preview.srcObject);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gravacao-${Date.now()}.webm`;
            a.click(); // Baixa automaticamente
        };

        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        startBtn.innerText = "🔴 Gravando...";
    };

    // 3. Clicar em Parar
    stopBtn.onclick = () => {
        mediaRecorder.stop();
        preview.srcObject.getTracks().forEach(track => track.stop());
        
        stopBtn.disabled = true;
        startBtn.disabled = true;
        startBtn.innerText = "Gravação Concluída";
    };
};
