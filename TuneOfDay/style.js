/**
 * Music Theory & Mathematical System Specifications
 * ---------------------------------------------------------------------------
 * Music functions as a mathematical system because it is fundamentally based 
 * on the physics of frequency, ratios, and periodic waveforms. Our brains 
 * perceive "harmony" when these frequencies align in ways that are mathematically simple.
 *
 * 1. The Mathematical Foundation: Frequency Ratios
 *    Music relies on the Harmonic Series. When a string or air column vibrates, 
 *    it produces a fundamental frequency (f) and integer multiples (2f, 3f, 4f...).
 *    The most stable/consonant intervals are defined by the simplest ratios:
 *      - Octave (2:1): e.g., 440 Hz to 880 Hz.
 *      - Perfect Fifth (3:2): Most consonant interval after the octave.
 *      - Perfect Fourth (4:3): Highly stable interval.
 *
 *    While these ratios define Just Intonation, moving between different keys 
 *    requires Equal Temperament (12 equal logarithmic divisions of an octave):
 *      Formula: f_n = f_0 * 2^(n / 12)
 *      Where f_n is the frequency n semitones away from reference frequency f_0.
 *
 * 2. Algorithmic Dimensions
 *    - Pitch Vector (Melody): M = {(p_1, t_1), (p_2, t_2), ..., (p_n, t_n)}
 *      governed by transition probabilities P(note_n | note_n-1) via Markov Chains.
 *    - Chords: Set-theoretic groupings defined by semitone offsets from root (e.g. Major = {0, 4, 7}).
 *    - Rhythm: E(k, n) Euclidean rhythms distribute k pulses into n steps as evenly as possible.
 */

export const MUSIC_MATHEMATICS = {
    RATIOS: {
        OCTAVE: 2 / 1,
        PERFECT_FIFTH: 3 / 2,
        PERFECT_FOURTH: 4 / 3
    },
    
    /**
     * Calculates equal temperament frequency for n semitones away from f0.
     * Formula: f_n = f0 * 2^(n/12)
     */
    getFrequency: (f0, n) => f0 * Math.pow(2, n / 12),

    /**
     * Generates a Euclidean rhythm E(k, n) using a Bresenham-like spacing algorithm.
     * Distributes k active pulses into n step slots as evenly as possible.
     */
    generateEuclideanRhythm: (k, n) => {
        let rhythm = [];
        let bucket = 0;
        for (let i = 0; i < n; i++) {
            bucket += k;
            if (bucket >= n) {
                bucket -= n;
                rhythm.push(1);
            } else {
                rhythm.push(0);
            }
        }
        return rhythm;
    }
};

/**
 * Style Settings Controller Module
 * Handles dropdowns, sliders, options, and event bindings for musical styles
 * (genre profiles, hat groove matrices, playback layering, volume boost, structural cuts).
 */
export class StyleController {
    constructor({
        genreSelectId,
        progressionVariantSelectId,
        hatSelectId,
        arp1VoicingSelectId,
        arp2VoicingSelectId,
        arpStyleSelectId,
        arpStyle2SelectId,
        cutSelectId,
        chordSizeSelectId,
        chordVoicingSelectId,
        volumeBoostId,
        onChange
    }) {
        this.genreSelect = document.getElementById(genreSelectId);
        this.progressionVariantSelect = document.getElementById(progressionVariantSelectId);
        this.hatSelect = document.getElementById(hatSelectId);
        this.arp1VoicingSelect = document.getElementById(arp1VoicingSelectId);
        this.arp2VoicingSelect = document.getElementById(arp2VoicingSelectId);
        this.arpStyleSelect = document.getElementById(arpStyleSelectId);
        this.arpStyle2Select = document.getElementById(arpStyle2SelectId);
        this.cutSelect = document.getElementById(cutSelectId);
        this.chordSizeSelect = document.getElementById(chordSizeSelectId);
        this.chordVoicingSelect = document.getElementById(chordVoicingSelectId);
        this.volumeBoostInput = document.getElementById(volumeBoostId) || null;
        this.keySelect = document.getElementById('key-select');
        this.vibeSelect = document.getElementById('vibe-select');
        this.onChange = onChange;

        // Mixer volume inputs
        this.volumeChordBoostInput = document.getElementById('volume-chord-boost');
        this.volumeArp1BoostInput = document.getElementById('volume-arp1-boost');
        this.volumeArp2BoostInput = document.getElementById('volume-arp2-boost');
        this.volumeDrumBoostInput = document.getElementById('volume-drum-boost');

        // Drum inputs
        this.kickPatternSelect = document.getElementById('kick-pattern-select');
        this.snarePatternSelect = document.getElementById('snare-pattern-select');
        this.drumKickVolumeInput = document.getElementById('drum-kick-volume');
        this.drumSnareVolumeInput = document.getElementById('drum-snare-volume');
        this.drumHatVolumeInput = document.getElementById('drum-hat-volume');

        // Additional Arpeggiator inputs
        this.arp1ModeSelect = document.getElementById('arp1-mode-select');
        this.arp1PatternSelect = document.getElementById('arp1-pattern-select');
        this.arp1RestSelect = document.getElementById('arp1-rest-select');
        this.arp1LatchCheckbox = document.getElementById('arp1-latch-checkbox');
        this.arp1GateSlider = document.getElementById('arp1-gate-slider');
        this.arp1SwingSlider = document.getElementById('arp1-swing-slider');
        this.arp1NoteCountSelect = document.getElementById('arp1-note-count-select');

        this.arp2ModeSelect = document.getElementById('arp2-mode-select');
        this.arp2PatternSelect = document.getElementById('arp2-pattern-select');
        this.arp2RestSelect = document.getElementById('arp2-rest-select');
        this.arp2LatchCheckbox = document.getElementById('arp2-latch-checkbox');
        this.arp2GateSlider = document.getElementById('arp2-gate-slider');
        this.arp2SwingSlider = document.getElementById('arp2-swing-slider');
        this.arp2NoteCountSelect = document.getElementById('arp2-note-count-select');

        this.state = {
            genre: this.genreSelect.value,
            progressionVariant: parseInt(this.progressionVariantSelect.value) || 0,
            hatGroove: this.hatSelect.value,
            arp1Voicing: this.arp1VoicingSelect ? this.arp1VoicingSelect.value : 'single',
            arp2Voicing: this.arp2VoicingSelect ? this.arp2VoicingSelect.value : 'single',
            arpStyleIndex: parseInt(this.arpStyleSelect.value) || 0,
            arpStyle2Index: parseInt(this.arpStyle2Select.value) || 0,
            arrangementCutStyle: this.cutSelect.value,
            chordSize: this.chordSizeSelect ? parseInt(this.chordSizeSelect.value) : 3,
            chordVoicingFlavor: this.chordVoicingSelect ? this.chordVoicingSelect.value : '7th',
            selectedKey: this.keySelect ? this.keySelect.value : 'auto',
            selectedVibe: this.vibeSelect ? this.vibeSelect.value : 'auto',
            volumeBoost: this.volumeBoostInput ? parseFloat(this.volumeBoostInput.value) : 1.0,

            // Mixer volume boosts
            volumeChordBoost: this.volumeChordBoostInput ? parseFloat(this.volumeChordBoostInput.value) : 1.0,
            volumeArp1Boost: this.volumeArp1BoostInput ? parseFloat(this.volumeArp1BoostInput.value) : 1.0,
            volumeArp2Boost: this.volumeArp2BoostInput ? parseFloat(this.volumeArp2BoostInput.value) : 1.0,
            volumeDrumBoost: this.volumeDrumBoostInput ? parseFloat(this.volumeDrumBoostInput.value) : 1.0,

            // Drum controls
            kickPattern: this.kickPatternSelect ? this.kickPatternSelect.value : 'four_on_floor',
            snarePattern: this.snarePatternSelect ? this.snarePatternSelect.value : 'backbeat',
            drumKickVolume: this.drumKickVolumeInput ? parseFloat(this.drumKickVolumeInput.value) : 1.0,
            drumSnareVolume: this.drumSnareVolumeInput ? parseFloat(this.drumSnareVolumeInput.value) : 1.0,
            drumHatVolume: this.drumHatVolumeInput ? parseFloat(this.drumHatVolumeInput.value) : 1.0,

            arp1Mode: this.arp1ModeSelect ? this.arp1ModeSelect.value : 'up',
            arp1Pattern: this.arp1PatternSelect ? this.arp1PatternSelect.value : 'straight',
            arp1Rest: this.arp1RestSelect ? this.arp1RestSelect.value : 'none',
            arp1Latch: this.arp1LatchCheckbox ? this.arp1LatchCheckbox.checked : false,
            arp1Gate: this.arp1GateSlider ? parseFloat(this.arp1GateSlider.value) : 0.6,
            arp1Swing: this.arp1SwingSlider ? parseFloat(this.arp1SwingSlider.value) : 0,
            arp1NoteCount: this.arp1NoteCountSelect ? parseInt(this.arp1NoteCountSelect.value) : 8,

            arp2Mode: this.arp2ModeSelect ? this.arp2ModeSelect.value : 'up',
            arp2Pattern: this.arp2PatternSelect ? this.arp2PatternSelect.value : 'straight',
            arp2Rest: this.arp2RestSelect ? this.arp2RestSelect.value : 'none',
            arp2Latch: this.arp2LatchCheckbox ? this.arp2LatchCheckbox.checked : false,
            arp2Gate: this.arp2GateSlider ? parseFloat(this.arp2GateSlider.value) : 0.6,
            arp2Swing: this.arp2SwingSlider ? parseFloat(this.arp2SwingSlider.value) : 0,
            arp2NoteCount: this.arp2NoteCountSelect ? parseInt(this.arp2NoteCountSelect.value) : 8
        };

        this.initEvents();
    }

    initEvents() {
        const updateStateAndTrigger = (key, val) => {
            this.state[key] = val;
            if (this.onChange) {
                this.onChange(key, val);
            }
        };

        this.genreSelect.addEventListener('change', (e) => {
            updateStateAndTrigger('genre', e.target.value);
        });

        this.progressionVariantSelect.addEventListener('change', (e) => {
            updateStateAndTrigger('progressionVariant', parseInt(e.target.value) || 0);
        });

        this.hatSelect.addEventListener('change', (e) => {
            updateStateAndTrigger('hatGroove', e.target.value);
        });

        if (this.chordSizeSelect) {
            this.chordSizeSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('chordSize', parseInt(e.target.value) || 3);
            });
        }

        if (this.chordVoicingSelect) {
            this.chordVoicingSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('chordVoicingFlavor', e.target.value);
            });
        }

        if (this.keySelect) {
            this.keySelect.addEventListener('change', (e) => {
                updateStateAndTrigger('selectedKey', e.target.value);
            });
        }

        if (this.vibeSelect) {
            this.vibeSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('selectedVibe', e.target.value);
            });
        }

        if (this.arp1VoicingSelect) {
            this.arp1VoicingSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('arp1Voicing', e.target.value);
            });
        }

        if (this.arp2VoicingSelect) {
            this.arp2VoicingSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('arp2Voicing', e.target.value);
            });
        }

        this.arpStyleSelect.addEventListener('change', (e) => {
            updateStateAndTrigger('arpStyleIndex', parseInt(e.target.value) || 0);
        });

        this.arpStyle2Select.addEventListener('change', (e) => {
            updateStateAndTrigger('arpStyle2Index', parseInt(e.target.value) || 0);
        });

        this.cutSelect.addEventListener('change', (e) => {
            updateStateAndTrigger('arrangementCutStyle', e.target.value);
        });

        if (this.volumeBoostInput) {
            this.volumeBoostInput.addEventListener('input', (e) => {
                updateStateAndTrigger('volumeBoost', parseFloat(e.target.value) || 1.0);
            });
        }

        // Helper for input events
        const addControlListener = (el, key, isCheckbox = false, isFloat = false) => {
            if (!el) return;
            const eventName = el.type === 'range' ? 'input' : 'change';
            el.addEventListener(eventName, (e) => {
                let val;
                if (isCheckbox) {
                    val = e.target.checked;
                } else if (isFloat) {
                    val = parseFloat(e.target.value) || 0;
                } else {
                    val = e.target.value;
                }

                // Update readout if present
                const readout = document.getElementById(`${el.id}-readout`);
                if (readout) {
                    readout.innerText = isFloat ? val.toFixed(1) : val;
                }

                updateStateAndTrigger(key, val);
            });
        };

        addControlListener(this.volumeChordBoostInput, 'volumeChordBoost', false, true);
        addControlListener(this.volumeArp1BoostInput, 'volumeArp1Boost', false, true);
        addControlListener(this.volumeArp2BoostInput, 'volumeArp2Boost', false, true);
        addControlListener(this.volumeDrumBoostInput, 'volumeDrumBoost', false, true);

        addControlListener(this.kickPatternSelect, 'kickPattern');
        addControlListener(this.snarePatternSelect, 'snarePattern');
        addControlListener(this.drumKickVolumeInput, 'drumKickVolume', false, true);
        addControlListener(this.drumSnareVolumeInput, 'drumSnareVolume', false, true);
        addControlListener(this.drumHatVolumeInput, 'drumHatVolume', false, true);

        addControlListener(this.arp1ModeSelect, 'arp1Mode');
        addControlListener(this.arp1PatternSelect, 'arp1Pattern');
        addControlListener(this.arp1RestSelect, 'arp1Rest');
        addControlListener(this.arp1LatchCheckbox, 'arp1Latch', true);
        addControlListener(this.arp1GateSlider, 'arp1Gate', false, true);
        addControlListener(this.arp1SwingSlider, 'arp1Swing', false, true);
        if (this.arp1NoteCountSelect) {
            this.arp1NoteCountSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('arp1NoteCount', parseInt(e.target.value) || 8);
            });
        }

        addControlListener(this.arp2ModeSelect, 'arp2Mode');
        addControlListener(this.arp2PatternSelect, 'arp2Pattern');
        addControlListener(this.arp2RestSelect, 'arp2Rest');
        addControlListener(this.arp2LatchCheckbox, 'arp2Latch', true);
        addControlListener(this.arp2GateSlider, 'arp2Gate', false, true);
        addControlListener(this.arp2SwingSlider, 'arp2Swing', false, true);
        if (this.arp2NoteCountSelect) {
            this.arp2NoteCountSelect.addEventListener('change', (e) => {
                updateStateAndTrigger('arp2NoteCount', parseInt(e.target.value) || 8);
            });
        }
    }

    updateArpStyleOptions(dynamicArpStyles, selectedIndex, disabledIndex = null) {
        if (!this.arpStyleSelect) return;
        this.arpStyleSelect.innerHTML = "";
        dynamicArpStyles.forEach((style, idx) => {
            let opt = document.createElement('option');
            opt.value = idx; 
            opt.innerText = style.name;
            if (idx === selectedIndex) {
                opt.selected = true;
            } else if (idx === disabledIndex) {
                opt.disabled = true;
                opt.innerText += " (In Use by Arp 2)";
            }
            this.arpStyleSelect.appendChild(opt);
        });
        this.state.arpStyleIndex = selectedIndex;
    }

    updateArpStyle2Options(dynamicArpStyles, selectedIndex, disabledIndex = null) {
        if (!this.arpStyle2Select) return;
        this.arpStyle2Select.innerHTML = "";
        dynamicArpStyles.forEach((style, idx) => {
            let opt = document.createElement('option');
            opt.value = idx; 
            opt.innerText = style.name;
            if (idx === selectedIndex) {
                opt.selected = true;
            } else if (idx === disabledIndex) {
                opt.disabled = true;
                opt.innerText += " (In Use by Arp 1)";
            }
            this.arpStyle2Select.appendChild(opt);
        });
        this.state.arpStyle2Index = selectedIndex;
    }

    updateProgressionVariantOptions(variants, selectedIndex) {
        this.progressionVariantSelect.innerHTML = "";
        variants.forEach((variant, idx) => {
            let opt = document.createElement('option');
            opt.value = idx; 
            opt.innerText = variant.name;
            if (idx === selectedIndex) opt.selected = true;
            this.progressionVariantSelect.appendChild(opt);
        });
        this.state.progressionVariant = selectedIndex;
    }

    syncStateToUI(state) {
        this.state.genre = state.genre;
        this.genreSelect.value = state.genre;

        this.state.progressionVariant = state.progressionVariant;
        if (this.progressionVariantSelect) {
            this.progressionVariantSelect.value = state.progressionVariant;
        }

        this.state.chordSize = state.chordSize;
        if (this.chordSizeSelect) {
            this.chordSizeSelect.value = state.chordSize;
        }

        this.state.chordVoicingFlavor = state.chordVoicingFlavor;
        if (this.chordVoicingSelect) {
            this.chordVoicingSelect.value = state.chordVoicingFlavor;
        }

        this.state.selectedKey = state.selectedKey;
        if (this.keySelect) {
            this.keySelect.value = state.selectedKey;
        }

        this.state.selectedVibe = state.selectedVibe;
        if (this.vibeSelect) {
            this.vibeSelect.value = state.selectedVibe;
        }

        this.state.hatGroove = state.hatGroove;
        this.hatSelect.value = state.hatGroove;

        this.state.arpStyleIndex = state.arpStyleIndex;
        if (this.arpStyleSelect) {
            this.arpStyleSelect.value = state.arpStyleIndex;
        }

        this.state.arpStyle2Index = state.arpStyle2Index;
        if (this.arpStyle2Select) {
            this.arpStyle2Select.value = state.arpStyle2Index;
        }

        this.state.arrangementCutStyle = state.arrangementCutStyle;
        this.cutSelect.value = state.arrangementCutStyle;

        this.state.arp1Voicing = state.arp1Voicing;
        if (this.arp1VoicingSelect) {
            this.arp1VoicingSelect.value = state.arp1Voicing;
        }

        this.state.arp2Voicing = state.arp2Voicing;
        if (this.arp2VoicingSelect) {
            this.arp2VoicingSelect.value = state.arp2Voicing;
        }

        if (this.volumeBoostInput) {
            this.state.volumeBoost = state.volumeBoost;
            this.volumeBoostInput.value = state.volumeBoost;
        }

        // Helper to sync and update readout
        const syncValueAndReadout = (el, val) => {
            if (!el) return;
            if (el.type === 'checkbox') {
                el.checked = !!val;
            } else {
                el.value = val;
                const readout = document.getElementById(`${el.id}-readout`);
                if (readout) {
                    readout.innerText = typeof val === 'number' ? val.toFixed(1) : val;
                }
            }
        };

        this.state.volumeChordBoost = state.volumeChordBoost;
        syncValueAndReadout(this.volumeChordBoostInput, state.volumeChordBoost);

        this.state.volumeArp1Boost = state.volumeArp1Boost;
        syncValueAndReadout(this.volumeArp1BoostInput, state.volumeArp1Boost);

        this.state.volumeArp2Boost = state.volumeArp2Boost;
        syncValueAndReadout(this.volumeArp2BoostInput, state.volumeArp2Boost);

        this.state.volumeDrumBoost = state.volumeDrumBoost;
        syncValueAndReadout(this.volumeDrumBoostInput, state.volumeDrumBoost);

        this.state.kickPattern = state.kickPattern;
        if (this.kickPatternSelect) this.kickPatternSelect.value = state.kickPattern;

        this.state.snarePattern = state.snarePattern;
        if (this.snarePatternSelect) this.snarePatternSelect.value = state.snarePattern;

        this.state.drumKickVolume = state.drumKickVolume;
        syncValueAndReadout(this.drumKickVolumeInput, state.drumKickVolume);

        this.state.drumSnareVolume = state.drumSnareVolume;
        syncValueAndReadout(this.drumSnareVolumeInput, state.drumSnareVolume);

        this.state.drumHatVolume = state.drumHatVolume;
        syncValueAndReadout(this.drumHatVolumeInput, state.drumHatVolume);

        // Sync additional arpeggiator controls
        if (this.arp1ModeSelect) this.arp1ModeSelect.value = state.arp1Mode;
        if (this.arp1PatternSelect) this.arp1PatternSelect.value = state.arp1Pattern;
        if (this.arp1RestSelect) this.arp1RestSelect.value = state.arp1Rest;
        if (this.arp1NoteCountSelect) this.arp1NoteCountSelect.value = state.arp1NoteCount;
        if (this.arp1LatchCheckbox) this.arp1LatchCheckbox.checked = !!state.arp1Latch;
        if (this.arp1GateSlider) this.arp1GateSlider.value = state.arp1Gate;
        if (this.arp1SwingSlider) this.arp1SwingSlider.value = state.arp1Swing;

        if (this.arp2ModeSelect) this.arp2ModeSelect.value = state.arp2Mode;
        if (this.arp2PatternSelect) this.arp2PatternSelect.value = state.arp2Pattern;
        if (this.arp2RestSelect) this.arp2RestSelect.value = state.arp2Rest;
        if (this.arp2NoteCountSelect) this.arp2NoteCountSelect.value = state.arp2NoteCount;
        if (this.arp2LatchCheckbox) this.arp2LatchCheckbox.checked = !!state.arp2Latch;
        if (this.arp2GateSlider) this.arp2GateSlider.value = state.arp2Gate;
        if (this.arp2SwingSlider) this.arp2SwingSlider.value = state.arp2Swing;
    }
}
