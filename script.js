let mediaRecorder;
let recordedChunks = [];
let startTime;
let timerInterval;

const preview = document.getElementById('preview');
const selectBtn = document.getElementById('selectBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');

// 1. Selecionar o Quadro da Tela (Janela ou Tela Inteira)
selectBtn.onclick = async () => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: true
        });
        preview.srcObject = stream;
        startBtn.disabled = false;
        selectBtn.innerText = "✅ Tela Selecionada";
    } catch (err) {
        console.error("Erro ao selecionar tela:", err);
    }
};

// 2. Iniciar Gravação
startBtn.onclick = () => {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(preview.srcObject, {
        mimeType: 'video/webm; codecs=vp9'
    });

    mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = handleStop;
    
    mediaRecorder.start(1000); // Captura em blocos de 1s
    startTimer();
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    document.getElementById('status-text').innerText = "Gravando...";
};

// 3. Pausar / Retomar
pauseBtn.onclick = () => {
    if (mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        clearInterval(timerInterval);
        pauseBtn.innerText = "▶️ Retomar";
        document.getElementById('status-text').innerText = "Pausado";
    } else {
        mediaRecorder.resume();
        startTimer();
        pauseBtn.innerText = "⏸️ Pausar";
        document.getElementById('status-text').innerText = "Gravando...";
    }
};

// 4. Parar
stopBtn.onclick = () => {
    mediaRecorder.stop();
    stopTimer();
    // Para todos os tracks de vídeo para fechar a "janela de compartilhamento"
    preview.srcObject.getTracks().forEach(track => track.stop());
    
    resetButtons();
};

function handleStop() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const isAuto = document.getElementById('autoDownload').checked;
    
    if (isAuto) {
        downloadVideo(blob);
    } else {
        // Cria botão manual se não for automático
        const url = URL.createObjectURL(blob);
        const btnManual = document.createElement('button');
        btnManual.innerText = "💾 Baixar Gravação Manualmente";
        btnManual.onclick = () => downloadVideo(blob);
        document.querySelector('.container').appendChild(btnManual);
    }
}

function downloadVideo(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gravacao-${Date.now()}.webm`;
    a.click();
}

// Funções de Auxílio (Timer e UI)
function startTimer() {
    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        let hrs = Array.from(Math.floor(seconds / 3600).toString()).padStart(2, '0').join('');
        let mins = Array.from(Math.floor((seconds % 3600) / 60).toString()).padStart(2, '0').join('');
        let secs = Array.from((seconds % 60).toString()).padStart(2, '0').join('');
        timerDisplay.innerText = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetButtons() {
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    selectBtn.innerText = "🖥️ Selecionar Tela/Janela";
}