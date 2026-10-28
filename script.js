const canvas = document.querySelector('#visualizer');
const context = canvas.getContext("2d");
const fileInput = document.querySelector("input[type='file']");
const audio = document.querySelector("audio");
const statusMessage = document.querySelector("#status");

const barCount = 32;
let audioContext = null;
let analyser = null;
let frequencyData = null;
let audioUrl = null;

function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function draw() {
    requestAnimationFrame(draw);
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    context.clearRect(0, 0, width, height);

    if (analyser) {
        analyser.getByteFrequencyData(frequencyData);
    }

    const gap = 7;
    const barWidth = (width - gap * (barCount - 1)) / barCount;
    
    for (let i = 0; i < barCount; i++) {
        let volume = 0;

        if (frequencyData) {
            const firstBin = Math.floor(i * frequencyData.length / barCount);
            const lastBin = Math.floor((i + 1) * frequencyData.length / barCount);
            let sum = 0;

            for (let bin = firstBin; bin < lastBin; bin++) {
                sum += frequencyData[bin];
            }
            volume = sum / (lastBin - firstBin);
        }

        const barHeight = (volume / 255) * height * 0.9;
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        context.fillStyle = `hsl(${255 + i * 2}, 85%, 68%)`;
        context.fillRect(x, y, barWidth, barHeight);
    }

}

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }

    audioUrl = URL.createObjectURL(file);
    audio.src = audioUrl;
    audio.load();
    statusMessage.textContent = `ready to play: ${file.name}`;
});

audio.addEventListener("play", async () => {
    try {
        if (!audioContext) {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            frequencyData = new Uint8Array(analyser.frequencyBinCount);

            const source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        statusMessage.textContent = "Playing and visualizing.";
    } catch (error) {
        console.error("Could not start audio visualization:", error);
        statusMessage.textContent = "The audio visualizer could not start. Try another browser.";
        audio.pause();
    }  
});

audio.addEventListener("ended", () => {
    statusMessage.textContent = "Song finished. Choose another song or play it again.";
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
draw();