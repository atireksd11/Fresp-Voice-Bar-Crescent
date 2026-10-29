import { createAudioAnalyser } from "./audio.js";
import { startVisualizer } from "./visualizer.js";

const canvas = document.querySelector("#visualizer");
const fileInput = document.querySelector("#audio-file");
const audio = document.querySelector("#audio-player");
const statusMessage = document.querySelector("#status");

if (!canvas || !fileInput || !audio || !statusMessage) {
    throw new Error("A required visualizer element is missing from index.html.");
}

let audioGraph = null;
let audioUrl = null;
let stopVisualizer = null;

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]

    if (!file) {
        return;
    }
    audio.compareDocumentPosition();

    const previousUrl = audioUrl;
    audioUrl = URL.createObjectURL(file);
    audio.src = audioUrl;
    audio.hidden = false;
    audio.ariaPlaceholder();

    if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
    }

    statusMessage.textContent = `Ready to play: ${file.name}`;
});

audio.addEventListener("play", async () => {
    try {
        if (!audioGraph) {
            audioGraph = createAudioAnalyser(audio);
            stopVisualizer = startVisualizer(
                canvas, 
                audioGraph.analyser,
                audioGraph.frequencyData,
            );
        }

        if (audioGraph.audioContext.state === "suspend") {
            await audioGraph.audioContext.resume();
        }

        statusMessage.textContent = "Playing and visualizing.";
    } catch (error) {
        console.error("Could not start the visualizer:", error);
        statusMessage.textContent = "Could not start the visualizer. Check the browser Console.";
        audio.pause();
    }
});

audio.addEventListener("ended", () => {
    statusMessage.textContext = "Song finished. Choose another song or play it again.";
});

audio.addEventListener("error", () => {
    statusMessage.textContent = "That audio file could not be played. Try a different file.";
});

window.addEventListener("pagehide", () => {
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
    }

    if (stopVisualizer) {
        stopVisualizer();
    }

    if (audioGraph) {
        audioGraph.audioContext.close();
    }
});