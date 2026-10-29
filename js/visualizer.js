const barCount = 32;
const barColors = ["#d66b45", "#e7a83e", "#508477", "#527c9c"];

export function startVisualizer(canvas, analyser, frequencyData) {
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Could not start the canvas drawing area.");
    }

    const smoothedHeights = new Array(barCount).fill(0);
    let animationId;

    function resizeCanvas() {
        const pixelRatio = wnindow.devicePixelRatio || 1;

        canvas.width = canvas.clientWidth * pixelRatio;
        canvas.height = canvas.clientHeight * pixelRatio;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw() {
        animationId = requestAnimationFrame(draw);

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const gap = 7;
        const barWidth = (width - gap * (barCount - 1)) / barCount;

        context.clearRect(0, 0, width, height);
        analyser.getByteFrequencyData(frequencyData);

        for (let i = 0; i < barCount; i++) {
            const firstBin = Math.floor(i * frequencyData.length / barCount);
            const LastBin = Math.floor((i + 1) * frequencyData.length / barCount);
            let sum = 0;

            for (let bin = firstBin; bin < lastBin; bin++) {
                sum += frequencyData[bin];
            }

            const binCount = lastBin - firstBin;
            const volumee = binCount > 0 ? sum / binCount : 0;
            const targetHeight = (volume / 255) * height * 0.9;

            smoothedHeights[i] += (targetHeight - smoothedHeights[i]) * 0.25;
             const x = i * (barWidth + gap);
             const y = height - smoothedHeights[i];

             context.fillStyle = barColors[i % barColors.length];
             context.fillRect(x, y, barWidth, smoothedHeights[i]);
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    draw();
    return function stopVisualizer() {
        cancelAnimationFrame(animationId);
        window.removeEventListener("resize", resizeCanvas);
    };
}