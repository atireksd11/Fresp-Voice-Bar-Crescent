export function createAudioAnalyser(audioElement) {
    const AudioContextType = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextType) {
        throw new Error("This browser does not support the Web Audio api.");
    }

    const audioContext = new AudioContextType();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext,destination);

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    return { audioContext, analyser, frequencyData };
}