// Garantir que o DOM está carregado antes de buscar os botões
document.addEventListener('DOMContentLoaded', () => {
    
    // Seleção dos elementos
    const preview = document.getElementById('preview');
    const selectBtn = document.getElementById('selectBtn');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const timerDisplay = document.getElementById('timer');
    const statusText = document.getElementById('status-text');

    let mediaRecorder;
    let recordedChunks = [];
    let timerInterval;
    let seconds = 0;

    // 1. Selecionar a Tela (Obrigatório antes de iniciar)
    selectBtn.onclick = async () => {
        try {
            // Solicita permissão de captura ao sistema
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: true
            });
            
            preview.srcObject = stream;
            
            // Habilita os próximos botões
            selectBtn.style.background = "#2ed573";
            selectBtn.innerText = "✅ Tela Selecionada";
            startBtn.disabled = false;
            statusText.innerText = "Pronto para gravar";
            
        } catch (err) {
            console.error("Erro ao selecionar tela:", err);
            alert("Você precisa permitir o compartilhamento de tela para usar o gravador.");
        }
    };

    // 2. Iniciar Gravação
    startBtn.onclick = () => {
        if (!preview.srcObject) return;

        recordedChunks = [];
        // Tenta usar webm/vp9, se não, usa o padrão do navegador
        const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
                         ? 'video/webm; codecs=vp9' 
                         : 'video/webm';

        mediaRecorder = new MediaRecorder(preview.srcObject, { mimeType });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = exportVideo;

        mediaRecorder.start(1000); // Grava em blocos de 1 segundo
        resetTimer();
        startTimer();

        // Gerenciar estados dos botões
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        statusText.innerText = "🔴 Gravando...";
    };

    // 3. Pausar / Retomar
    pauseBtn.onclick = () => {
        if (mediaRecorder.state === "recording") {
            mediaRecorder.pause();
            clearInterval(timerInterval);
            pauseBtn.innerText = "▶️ Retomar";
            statusText.innerText = "Pausado";
        } else if (mediaRecorder.state === "paused") {
            mediaRecorder.resume();
            startTimer();
            pauseBtn.innerText = "⏸️ Pausar";
            statusText.innerText = "🔴 Gravando...";
        }
    };

    // 4. Parar e Finalizar
    stopBtn.onclick = () => {
        mediaRecorder.stop();
        clearInterval(timerInterval);
        
        // Desliga a câmera/captura de tela
        const tracks = preview.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        preview.srcObject = null;

        // Reseta interface
        startBtn.disabled = true;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
        pauseBtn.innerText = "⏸️ Pausar";
        selectBtn.innerText = "🖥️ Selecionar Tela/Janela";
        statusText.innerText = "Gravação finalizada.";
    };

    // Funções de Suporte
    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            timerDisplay.innerText = `${h}:${m}:${s}`;
        }, 1000);
    }

    function resetTimer() {
        seconds = 0;
        timerDisplay.innerText = "00:00:00";
    }

    function exportVideo() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const autoDownload = document.getElementById('autoDownload').checked;

        if (autoDownload) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `gravacao-${new Date().getTime()}.webm`;
            a.click();
        } else {
            // Se manual, cria um link de download na tela
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'minha-gravacao.webm';
            downloadLink.innerText = "💾 Clique aqui para baixar o vídeo";
            downloadLink.className = "manual-link";
            document.querySelector('.container').appendChild(downloadLink);
        }
    }
});
