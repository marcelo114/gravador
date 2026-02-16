console.log("Script carregado com sucesso!");

// Elementos do DOM
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

// FUNÇÃO 1: SELECIONAR TELA
selectBtn.addEventListener('click', async () => {
    console.log("Botão selecionar clicado");
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: true
        });
        
        preview.srcObject = stream;
        statusText.innerText = "Tela pronta!";
        
        // Ativar botões
        startBtn.disabled = false;
        selectBtn.style.backgroundColor = "#2ed573";
        console.log("Stream capturado com sucesso");
    } catch (err) {
        console.error("Erro ao capturar tela:", err);
        alert("Erro: Precisas escolher uma janela ou tela.");
    }
});

// FUNÇÃO 2: INICIAR
startBtn.addEventListener('click', () => {
    console.log("Iniciar gravação...");
    recordedChunks = [];
    
    mediaRecorder = new MediaRecorder(preview.srcObject);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        if (document.getElementById('autoDownload').checked) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `gravacao-${Date.now()}.webm`;
            a.click();
        }
        console.log("Gravação finalizada e pronta para download");
    };

    mediaRecorder.start();
    startTimer();
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    statusText.innerText = "GRAVANDO...";
});

// FUNÇÃO 3: PAUSAR
pauseBtn.addEventListener('click', () => {
    if (mediaRecorder.state === "recording") {
        mediaRecorder.pause();
        clearInterval(timerInterval);
        pauseBtn.innerText = "Retomar";
        statusText.innerText = "PAUSADO";
    } else {
        mediaRecorder.resume();
        startTimer();
        pauseBtn.innerText = "Pausar";
        statusText.innerText = "GRAVANDO...";
    }
});

// FUNÇÃO 4: PARAR
stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    clearInterval(timerInterval);
    preview.srcObject.getTracks().forEach(track => track.stop());
    
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    statusText.innerText = "Finalizado.";
});

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        let h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        let m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        timerDisplay.innerText = `${h}:${m}:${s}`;
    }, 1000);
}
