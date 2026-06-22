import { ClockController } from './clock.js';
import { SoundEngine } from './sound.js';
import { DrumEngine } from './drums.js';
import { computeChords, MODULATION_SEQUENCE, PROGRESSION_VARIANTS } from './chords.js';
import { getArpStyles } from './arpeggiator.js';
import { StyleController } from './style.js';
import { buildLayout, LISTS } from './layout.js';

// Import sub-tabs classes
import { TabMatrix } from './tabMatrix.js';
import { TabKeyboard } from './tabKeyboard.js';
import { TabSettings } from './tabSettings.js';
import { SaveItController } from './saveIt.js';

// Central State Coordinator
const initialDate = new Date();
const initialYear = initialDate.getFullYear();
const initialMonth = String(initialDate.getMonth() + 1).padStart(2, '0');
const initialDay = String(initialDate.getDate()).padStart(2, '0');

const state = {
    hour: initialDate.getHours(),
    minute: initialDate.getMinutes(),
    date: `${initialYear}-${initialMonth}-${initialDay}`, // Current date seed
    activeEngineMode: '16',
    currentStepIndex: 0,
    rotationCounter: 0,
    currentModulationIndex: 0,
    accumulatedKeyOffset: 0,
    
    // Computed music theory state
    derivedBpm: 60,
    vibe: '',
    scaleMode: 'major',
    activeKeyIndex: 0,
    keyName: '',
    chords: {
        loop4: { chords: [], names: [], preciseChords: [] },
        loop8: { chords: [], names: [], preciseChords: [] },
        loop16: { chords: [], names: [], preciseChords: [] },
    },
    
    // Procedural arpeggiator patterns
    dynamicArpStyles: [],
    
    // Active UI configuration settings
    genre: 'pop',
    progressionVariant: 0,
    chordSize: 3,
    chordVoicingFlavor: '7th',
    hatGroove: 'straight_8',
    arp1Voicing: 'single',
    arp2Voicing: 'single',
    arpStyleIndex: 0,
    arpStyle2Index: 0, // Arpeggiator 2 Style
    arrangementCutStyle: 'dead_stop',
    volumeBoost: 1.0,
    breakStatusText: 'Normal Loop Running',

    // Mixer Boost Levels
    volumeChordBoost: 2.0,
    volumeArp1Boost: 0.5,
    volumeArp2Boost: 0.5,
    volumeDrumBoost: 1.75,

    // Drum Custom Parameters
    kickPattern: 'four_on_floor',
    snarePattern: 'backbeat',
    drumKickVolume: 1.0,
    drumSnareVolume: 1.0,
    drumHatVolume: 1.0,

    // Arpeggiator 1 custom parameters
    arp1Mode: 'up',
    arp1Pattern: 'straight',
    arp1Rest: 'none',
    arp1Latch: false,
    arp1Gate: 0.6,
    arp1Swing: 0,
    arp1NoteCount: 8,

    // Arpeggiator 2 custom parameters
    arp2Mode: 'up',
    arp2Pattern: 'straight',
    arp2Rest: 'none',
    arp2Latch: false,
    arp2Gate: 0.6,
    arp2Swing: 0,
    arp2NoteCount: 8,
    isLocked: false,
    selectedKey: 'auto',
    selectedVibe: 'auto',
};

let playbackTimeout = null;
let keyboardPreviewTimeout = null;

// Render layout framework
buildLayout(document.getElementById('app'));

// Instantiate modular sub-tabs controllers
const tabMatrix = new TabMatrix(document.getElementById('tab-matrix-container'));
const tabKeyboard = new TabKeyboard(document.getElementById('tab-keyboard-container'));
const tabSettings = new TabSettings(document.getElementById('tab-settings-container'));
const saveIt = new SaveItController(document.getElementById('save-it-container'));

// Setup separate engines for Chords and Arpeggiators
const chordEngine = new SoundEngine();
const arpEngine1 = new SoundEngine();
const arpEngine2 = new SoundEngine();
const drumEngine = new DrumEngine(chordEngine);

// Select DOM display components (persistent top section)
const calendarInput = document.getElementById('calendar-input');
const btn4 = document.getElementById('loop-4-btn');
const btn8 = document.getElementById('loop-8-btn');
const btn16 = document.getElementById('loop-16-btn');

const styleController = new StyleController({
    genreSelectId: 'genre-select',
    progressionVariantSelectId: 'progression-variant-select',
    hatSelectId: 'hat-groove-select',
    arp1VoicingSelectId: 'arp1-voicing-select',
    arp2VoicingSelectId: 'arp2-voicing-select',
    arpStyleSelectId: 'arp-style-select',
    arpStyle2SelectId: 'arp-style-2-select',
    cutSelectId: 'structural-cut-select',
    chordSizeSelectId: 'chord-size-select',
    chordVoicingSelectId: 'chord-voicing-select',
    volumeBoostId: 'volume-boost',
    onChange: (key, val) => {
        state[key] = val;
        if (key === 'genre') {
            state.progressionVariant = 0;
            const variants = PROGRESSION_VARIANTS[state.genre] || [];
            styleController.updateProgressionVariantOptions(variants, state.progressionVariant);
            updateMusicTheory();
        } else {
            updateMusicTheory();
        }
    }
});

// Update initial settings values into central state
Object.assign(state, styleController.state);

const clockController = new ClockController({
    svgId: 'clock-svg',
    hourHandId: 'hour-hand',
    minuteHandId: 'minute-hand',
    digitalTimeId: 'digital-time',
    ampmBtnId: 'ampm-toggle-btn',
    initialHour: state.hour,
    initialMinute: state.minute,
    onTimeChange: (h, m) => {
        // Detect midnight carry over
        if (state.hour === 23 && h === 0) {
            changeDateByDays(1);
        } else if (state.hour === 0 && h === 23) {
            changeDateByDays(-1);
        }
        state.hour = h;
        state.minute = m;
        updateMusicStateFromTime();
    }
});

const lockBtn = document.getElementById('clock-lock-btn');
if (lockBtn) {
    lockBtn.addEventListener('click', () => {
        state.isLocked = !state.isLocked;
        clockController.setLocked(state.isLocked);
        if (state.isLocked) {
            lockBtn.classList.add('active');
            if (calendarInput) calendarInput.disabled = true;
        } else {
            lockBtn.classList.remove('active');
            if (calendarInput) calendarInput.disabled = false;
        }
    });
}

function changeDateByDays(days) {
    const d = new Date(state.date);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    state.date = `${year}-${month}-${day}`;
    if (calendarInput) {
        calendarInput.value = state.date;
    }
}

function updateLoopButtonUI() {
    [btn4, btn8, btn16].forEach(b => { 
        if (b) {
            b.classList.remove('active'); 
            b.innerText = b.innerText.replace("Stop", "Loop");
        }
    });
    
    let activeBtn = btn16;
    if (state.activeEngineMode === '4') activeBtn = btn4;
    else if (state.activeEngineMode === '8') activeBtn = btn8;
    
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.innerText = activeBtn.innerText.replace("Loop", "Stop");
    }
}

function updateMusicStateFromTime() {
    // 1. Rebuild date-seeded arp styles
    state.dynamicArpStyles = getArpStyles(state.date, state.minute);

    // 2. Compute seeds based on state.hour, state.minute, and state.date
    let dateSeed = 0;
    const sanitizedDate = state.date.replace(/-/g, "");
    for (let char of sanitizedDate) {
        dateSeed += parseInt(char) || 0;
    }
    const h = state.hour;
    const m = state.minute;

    const genreOptions = ['pop', 'rock', 'country', 'rap', 'blues', 'lofi'];
    const genreIdx = (h * 7 + m * 13 + dateSeed) % genreOptions.length;
    state.genre = genreOptions[genreIdx];

    // Rebuild variant dropdown options for the seeded genre
    const variants = PROGRESSION_VARIANTS[state.genre] || [];
    state.progressionVariant = (h * 11 + m * 17 + dateSeed) % variants.length;
    styleController.updateProgressionVariantOptions(variants, state.progressionVariant);

    // Clamp and set arpStyleIndex for Arp 1
    state.arpStyleIndex = (h * 19 + m * 5 + dateSeed) % state.dynamicArpStyles.length;

    // Seed and set arpStyle2Index for Arp 2
    state.arpStyle2Index = (h * 31 + m * 11 + dateSeed) % state.dynamicArpStyles.length;
    if (state.arpStyleIndex === state.arpStyle2Index) {
        state.arpStyle2Index = (state.arpStyle2Index + 1) % state.dynamicArpStyles.length;
    }

    styleController.updateArpStyleOptions(state.dynamicArpStyles, state.arpStyleIndex, state.arpStyle2Index);
    styleController.updateArpStyle2Options(state.dynamicArpStyles, state.arpStyle2Index, state.arpStyleIndex);

    const loopOptions = ['4', '8', '16'];
    const loopIdx = (h * 29 + m * 7 + dateSeed) % loopOptions.length;
    state.activeEngineMode = loopOptions[loopIdx];

    const hatOptions = ['straight_8', 'trap_rolls', 'offbeat_disco', 'shuffle', 'muted'];
    const hatIdx = (h * 13 + m * 31 + dateSeed) % hatOptions.length;
    state.hatGroove = hatOptions[hatIdx];

    const sizes = [3, 4, 5];
    state.chordSize = sizes[(h * 17 + m * 29 + dateSeed) % sizes.length];

    const flavors = ['7th', '6th'];
    state.chordVoicingFlavor = flavors[(h * 23 + m * 31 + dateSeed) % flavors.length];

    // Seed custom arpeggiator parameters dynamically from time
    const modes = LISTS.arpModes.map(mode => mode.value);
    const patterns = LISTS.arpPatternStyles.map(pat => pat.value);
    const rests = LISTS.arpRests.map(r => r.value);
    const kickPats = LISTS.kickPatterns.map(p => p.value);
    const snarePats = LISTS.snarePatterns.map(p => p.value);
    const voicings = LISTS.voicingModes.map(v => v.value);

    state.arp1Voicing = voicings[(h * 5 + m * 7 + dateSeed) % voicings.length];
    state.arp2Voicing = voicings[(h * 11 + m * 13 + dateSeed) % voicings.length];

    state.arp1Mode = modes[(h * 7 + m * 3 + dateSeed) % modes.length];
    state.arp1Pattern = patterns[(h * 11 + m * 5 + dateSeed) % patterns.length];
    state.arp1Rest = rests[(h * 23 + m * 11 + dateSeed) % rests.length];
    state.arp1Latch = ((h * 13 + m * 17 + dateSeed) % 5 === 0); // 20% chance
    state.arp1Gate = parseFloat((0.3 + ((h * 17 + m * 23 + dateSeed) % 10) * 0.1).toFixed(2));
    state.arp1Swing = ((h * 19 + m * 29 + dateSeed) % 4) * 15;

    state.arp2Mode = modes[(h * 13 + m * 19 + dateSeed) % modes.length];
    state.arp2Pattern = patterns[(h * 23 + m * 7 + dateSeed) % patterns.length];
    state.arp2Rest = rests[(h * 17 + m * 31 + dateSeed) % rests.length];
    state.arp2Latch = ((h * 29 + m * 3 + dateSeed) % 5 === 0); // 20% chance
    state.arp2Gate = parseFloat((0.3 + ((h * 31 + m * 13 + dateSeed) % 10) * 0.1).toFixed(2));
    state.arp2Swing = ((h * 37 + m * 17 + dateSeed) % 4) * 15;
    // Seed drum patterns dynamically
    state.kickPattern = kickPats[(h * 5 + m * 17 + dateSeed) % kickPats.length];
    state.snarePattern = snarePats[(h * 7 + m * 13 + dateSeed) % snarePats.length];

    // Sync all dropdown selections in StyleController
    styleController.syncStateToUI(state);

    // 3. Update music theory and chord loops
    updateMusicTheory();

    // 4. Update the Loop standard button active highlights
    updateLoopButtonUI();
}

function updateMusicTheory() {
    const musicInfo = computeChords(state);
    state.derivedBpm = musicInfo.derivedBpm;
    state.vibe = musicInfo.vibe;
    state.scaleMode = musicInfo.scaleMode;
    state.activeKeyIndex = musicInfo.activeKeyIndex;
    state.keyName = musicInfo.keyName;
    state.chords.loop4 = musicInfo.loop4;
    state.chords.loop8 = musicInfo.loop8;
    state.chords.loop16 = musicInfo.loop16;

    // Rebuild arpeggiator selectors with unique disabled options
    if (state.dynamicArpStyles && state.dynamicArpStyles.length > 0) {
        if (state.arpStyleIndex === state.arpStyle2Index) {
            state.arpStyle2Index = (state.arpStyleIndex + 1) % state.dynamicArpStyles.length;
        }
        if (styleController) {
            styleController.updateArpStyleOptions(state.dynamicArpStyles, state.arpStyleIndex, state.arpStyle2Index);
            styleController.updateArpStyle2Options(state.dynamicArpStyles, state.arpStyle2Index, state.arpStyleIndex);
        }
    }

    // Refresh sub-tabs displays
    tabMatrix.update(state);
    tabSettings.populate(state);
    saveIt.update(state);
}

function playArpeggiator(
    engine,
    targetNotes,
    mode,
    pattern,
    restMode,
    gate,
    swing,
    latch,
    isFinalBar,
    now,
    stepDuration,
    voicingMode,
    arpIndex,
    stylePattern = [],
    noteCount = 8
) {
    // Check arrangement cut skip (latch overrides cut mutes!)
    let skipArp = false;
    if (isFinalBar && state.arrangementCutStyle !== "none" && !latch) {
        if (state.arrangementCutStyle === "dead_stop" || state.arrangementCutStyle === "diamond_decay") {
            skipArp = true;
        }
    }
    if (skipArp || mode === 'off') return;

    engine.init(false); // Disable echo/delay feedback routing!

    // Helper voice player to assign distinct instruments
    const playVoice = (note, time, duration, vol) => {
        if (arpIndex === 1) {
            engine.playWurlitzerArp(note, time, duration, vol);
        } else {
            engine.playSynthPluckArp(note, time, duration, vol);
        }
    };

    // Determine subdivision and active steps
    let stepsCount = noteCount;
    let stepActive = Array(stepsCount).fill(1);
    let isGlitch = false;

    if (pattern === 'triplets') {
        stepsCount = Math.round(noteCount * 0.75) || 3;
        stepActive = Array(stepsCount).fill(1);
    } else if (pattern === 'syncopated') {
        stepsCount = noteCount;
        if (stepsCount === 8) {
            stepActive = [1, 0, 1, 1, 0, 1, 0, 1];
        } else {
            stepActive = [];
            for (let i = 0; i < stepsCount; i++) {
                stepActive.push(i % 3 === 1 ? 0 : 1);
            }
        }
    } else if (pattern === 'glitch') {
        stepsCount = noteCount;
        stepActive = Array(stepsCount).fill(1);
        isGlitch = true;
    }

    let baseStepDuration = stepDuration / stepsCount;

    // Build the sorted/ordered notes cycle
    let sorted = [...targetNotes].sort((a, b) => a - b);
    let noteCycle = [];
    if (mode === 'up') {
        noteCycle = sorted;
    } else if (mode === 'down') {
        noteCycle = [...sorted].reverse();
    } else if (mode === 'updown') {
        noteCycle = [...sorted];
        for (let i = sorted.length - 2; i > 0; i--) {
            noteCycle.push(sorted[i]);
        }
        if (noteCycle.length === 0) noteCycle = sorted;
    } else if (mode === 'asplayed') {
        noteCycle = targetNotes;
    } else if (mode === 'random') {
        noteCycle = targetNotes;
    } else if (mode === 'chord') {
        noteCycle = [targetNotes];
    } else if (mode === 'root') {
        noteCycle = [sorted[0]];
    }

    // Determine loop length context for Call & Response
    let totalStepsInLoop = (state.activeEngineMode === '16') ? 16 : (state.activeEngineMode === '8' ? 8 : 4);

    // Schedule each step
    for (let step = 0; step < stepsCount; step++) {
        if (stepActive[step] === 0) continue;

        // Arrangement cut Gated Hitch
        if (state.arrangementCutStyle === "gated_hitch" && isFinalBar && !latch) {
            if (step >= Math.floor(stepsCount * 0.75)) continue;
        }

        // Apply rest mode calculations
        let isRest = false;
        let stepVolumeMultiplier = 1.0;

        if (restMode === 'sparse') {
            isRest = Math.random() > 0.70; // 30% chance of rest (70% probability gate)
        } else if (restMode === 'euclidean') {
            let activeRhythm = [1, 1, 1, 1, 1, 1, 1, 1];
            if (pattern === 'triplets') {
                activeRhythm = (arpIndex === 1) ? [1, 0, 1, 1, 0, 1] : [0, 1, 1, 0, 1, 1];
            } else {
                activeRhythm = (arpIndex === 1) ? [1, 0, 1, 1, 0, 1, 1, 0] : [0, 1, 1, 0, 1, 1, 0, 1];
            }
            isRest = activeRhythm[step % activeRhythm.length] === 0;
        } else if (restMode === 'velocity_lfo') {
            // Simulated LFO threshold gating (expressive volume changes + rests)
            let lfoVal = Math.sin((state.currentStepIndex * stepsCount + step) * 0.6);
            if (lfoVal < -0.3) {
                isRest = true; // Rest below threshold
            } else {
                // Map LFO value to expressive velocity volume modifier (0.5 to 1.2)
                stepVolumeMultiplier = 0.5 + ((lfoVal + 0.3) / 1.3) * 0.7;
            }
        } else if (restMode === 'human') {
            // Randomly deletes 45% of off-beat notes
            let isOffBeat = (stepsCount === 8) ? (step % 2 === 1) : (step % 3 !== 0);
            isRest = isOffBeat && (Math.random() < 0.45);
        } else if (restMode === 'call_response') {
            // Alternates Call (first half of loop - no rests) and Response (second half - sparse rests)
            let isResponse = (state.currentStepIndex >= totalStepsInLoop / 2);
            if (isResponse) {
                isRest = Math.random() > 0.40; // 60% chance of rest in Response section
            }
        }

        if (isRest) continue;

        // Timing calculations
        let delay = step * baseStepDuration;
        
        // Swing
        if (step % 2 === 1 && swing > 0) {
            let maxSwingDelay = baseStepDuration * 0.5; // Swing up to half step duration
            delay += (swing / 100) * maxSwingDelay;
        }

        // Humanize (micro-timing deviations)
        let humanizeOffset = (Math.random() - 0.5) * 0.005; // +/- 2.5ms
        let noteTime = now + delay + humanizeOffset;

        // Pitch selection
        let notesToPlay = [];
        if (mode === 'chord') {
            notesToPlay = targetNotes;
        } else if (mode === 'random') {
            notesToPlay = [targetNotes[Math.floor(Math.random() * targetNotes.length)]];
        } else {
            let noteIdx = step;
            if (stylePattern && stylePattern.length > 0) {
                noteIdx = stylePattern[step % stylePattern.length];
            }
            // Broken chord pattern scrambles indices
            if (pattern === 'broken') {
                let brokenIndices = [0, 2, 1, 3, 4, 6, 5, 7];
                noteIdx = brokenIndices[step % brokenIndices.length];
            }
            if (noteCycle.length > 0) {
                let primaryNote = noteCycle[noteIdx % noteCycle.length];
                notesToPlay = [primaryNote];
            } else {
                notesToPlay = [60]; // Fallback
            }
        }

        // Apply octave transpositions
        notesToPlay = notesToPlay.map(note => {
            let octOffset = 0;
            if (pattern === 'octave') {
                let octs = [0, 12, 24, 12];
                octOffset = octs[step % octs.length];
            }
            // Base transposition: Arp 1 gets +12, Arp 2 gets +24
            let baseTrans = (arpIndex === 1 ? 12 : 24);
            return note + baseTrans + octOffset;
        });

        // Gate calculations
        let stepGate = gate;
        if (isGlitch) {
            if (step === 2 || step === 5) {
                stepGate = gate * 0.2;
            } else if (step === 3 || step === 7) {
                // Double-trigger (stutter)
                let stutterTime1 = noteTime;
                let stutterTime2 = noteTime + (baseStepDuration * 0.5);
                let stutterGate = gate * 0.25;
                let stutterDur = (baseStepDuration * 0.5) * stutterGate;
                
                notesToPlay.forEach(note => {
                    playVoice(note, stutterTime1, stutterDur, 0.05 * stepVolumeMultiplier);
                    playVoice(note, stutterTime2, stutterDur, 0.04 * stepVolumeMultiplier);
                });
                continue;
            }
        }

        let noteDuration = baseStepDuration * stepGate;

        // Schedule arpeggiator sounds
        notesToPlay.forEach(note => {
            playVoice(note, noteTime, noteDuration, 0.06 * stepVolumeMultiplier);
            
            // Layer modes: doubles/triples
            if (voicingMode === "doubles" || voicingMode === "triples") {
                let offset = (arpIndex === 1 ? 12 : -12);
                playVoice(note + offset, noteTime, noteDuration * 0.8, 0.03 * stepVolumeMultiplier);
            }
            if (voicingMode === "triples") {
                playVoice(note + 7, noteTime, noteDuration, 0.02 * stepVolumeMultiplier);
            }
        });
    }
}

function processPlaybackEngine() {
    if (!state.activeEngineMode) return;

    const currentLoopData = (state.activeEngineMode === '16') 
        ? state.chords.loop16 
        : (state.activeEngineMode === '8' ? state.chords.loop8 : state.chords.loop4);
    
    let totalStepsInLoop = currentLoopData.chords.length;
    if (state.currentStepIndex >= totalStepsInLoop) state.currentStepIndex = 0;

    let isFinalBarInLoop = (state.currentStepIndex === totalStepsInLoop - 1);
    let secondsPerBeat = 60 / state.derivedBpm;
    let stepDuration = secondsPerBeat * 2; 
    
    let now = chordEngine.audioCtx.currentTime + 0.02;

    let targetNotes = currentLoopData.chords[state.currentStepIndex];

    // Set volumes on individual engines based on mixer boost levels
    chordEngine.setVolume(state.volumeChordBoost);
    arpEngine1.setVolume(state.volumeArp1Boost);
    arpEngine2.setVolume(state.volumeArp2Boost);

    // Refresh sub-tabs indicators
    tabMatrix.update(state);
    saveIt.update(state);
    
    // Clear any pending keyboard preview timeout
    clearTimeout(keyboardPreviewTimeout);
    
    // Render current active keys immediately
    tabKeyboard.update(state, targetNotes, null, false);

    // Schedule next chord preview halfway through step duration
    let nextStepIdx = (state.currentStepIndex + 1) % totalStepsInLoop;
    let nextChordNotes = currentLoopData.chords[nextStepIdx];
    keyboardPreviewTimeout = setTimeout(() => {
        if (state.activeEngineMode) {
            tabKeyboard.update(state, targetNotes, nextChordNotes, true);
        }
    }, (stepDuration / 2) * 1000);

    let skipArpeggiator = false; 
    let skipDrumsForBreak = false;

    if (isFinalBarInLoop && state.arrangementCutStyle !== "none") {
        if (state.arrangementCutStyle === "dead_stop") {
            state.breakStatusText = "Dead Stop Active!";
            skipArpeggiator = true; 
            skipDrumsForBreak = true; 
            stepDuration = secondsPerBeat * 1.0; 
        } else if (state.arrangementCutStyle === "diamond_decay") {
            state.breakStatusText = "Diamond Decay!";
            skipArpeggiator = true; 
            skipDrumsForBreak = true; 
            stepDuration = secondsPerBeat * 4.0; 
        }
    }

    if (state.arrangementCutStyle === "gated_hitch" && isFinalBarInLoop) {
        state.breakStatusText = "Gated Hitch Mute";
    } else if (!isFinalBarInLoop) {
        state.breakStatusText = "Normal Loop Running";
    }

    // Hammond Leslie Chord Output (Chord Engine)
    chordEngine.init();
    targetNotes.forEach(note => {
        chordEngine.playHammondLeslieChord(note, now, stepDuration, 0.04);
    });

    // Arpeggiators Output (Separate Arp 1 and Arp 2 Engines)
    playArpeggiator(
        arpEngine1,
        targetNotes,
        state.arp1Mode,
        state.arp1Pattern,
        state.arp1Rest,
        state.arp1Gate,
        state.arp1Swing,
        state.arp1Latch,
        isFinalBarInLoop,
        now,
        stepDuration,
        state.arp1Voicing,
        1,
        state.dynamicArpStyles[state.arpStyleIndex]?.pattern,
        state.arp1NoteCount
    );

    playArpeggiator(
        arpEngine2,
        targetNotes,
        state.arp2Mode,
        state.arp2Pattern,
        state.arp2Rest,
        state.arp2Gate,
        state.arp2Swing,
        state.arp2Latch,
        isFinalBarInLoop,
        now,
        stepDuration,
        state.arp2Voicing,
        2,
        state.dynamicArpStyles[state.arpStyle2Index]?.pattern,
        state.arp2NoteCount
    );

    // Drum Grooves Layer Output (Using Chord Engine Master Context)
    if (!skipDrumsForBreak) {
        chordEngine.init();
        let baseVel = (state.hour >= 12 && state.hour < 18) ? 0.35 : 0.2; 
        
        // Scale velocities by individual volumes and master drum boost level
        let kickVel = baseVel * state.drumKickVolume * state.volumeDrumBoost;
        let snareVel = baseVel * state.drumSnareVolume * state.volumeDrumBoost;
        let hatVel = baseVel * state.drumHatVolume * state.volumeDrumBoost;

        // Process kick pattern
        let kickTicks = [];
        if (state.kickPattern === "four_on_floor") {
            kickTicks = [0, 4];
        } else if (state.kickPattern === "downbeat") {
            kickTicks = [0];
        } else if (state.kickPattern === "syncopated") {
            kickTicks = [0, 3, 6];
        } else if (state.kickPattern === "boomboop") {
            kickTicks = [0, 1, 4];
        }
        
        kickTicks.forEach(t => {
            let kickTime = now + (t * (stepDuration / 8));
            drumEngine.playDrum("kick", kickTime, kickVel);
        });

        // Process snare pattern
        let snareTicks = [];
        if (state.snarePattern === "backbeat") {
            snareTicks = [4];
        } else if (state.snarePattern === "double_time") {
            snareTicks = [2, 6];
        } else if (state.snarePattern === "syncopated") {
            snareTicks = [3, 7];
        }

        snareTicks.forEach(t => {
            let snareTime = now + (t * (stepDuration / 8));
            drumEngine.playDrum("snare", snareTime, snareVel);
        });

        if (state.hatGroove !== "muted") {
            let ticksPerBar = 8; 
            let tickSpace = stepDuration / ticksPerBar;
            for (let t = 0; t < ticksPerBar; t++) {
                let hatTime = now + (t * tickSpace);
                if (state.hatGroove === "straight_8") {
                    drumEngine.playDrum("hat", hatTime, hatVel * 0.35);
                } else if (state.hatGroove === "trap_rolls") {
                    drumEngine.playDrum("hat", hatTime, hatVel * 0.35);
                    if (t === 2 || t === 6) {
                        drumEngine.playDrum("hat", hatTime + (tickSpace * 0.33), hatVel * 0.3);
                        drumEngine.playDrum("hat", hatTime + (tickSpace * 0.66), hatVel * 0.3);
                    }
                } else if (state.hatGroove === "offbeat_disco") {
                    if (t % 2 === 1) drumEngine.playDrum("hat", hatTime, hatVel * 0.5);
                } else if (state.hatGroove === "shuffle") {
                    if (t % 2 === 0) {
                        drumEngine.playDrum("hat", hatTime, hatVel * 0.35);
                        drumEngine.playDrum("hat", hatTime + (tickSpace * 0.66), hatVel * 0.2);
                    }
                }
            }
        }
    }

    state.currentStepIndex++;
    if (state.currentStepIndex >= totalStepsInLoop) {
        state.currentStepIndex = 0;
        state.rotationCounter++;

        // Change arrangement effect only on rotation!
        const cutOptions = ['none', 'dead_stop', 'gated_hitch', 'diamond_decay'];
        const cutIdx = (state.rotationCounter + state.minute) % cutOptions.length;
        state.arrangementCutStyle = cutOptions[cutIdx];
        if (styleController) {
            styleController.syncStateToUI(state);
        }

        if (state.rotationCounter >= 8) {
            state.rotationCounter = 0;
            if (state.currentModulationIndex < MODULATION_SEQUENCE.length) {
                let stepShift = MODULATION_SEQUENCE[state.currentModulationIndex];
                state.accumulatedKeyOffset += stepShift;
                state.currentModulationIndex++;
            } else {
                state.currentModulationIndex = 0; 
                state.accumulatedKeyOffset = 0;
            }
            updateMusicTheory();
        }
    }
    playbackTimeout = setTimeout(processPlaybackEngine, stepDuration * 1000);
}

function toggleEngine(mode, targetButton, forceStart = false) {
    chordEngine.init();
    arpEngine1.init(false);
    arpEngine2.init(false);
    clearTimeout(playbackTimeout);
    clearTimeout(keyboardPreviewTimeout);

    if (state.activeEngineMode === mode && !forceStart) {
        state.activeEngineMode = null;
        updateLoopButtonUI();
        tabKeyboard.update(state, null, null, false);
        return;
    }

    state.activeEngineMode = mode;
    if (!forceStart) state.currentStepIndex = 0;
    
    updateLoopButtonUI();
    updateMusicTheory(); 
    processPlaybackEngine();
}

// Bind engine controls to loop buttons
btn4.addEventListener('click', () => toggleEngine('4', btn4));
btn8.addEventListener('click', () => toggleEngine('8', btn8));
btn16.addEventListener('click', () => toggleEngine('16', btn16));

// Bind click event on the splash screen's engage button
const engageBtn = document.getElementById('engage-btn');
if (engageBtn) {
    engageBtn.addEventListener('click', () => {
        const splashLock = document.getElementById('splash-lock');
        if (splashLock) splashLock.style.display = 'none';
        toggleEngine('16', btn16, true);
    });
}

// Dynamic Tabs Navigation Selector Toggling
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const activeTab = e.target.getAttribute('data-tab');
        
        // Hide all panes
        document.getElementById('tab-matrix-container').style.display = 'none';
        document.getElementById('tab-keyboard-container').style.display = 'none';
        document.getElementById('tab-settings-container').style.display = 'none';

        // Show the active pane
        document.getElementById(`tab-${activeTab}-container`).style.display = 'flex';
    });
});

// Toggle Save It panel when clicking "Tune Of Day" footer title
const footerTitle = document.getElementById('footer-title');
const saveItContainer = document.getElementById('save-it-container');
if (footerTitle && saveItContainer) {
    footerTitle.addEventListener('click', () => {
        const isHidden = saveItContainer.style.display === 'none';
        saveItContainer.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            saveIt.update(state);
            saveItContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

calendarInput.addEventListener('input', () => {
    if (state.isLocked) return;
    state.date = calendarInput.value;
    updateMusicStateFromTime();
});

// Setup background timer to advance time every minute
let lastSystemMinute = new Date().getMinutes();
setInterval(() => {
    const currentSystemMinute = new Date().getMinutes();
    if (currentSystemMinute !== lastSystemMinute) {
        lastSystemMinute = currentSystemMinute;
        
        // Only tick if user is not currently dragging the clock hands and clock is not locked
        if (!clockController.activeHand && !state.isLocked) {
            let nextMin = state.minute + 1;
            let nextHr = state.hour;
            if (nextMin >= 60) {
                nextMin = 0;
                nextHr = (nextHr + 1) % 24;
            }
            
            // Check if date changed as well
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const curDate = `${year}-${month}-${day}`;
            if (state.date !== curDate) {
                state.date = curDate;
                if (calendarInput) {
                    calendarInput.value = state.date;
                }
            }
            
            // Updates clock state and UI and triggers rebuild & updateMusicTheory (via onTimeChange)
            clockController.setTime(nextHr, nextMin);
        }
    }
}, 1000);

// Initialize on load
if (calendarInput) {
    calendarInput.value = state.date;
}
clockController.updateUI();
updateMusicStateFromTime();
