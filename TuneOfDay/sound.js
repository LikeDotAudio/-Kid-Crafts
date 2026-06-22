/**
 * Sound Engine Module
 * Manages Web Audio Context, routing, master compression/limiting,
 * and modeling algorithms for B3 Hammond Organ & Wurlitzer Electric Piano.
 */
import { MUSIC_MATHEMATICS } from './style.js';

export class SoundEngine {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
    }

    init(enableDelay = false) {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            let limiter = this.audioCtx.createDynamicsCompressor();
            limiter.threshold.setValueAtTime(-0.5, this.audioCtx.currentTime);
            this.masterGain.connect(limiter);
            limiter.connect(this.audioCtx.destination);

            if (enableDelay) {
                this.delayNode = this.audioCtx.createDelay(1.5);
                // 375ms is a standard dotted-eighth delay at typical house/synthwave tempos
                this.delayNode.delayTime.setValueAtTime(0.375, this.audioCtx.currentTime);
                this.delayFeedback = this.audioCtx.createGain();
                this.delayFeedback.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
                this.delayGain = this.audioCtx.createGain();
                this.delayGain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);

                this.masterGain.connect(this.delayNode);
                this.delayNode.connect(this.delayFeedback);
                this.delayFeedback.connect(this.delayNode);
                this.delayNode.connect(this.delayGain);
                this.delayGain.connect(limiter);
            }
        }
        // Resume context if suspended (browser security autoplay policies)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setVolume(value) {
        if (this.masterGain && this.audioCtx) {
            // value is the volume boost (e.g., 0.5 to 3.0)
            // base volume is 0.35
            this.masterGain.gain.setValueAtTime(0.35 * value, this.audioCtx.currentTime);
        }
    }

    /**
     * Hammond B3 Leslie Cabinet Simulator
     */
    playHammondLeslieChord(midiNote, startTime, duration, volume) {
        if (!this.audioCtx || !this.masterGain) return;
        let oscFundamental = this.audioCtx.createOscillator();
        let oscDrawbar3rd = this.audioCtx.createOscillator();
        let leslieCabinetFilter = this.audioCtx.createBiquadFilter();
        let leslieTremoloLfo = this.audioCtx.createOscillator();
        let leslieLfoGain = this.audioCtx.createGain();
        let ampEnv = this.audioCtx.createGain();

        let targetFreq = MUSIC_MATHEMATICS.getFrequency(440, midiNote - 12 - 69);
        oscFundamental.type = "sine"; 
        oscFundamental.frequency.setValueAtTime(targetFreq, startTime);
        oscDrawbar3rd.type = "sine"; 
        oscDrawbar3rd.frequency.setValueAtTime(targetFreq * 3, startTime);

        leslieCabinetFilter.type = "peaking"; 
        leslieCabinetFilter.Q.setValueAtTime(4.0, startTime);
        leslieCabinetFilter.frequency.setValueAtTime(700, startTime);
        leslieTremoloLfo.frequency.setValueAtTime(6.8, startTime);
        leslieLfoGain.gain.setValueAtTime(350, startTime);

        ampEnv.gain.setValueAtTime(0, startTime);
        ampEnv.gain.linearRampToValueAtTime(volume, startTime + 0.04);
        ampEnv.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);

        oscFundamental.connect(leslieCabinetFilter);
        let mixGain3rd = this.audioCtx.createGain(); 
        mixGain3rd.gain.setValueAtTime(0.25, startTime);
        oscDrawbar3rd.connect(mixGain3rd); 
        mixGain3rd.connect(leslieCabinetFilter);

        leslieTremoloLfo.connect(leslieLfoGain); 
        leslieLfoGain.connect(leslieCabinetFilter.frequency);
        leslieCabinetFilter.connect(ampEnv); 
        ampEnv.connect(this.masterGain);

        oscFundamental.start(startTime); 
        oscDrawbar3rd.start(startTime); 
        leslieTremoloLfo.start(startTime);
        
        oscFundamental.stop(startTime + duration + 0.05); 
        oscDrawbar3rd.stop(startTime + duration + 0.05); 
        leslieTremoloLfo.stop(startTime + duration + 0.05);
    }

    /**
     * Wurlitzer Electric Piano (Reed Model)
     */
    playWurlitzerArp(midiNote, startTime, duration, volume) {
        if (!this.audioCtx || !this.masterGain) return;
        let baseOsc = this.audioCtx.createOscillator();
        let reedOsc = this.audioCtx.createOscillator();
        let ampEnv = this.audioCtx.createGain();
        let toneFilter = this.audioCtx.createBiquadFilter();

        let targetFreq = MUSIC_MATHEMATICS.getFrequency(440, midiNote - 69);
        baseOsc.type = "sine"; 
        baseOsc.frequency.setValueAtTime(targetFreq, startTime);
        reedOsc.type = "triangle"; 
        reedOsc.frequency.setValueAtTime(targetFreq * 2, startTime);

        toneFilter.type = "lowpass"; 
        toneFilter.frequency.setValueAtTime(1400, startTime);
        ampEnv.gain.setValueAtTime(0, startTime);
        ampEnv.gain.linearRampToValueAtTime(volume, startTime + 0.005);
        ampEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.01);

        baseOsc.connect(toneFilter); 
        reedOsc.connect(toneFilter);
        
        let reedGain = this.audioCtx.createGain(); 
        reedGain.gain.setValueAtTime(0.35, startTime);
        reedOsc.connect(reedGain); 
        reedGain.connect(toneFilter);

        toneFilter.connect(ampEnv); 
        ampEnv.connect(this.masterGain);
        
        baseOsc.start(startTime); 
        reedOsc.start(startTime);
        
        baseOsc.stop(startTime + duration + 0.05); 
        reedOsc.stop(startTime + duration + 0.05);
    }

    /**
     * Warm Analog Synthesizer Pluck Sound (Sawtooth with Lowpass Filter Envelope Sweep)
     */
    playSynthPluckArp(midiNote, startTime, duration, volume) {
        if (!this.audioCtx || !this.masterGain) return;
        let osc = this.audioCtx.createOscillator();
        let ampEnv = this.audioCtx.createGain();
        let filter = this.audioCtx.createBiquadFilter();

        let targetFreq = MUSIC_MATHEMATICS.getFrequency(440, midiNote - 69);
        osc.type = "sawtooth"; 
        osc.frequency.setValueAtTime(targetFreq, startTime);

        // Lowpass filter envelope sweep
        filter.type = "lowpass"; 
        filter.frequency.setValueAtTime(4000, startTime);
        filter.frequency.exponentialRampToValueAtTime(300, startTime + duration * 0.4);
        filter.Q.setValueAtTime(1.5, startTime);

        // Amplitude envelope
        ampEnv.gain.setValueAtTime(0, startTime);
        ampEnv.gain.linearRampToValueAtTime(volume * 0.9, startTime + 0.005);
        ampEnv.gain.exponentialRampToValueAtTime(0.0001, startTime + duration - 0.01);

        osc.connect(filter);
        filter.connect(ampEnv); 
        ampEnv.connect(this.masterGain);
        
        osc.start(startTime); 
        osc.stop(startTime + duration + 0.05); 
    }
}
