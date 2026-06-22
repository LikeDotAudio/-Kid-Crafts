/**
 * Drum Engine Module
 * Synthesizes analog-modeled drum components (kick, snare, hi-hat) using Web Audio nodes.
 */
export class DrumEngine {
    constructor(soundEngine) {
        this.soundEngine = soundEngine;
    }

    playDrum(type, startTime, volume = 0.25) {
        const audioCtx = this.soundEngine.audioCtx;
        const masterGain = this.soundEngine.masterGain;
        if (!audioCtx || !masterGain) return;

        // Shared noise buffer for snare and hi-hat synthesis
        let bufferSize = audioCtx.sampleRate * 0.1;
        let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        let noiseNode = audioCtx.createBufferSource(); 
        noiseNode.buffer = buffer;
        let noiseFilter = audioCtx.createBiquadFilter(); 
        let noiseGain = audioCtx.createGain();
        
        if (type === "kick") {
            let osc = audioCtx.createOscillator(); 
            let gainNode = audioCtx.createGain();
            
            osc.type = "sine"; 
            osc.frequency.setValueAtTime(130, startTime);
            osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.06);
            
            gainNode.gain.setValueAtTime(volume * 1.4, startTime); 
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
            
            osc.connect(gainNode); 
            gainNode.connect(masterGain);
            
            osc.start(startTime); 
            osc.stop(startTime + 0.1);
        } else if (type === "snare") {
            noiseFilter.type = "bandpass"; 
            noiseFilter.frequency.setValueAtTime(1100, startTime);
            
            noiseGain.gain.setValueAtTime(volume * 0.7, startTime); 
            noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
            
            noiseNode.connect(noiseFilter); 
            noiseFilter.connect(noiseGain); 
            noiseGain.connect(masterGain);
            
            noiseNode.start(startTime); 
            noiseNode.stop(startTime + 0.1);
        } else if (type === "hat") {
            noiseFilter.type = "highpass"; 
            noiseFilter.frequency.setValueAtTime(9000, startTime);
            
            noiseGain.gain.setValueAtTime(volume * 0.25, startTime); 
            noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.02);
            
            noiseNode.connect(noiseFilter); 
            noiseFilter.connect(noiseGain); 
            noiseGain.connect(masterGain);
            
            noiseNode.start(startTime); 
            noiseNode.stop(startTime + 0.03);
        }
    }
}
