/**
 * Chords Module
 * Handles musical theory, scale modes, chord progression profile lookups,
 * and key/modulation arithmetic.
 *
 * 1. The Core Formulas (Chord DNA)
 *    Chords are stacked intervals from a root note. Scale degree offsets relative
 *    to the Major scale (1, 2, 3, 4, 5, 6, 7) are mapped to chromatic semitones:
 *      - Major:        1-3-5       -> [0, 4, 7]
 *      - Minor:        1-b3-5      -> [0, 3, 7]
 *      - Sus4:         1-4-5       -> [0, 5, 7]
 *      - Sus2:         1-2-5       -> [0, 2, 7]
 *      - Dominant 7th: 1-3-5-b7    -> [0, 4, 7, 10]
 *      - Major 7th:    1-3-5-7     -> [0, 4, 7, 11]
 *      - Minor 7th:    1-b3-5-b7   -> [0, 3, 7, 10]
 *      - Add9:         1-3-5-9     -> [0, 4, 7, 14]
 *      - 11th:         1-5-b7-9-11 -> [0, 5, 7, 10, 14] (with 3rd omitted to avoid dissonance)
 *
 * 2. Inversion Mechanics
 *    - Root Position: Root is in the bass. (e.g. [0, 4, 7])
 *    - 1st Inversion: 3rd is in the bass. (e.g. [4, 7, 12])
 *    - 2nd Inversion: 5th is in the bass. (e.g. [7, 12, 16])
 *    - 3rd Inversion (7th chords only): 7th is in the bass. (e.g. [10, 12, 16, 19])
 *    Rule: To invert, shift the lowest note up by one octave (+12 semitones).
 *
 * 3. Algorithmic Modular Wrapper
 *    Any pitch P in a key can be expressed as: P = (Root + Offset) (mod 12).
 *
 * 4. Music State-Transition Dynamics & Entropy
 *    State transitions exploit Psychoacoustic Expectations and Shannon Entropy:
 *      Formula: S = - Sum( p_i * log(p_i) )
 *    - Predictability (low entropy) vs. Surprise (high entropy) maintains engagement.
 *    - Harmonic Gravity (Circle of Fifths): Perfect fifth resolution (7 -> 0) creates
 *      the strongest mathematical release of tension.
 *    - Fractal Rhythmic Nesting: Self-similar loops of length 4, 8, and 16 steps
 *      align local rhythm with global structures.
 */

export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Chord Formula DNA Offsets (relative to the root)
export const CHORD_FORMULAS = {
    "Major": [0, 4, 7],
    "Minor": [0, 3, 7],
    "Sus4": [0, 5, 7],
    "Sus2": [0, 2, 7],
    "Dominant 7th": [0, 4, 7, 10],
    "Major 7th": [0, 4, 7, 11],
    "Minor 7th": [0, 3, 7, 10],
    "Add9": [0, 4, 7, 14],
    "11th": [0, 5, 7, 10, 14] // 3rd omitted
};

export const CHORD_PROFILES = {
    '7th': {
        major: [
            { name: "I", intervals: [0, 4, 7, 11, 14] },       
            { name: "ii", intervals: [2, 5, 9, 12, 16] },      
            { name: "iii", intervals: [4, 7, 11, 14, 18] },    
            { name: "IV", intervals: [5, 9, 12, 16, 19] },     
            { name: "V", intervals: [7, 11, 14, 17, 21] },     
            { name: "vi", intervals: [9, 12, 16, 19, 23] },    
            { name: "vii°", intervals: [11, 14, 17, 21, 24] },
            { name: "bVII", intervals: [10, 14, 17, 20, 24] }
        ],
        minor: [
            { name: "i", intervals: [0, 3, 7, 10, 14] },       
            { name: "ii°", intervals: [2, 5, 8, 12, 15] },      
            { name: "bIII", intervals: [3, 7, 10, 14, 17] },    
            { name: "iv", intervals: [5, 8, 12, 15, 19] },     
            { name: "v", intervals: [7, 10, 14, 17, 20] },     
            { name: "bVI", intervals: [8, 12, 15, 19, 22] },    
            { name: "bVII", intervals: [10, 14, 17, 20, 24] },
            { name: "V", intervals: [7, 11, 14, 17, 20] }
        ]
    },
    '6th': {
        major: [
            { name: "I", intervals: [0, 4, 7, 9, 14] },       
            { name: "ii", intervals: [2, 5, 9, 11, 16] },      
            { name: "iii", intervals: [4, 7, 11, 12, 18] },    
            { name: "IV", intervals: [5, 9, 12, 14, 19] },     
            { name: "V", intervals: [7, 11, 14, 16, 21] },     
            { name: "vi", intervals: [9, 12, 16, 17, 23] },    
            { name: "vii°", intervals: [11, 14, 17, 19, 24] },
            { name: "bVII", intervals: [10, 14, 17, 19, 24] }
        ],
        minor: [
            { name: "i", intervals: [0, 3, 7, 9, 14] },       
            { name: "ii°", intervals: [2, 5, 8, 10, 15] },      
            { name: "bIII", intervals: [3, 7, 10, 12, 17] },    
            { name: "iv", intervals: [5, 8, 12, 14, 19] },     
            { name: "v", intervals: [7, 10, 14, 15, 20] },     
            { name: "bVI", intervals: [8, 12, 15, 17, 22] },    
            { name: "bVII", intervals: [10, 14, 17, 19, 24] },
            { name: "V", intervals: [7, 11, 14, 15, 20] }
        ]
    }
};

export const MODULATION_SEQUENCE = [1, -1, -1, 1, 1];

/**
 * Calculates a chord inversion algorithmically.
 * Takes the lowest note and shifts it up by 12 semitones.
 * 
 * @param {number[]} intervals - Semitone offsets from the root
 * @param {number} inversionIndex - 0: Root position, 1: 1st Inv, 2: 2nd Inv, 3: 3rd Inv
 * @returns {number[]} Inverted semitone offsets
 */
export function getChordInversion(intervals, inversionIndex) {
    let inverted = [...intervals];
    inverted.sort((a, b) => a - b);
    
    for (let i = 0; i < inversionIndex; i++) {
        let lowest = inverted.shift();
        inverted.push(lowest + 12);
        inverted.sort((a, b) => a - b);
    }
    return inverted;
}

/**
 * Construct any complex chord in any key dynamically.
 * 
 * @param {number} rootNoteMidi - MIDI note of the root (e.g. 60 for C4)
 * @param {string} chordType - Key of CHORD_FORMULAS (e.g. "Major 7th")
 * @param {number} inversionIndex - Inversion offset
 * @returns {number[]} Output MIDI note array
 */
export function constructChord(rootNoteMidi, chordType, inversionIndex = 0) {
    const offsets = CHORD_FORMULAS[chordType] || CHORD_FORMULAS["Major"];
    const invertedOffsets = getChordInversion(offsets, inversionIndex);
    return invertedOffsets.map(offset => rootNoteMidi + offset);
}

export function getAbsoluteChordName(rootKeyIdx, scaleMode, profileChordName, flavor = '7th', chordSize = 3) {
    const activeProfiles = CHORD_PROFILES[flavor] || CHORD_PROFILES['7th'];
    const chordProfileLookup = activeProfiles[scaleMode].find(p => p.name === profileChordName);
    if (!chordProfileLookup) return profileChordName;
    let localRoot = (rootKeyIdx + chordProfileLookup.intervals[0]) % 12;
    let rootNoteName = KEYS[localRoot];
    
    let suffix = "";
    if (flavor === '6th' && chordSize >= 4) {
        suffix = (chordSize === 5) ? "6/9" : "6";
    } else if (flavor === '7th' && chordSize >= 4) {
        let isMajorExt = (profileChordName === "I" || profileChordName === "IV" || profileChordName === "bIII" || profileChordName === "bVI");
        let isDominantExt = (profileChordName === "V" || profileChordName === "bVII");
        
        if (chordSize === 5) {
            suffix = isMajorExt ? "maj9" : (isDominantExt ? "9" : "m9");
        } else {
            suffix = isMajorExt ? "maj7" : (isDominantExt ? "7" : "m7");
        }
        
        if (profileChordName === "ii°" || profileChordName === "vii°") {
            suffix = "m7b5";
        }
    }
    
    if (profileChordName === "ii°" || profileChordName === "vii°") {
        if (chordSize < 4) return rootNoteName + "dim";
        return rootNoteName + suffix;
    }
    
    if (profileChordName.toLowerCase() === profileChordName) {
        if (chordSize < 4) return rootNoteName + "m";
        if (flavor === '6th') return rootNoteName + "m" + suffix;
        return rootNoteName + suffix;
    }
    
    return rootNoteName + suffix;
}

export const PROGRESSION_VARIANTS = {
    pop: [
        { name: "Classic 4-Chord (I-V-vi-IV)", patterns: { 4: [0, 4, 5, 3], 8: [0, 4, 5, 3, 0, 4, 5, 3], 16: [0, 4, 5, 3, 0, 4, 5, 3, 5, 3, 0, 4, 5, 4, 0, 3] } },
        { name: "Royal Road / Sad Pop (vi-IV-I-V)", patterns: { 4: [5, 3, 0, 4], 8: [5, 3, 0, 4, 5, 3, 0, 4], 16: [5, 3, 0, 4, 5, 3, 0, 4, 5, 3, 0, 4, 5, 3, 4, 4] } },
        { name: "Plagal Cascade (I-IV-vi-V)", patterns: { 4: [0, 3, 5, 4], 8: [0, 3, 5, 4, 0, 3, 5, 4], 16: [0, 3, 5, 4, 0, 3, 5, 4, 0, 3, 0, 3, 5, 5, 4, 4] } },
        { name: "Hopeful Turn (IV-V-I-vi)", patterns: { 4: [3, 4, 0, 5], 8: [3, 4, 0, 5, 3, 4, 0, 5], 16: [3, 4, 0, 5, 3, 4, 0, 5, 3, 4, 3, 4, 0, 5, 4, 4] } },
        { name: "Standard Ballad (I-vi-IV-V)", patterns: { 4: [0, 5, 3, 4], 8: [0, 5, 3, 4, 0, 5, 3, 4], 16: [0, 5, 3, 4, 0, 5, 3, 4, 0, 5, 0, 5, 3, 3, 4, 4] } },
        { name: "Double Plagal Pop (I-bVII-IV-I)", patterns: { 4: [0, 7, 3, 0], 8: [0, 7, 3, 0, 0, 7, 3, 0], 16: [0, 7, 3, 0, 0, 7, 3, 0, 7, 3, 0, 7, 3, 3, 0, 0] } },
        { name: "Ascending Step (ii-IV-vi-V)", patterns: { 4: [1, 3, 5, 4], 8: [1, 3, 5, 4, 1, 3, 5, 4], 16: [1, 3, 5, 4, 1, 3, 5, 4, 1, 3, 1, 3, 5, 5, 4, 4] } },
        { name: "Sensitive Pop Var (vi-V-IV-I)", patterns: { 4: [5, 4, 3, 0], 8: [5, 4, 3, 0, 5, 4, 3, 4], 16: [5, 4, 3, 0, 5, 4, 3, 4, 5, 4, 3, 0, 5, 4, 3, 3] } },
        { name: "Jazz Pop (I-vi-ii-V)", patterns: { 4: [0, 5, 1, 4], 8: [0, 5, 1, 4, 0, 5, 1, 4], 16: [0, 5, 1, 4, 0, 5, 1, 4, 1, 4, 0, 5, 1, 1, 4, 4] } },
        { name: "Lydian Pop Illusion (IV-I-V-vi)", patterns: { 4: [3, 0, 4, 5], 8: [3, 0, 4, 5, 3, 0, 4, 5], 16: [3, 0, 4, 5, 3, 0, 4, 5, 3, 0, 3, 0, 4, 5, 4, 4] } }
    ],
    rock: [
        { name: "Classic Rock (I-bVII-IV-I)", patterns: { 4: [0, 7, 3, 0], 8: [0, 7, 3, 0, 0, 7, 3, 7], 16: [0, 7, 3, 0, 0, 7, 3, 0, 7, 3, 0, 7, 3, 3, 7, 0] } },
        { name: "Heavy Riff (I-V-IV-I)", patterns: { 4: [0, 4, 3, 0], 8: [0, 4, 3, 0, 0, 4, 3, 4], 16: [0, 4, 3, 0, 0, 4, 3, 0, 4, 3, 0, 4, 3, 3, 4, 0] } },
        { name: "Power Anthem (vi-IV-I-V)", patterns: { 4: [5, 3, 0, 4], 8: [5, 3, 0, 4, 5, 3, 0, 4], 16: [5, 3, 0, 4, 5, 3, 0, 4, 5, 3, 0, 4, 5, 3, 4, 4] } },
        { name: "Mixolydian Riff (I-bVII-I-bVII)", patterns: { 4: [0, 7, 0, 7], 8: [0, 7, 0, 7, 0, 7, 3, 0], 16: [0, 7, 0, 7, 0, 7, 0, 7, 3, 3, 7, 7, 0, 7, 3, 0] } },
        { name: "Stoner Rock Jam (I-IV-bVII-I)", patterns: { 4: [0, 3, 7, 0], 8: [0, 3, 7, 0, 0, 3, 7, 3], 16: [0, 3, 7, 0, 0, 3, 7, 0, 3, 7, 0, 3, 7, 7, 3, 0] } },
        { name: "Plagal Ascent (I-IV-I-IV)", patterns: { 4: [0, 3, 0, 3], 8: [0, 3, 0, 3, 0, 3, 4, 4], 16: [0, 3, 0, 3, 0, 3, 0, 3, 4, 4, 3, 3, 0, 3, 4, 0] } },
        { name: "Epic Ballad (vi-V-IV-V)", patterns: { 4: [5, 4, 3, 4], 8: [5, 4, 3, 4, 5, 4, 3, 4], 16: [5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 5, 4, 3, 3, 4, 4] } },
        { name: "Grunge Progress (I-vi-IV-V)", patterns: { 4: [0, 5, 3, 4], 8: [0, 5, 3, 4, 0, 5, 3, 4], 16: [0, 5, 3, 4, 0, 5, 3, 4, 5, 3, 0, 4, 5, 3, 4, 4] } },
        { name: "Sus Drive (I-V-vi-IV)", patterns: { 4: [0, 4, 5, 3], 8: [0, 4, 5, 3, 0, 4, 5, 3], 16: [0, 4, 5, 3, 0, 4, 5, 3, 0, 4, 0, 4, 5, 5, 3, 3] } },
        { name: "Descent Rock (I-V-IV-bVII)", patterns: { 4: [0, 4, 3, 7], 8: [0, 4, 3, 7, 0, 4, 3, 7], 16: [0, 4, 3, 7, 0, 4, 3, 7, 3, 7, 0, 4, 3, 3, 7, 0] } }
    ],
    country: [
        { name: "Three Chords & Truth (I-IV-I-V)", patterns: { 4: [0, 3, 0, 4], 8: [0, 3, 0, 4, 0, 3, 4, 3], 16: [0, 3, 0, 4, 0, 3, 0, 4, 3, 0, 4, 3, 0, 3, 4, 0] } },
        { name: "Honky Tonk Verse (I-I-IV-I)", patterns: { 4: [0, 0, 3, 0], 8: [0, 0, 3, 0, 0, 0, 4, 4], 16: [0, 0, 3, 0, 0, 0, 4, 4, 3, 3, 0, 0, 4, 4, 0, 0] } },
        { name: "Outlaw Rebel Loop (I-bVII-IV-I)", patterns: { 4: [0, 7, 3, 0], 8: [0, 7, 3, 0, 0, 7, 3, 0], 16: [0, 7, 3, 0, 0, 7, 3, 0, 7, 3, 0, 7, 3, 3, 0, 0] } },
        { name: "Sweet Country Waltz (I-V-IV-I)", patterns: { 4: [0, 4, 3, 0], 8: [0, 4, 3, 0, 0, 4, 3, 0], 16: [0, 4, 3, 0, 0, 4, 3, 0, 4, 3, 0, 4, 3, 3, 4, 0] } },
        { name: "Emotional Resign (vi-IV-I-V)", patterns: { 4: [5, 3, 0, 4], 8: [5, 3, 0, 4, 5, 3, 0, 4], 16: [5, 3, 0, 4, 5, 3, 0, 4, 5, 3, 5, 3, 0, 0, 4, 4] } },
        { name: "Bluegrass Standard (I-V-I-I)", patterns: { 4: [0, 4, 0, 0], 8: [0, 4, 0, 0, 0, 3, 0, 0], 16: [0, 4, 0, 0, 0, 3, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0] } },
        { name: "Nashville Cadence (ii-V-I-I)", patterns: { 4: [1, 4, 0, 0], 8: [1, 4, 0, 0, 1, 4, 0, 0], 16: [1, 4, 0, 0, 1, 4, 0, 0, 1, 1, 4, 4, 0, 0, 0, 0] } },
        { name: "Plagal Ascent (I-IV-V-I)", patterns: { 4: [0, 3, 4, 0], 8: [0, 3, 4, 0, 0, 3, 4, 4], 16: [0, 3, 4, 0, 0, 3, 4, 0, 3, 4, 0, 3, 4, 4, 0, 0] } },
        { name: "Campfire Loop (I-vi-ii-V)", patterns: { 4: [0, 5, 1, 4], 8: [0, 5, 1, 4, 0, 5, 1, 4], 16: [0, 5, 1, 4, 0, 5, 1, 4, 5, 1, 4, 5, 1, 1, 4, 4] } },
        { name: "Southern Double-Plagal (I-IV-bVII-I)", patterns: { 4: [0, 3, 7, 0], 8: [0, 3, 7, 0, 0, 3, 7, 0], 16: [0, 3, 7, 0, 0, 3, 7, 0, 3, 7, 0, 3, 7, 7, 0, 0] } }
    ],
    rap: [
        { name: "Hypnotic Minor (i-bVI-bVII-V)", patterns: { 4: [0, 5, 6, 7], 8: [0, 5, 6, 5, 0, 5, 6, 7], 16: [0, 5, 6, 7, 0, 5, 6, 7, 3, 5, 0, 7, 3, 5, 6, 7] } },
        { name: "Sad Trap (i-bVI-bIII-bVII)", patterns: { 4: [0, 5, 2, 6], 8: [0, 5, 2, 6, 0, 5, 2, 6], 16: [0, 5, 2, 6, 0, 5, 2, 6, 0, 5, 0, 5, 2, 2, 6, 6] } },
        { name: "Phonk Loop (i-v-bVI-v)", patterns: { 4: [0, 4, 5, 4], 8: [0, 4, 5, 4, 0, 4, 5, 4], 16: [0, 4, 5, 4, 0, 4, 5, 4, 0, 5, 0, 5, 4, 4, 0, 0] } },
        { name: "Dark Trap (i-ii°-i-V)", patterns: { 4: [0, 1, 0, 7], 8: [0, 1, 0, 7, 0, 1, 0, 7], 16: [0, 1, 0, 7, 0, 1, 0, 7, 1, 7, 0, 1, 0, 0, 7, 7] } },
        { name: "Boom Bap Classic (i-iv-bVII-bIII)", patterns: { 4: [0, 3, 6, 2], 8: [0, 3, 6, 2, 0, 3, 6, 2], 16: [0, 3, 6, 2, 0, 3, 6, 2, 3, 6, 0, 2, 3, 3, 6, 6] } },
        { name: "Melancholy Chill (i-bIII-bVI-V)", patterns: { 4: [0, 2, 5, 7], 8: [0, 2, 5, 7, 0, 2, 5, 7], 16: [0, 2, 5, 7, 0, 2, 5, 7, 2, 5, 0, 7, 2, 2, 5, 7] } },
        { name: "Neo-Noir (i-bVII-bVI-bVII)", patterns: { 4: [0, 6, 5, 6], 8: [0, 6, 5, 6, 0, 6, 5, 6], 16: [0, 6, 5, 6, 0, 6, 5, 6, 5, 6, 0, 6, 5, 5, 6, 6] } },
        { name: "Spanish Trap (i-bVI-V-V)", patterns: { 4: [0, 5, 7, 7], 8: [0, 5, 7, 7, 0, 5, 7, 7], 16: [0, 5, 7, 7, 0, 5, 7, 7, 5, 7, 0, 7, 5, 5, 7, 7] } },
        { name: "West Coast G-Funk (i-iv-i-iv)", patterns: { 4: [0, 3, 0, 3], 8: [0, 3, 0, 3, 0, 3, 0, 7], 16: [0, 3, 0, 3, 0, 3, 0, 7, 3, 7, 0, 3, 0, 0, 7, 7] } },
        { name: "Cloud Rap (bVI-bVII-i-i)", patterns: { 4: [5, 6, 0, 0], 8: [5, 6, 0, 0, 5, 6, 0, 0], 16: [5, 6, 0, 0, 5, 6, 0, 0, 5, 6, 5, 6, 0, 0, 0, 0] } }
    ],
    blues: [
        { name: "12-Bar Standard (I-IV-V-IV)", patterns: { 4: [0, 3, 4, 3], 8: [0, 0, 3, 0, 4, 3, 0, 4], 16: [0, 0, 3, 0, 4, 3, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4] } },
        { name: "Quick Change Blues (I-IV-I-V)", patterns: { 4: [0, 3, 0, 4], 8: [0, 3, 0, 0, 3, 3, 0, 4], 16: [0, 3, 0, 0, 3, 3, 0, 0, 4, 3, 0, 0, 4, 3, 0, 4] } },
        { name: "Slow Blues Burn (I-I-IV-V)", patterns: { 4: [0, 0, 3, 4], 8: [0, 0, 0, 0, 3, 3, 0, 4], 16: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 0, 4, 3, 0, 0] } },
        { name: "Jazz Blues Turn (I-IV-ii-V)", patterns: { 4: [0, 3, 1, 4], 8: [0, 3, 0, 0, 3, 3, 1, 4], 16: [0, 3, 0, 0, 3, 3, 0, 0, 1, 4, 0, 0, 1, 4, 0, 4] } },
        { name: "St. Louis Shuffle (I-bVII-IV-I)", patterns: { 4: [0, 7, 3, 0], 8: [0, 7, 3, 0, 0, 7, 3, 4], 16: [0, 7, 3, 0, 0, 7, 3, 0, 7, 3, 0, 7, 3, 3, 4, 0] } },
        { name: "Misty Morning (I-vi-ii-V)", patterns: { 4: [0, 5, 1, 4], 8: [0, 5, 1, 4, 0, 5, 1, 4], 16: [0, 5, 1, 4, 0, 5, 1, 4, 5, 1, 0, 4, 5, 1, 4, 4] } },
        { name: "Chicago Style (I-IV-V-V)", patterns: { 4: [0, 3, 4, 4], 8: [0, 0, 3, 3, 4, 4, 0, 4], 16: [0, 0, 3, 3, 4, 4, 0, 0, 3, 3, 4, 4, 0, 3, 4, 4] } },
        { name: "West Side Boogie (I-I-I-V)", patterns: { 4: [0, 0, 0, 4], 8: [0, 0, 0, 0, 3, 3, 0, 4], 16: [0, 0, 0, 0, 3, 3, 0, 0, 3, 3, 0, 0, 4, 4, 0, 4] } },
        { name: "Delta Acoustic (I-bVII-I-I)", patterns: { 4: [0, 7, 0, 0], 8: [0, 7, 0, 0, 3, 7, 0, 4], 16: [0, 7, 0, 0, 3, 7, 0, 0, 7, 0, 7, 0, 3, 3, 4, 0] } },
        { name: "Gospel Blues Cadence (I-IV-I-I)", patterns: { 4: [0, 3, 0, 0], 8: [0, 3, 0, 0, 4, 3, 0, 0], 16: [0, 3, 0, 0, 4, 3, 0, 0, 3, 3, 0, 0, 4, 3, 0, 0] } }
    ],
    lofi: [
        { name: "Melancholy Chill (i-bVI-bIII-v)", patterns: { 4: [0, 5, 2, 4], 8: [0, 0, 5, 5, 2, 2, 4, 4], 16: [0, 5, 2, 4, 0, 5, 2, 4, 0, 5, 2, 4, 0, 5, 4, 4] } },
        { name: "Dreamy Jazz-Hop (i-iv-bVII-bIII)", patterns: { 4: [0, 3, 6, 2], 8: [0, 3, 6, 2, 0, 3, 6, 2], 16: [0, 3, 6, 2, 0, 3, 6, 2, 3, 6, 0, 2, 3, 3, 6, 6] } },
        { name: "Cozy Fireplace (bVI-V-i-i)", patterns: { 4: [5, 7, 0, 0], 8: [5, 7, 0, 0, 5, 7, 0, 0], 16: [5, 7, 0, 0, 5, 7, 0, 0, 5, 7, 5, 7, 0, 0, 0, 0] } },
        { name: "Rainy Day Coffee (iv-bVII-bIII-bVI)", patterns: { 4: [3, 6, 2, 5], 8: [3, 6, 2, 5, 3, 6, 2, 5], 16: [3, 6, 2, 5, 3, 6, 2, 5, 3, 6, 3, 6, 2, 2, 5, 5] } },
        { name: "Vintage Nostalgia (i-bVII-bVI-V)", patterns: { 4: [0, 6, 5, 7], 8: [0, 6, 5, 7, 0, 6, 5, 7], 16: [0, 6, 5, 7, 0, 6, 5, 7, 6, 5, 0, 7, 6, 6, 5, 7] } },
        { name: "Summer Breeze (i-bVI-i-bVI)", patterns: { 4: [0, 5, 0, 5], 8: [0, 5, 0, 5, 0, 5, 6, 6], 16: [0, 5, 0, 5, 0, 5, 6, 6, 0, 5, 0, 5, 6, 6, 7, 7] } },
        { name: "Midnight Star (i-v-iv-v)", patterns: { 4: [0, 4, 3, 4], 8: [0, 4, 3, 4, 0, 4, 3, 4], 16: [0, 4, 3, 4, 0, 4, 3, 4, 3, 4, 0, 4, 3, 3, 4, 4] } },
        { name: "Vinyl Static (bVI-bVI-i-i)", patterns: { 4: [5, 5, 0, 0], 8: [5, 5, 0, 0, 6, 6, 0, 0], 16: [5, 5, 0, 0, 6, 6, 0, 0, 5, 5, 6, 6, 0, 0, 0, 0] } },
        { name: "Muted Memories (iv-v-i-i)", patterns: { 4: [3, 4, 0, 0], 8: [3, 4, 0, 0, 3, 4, 0, 0], 16: [3, 4, 0, 0, 3, 4, 0, 0, 3, 3, 4, 4, 0, 0, 0, 0] } },
        { name: "Lofi Sunset (bIII-bVI-bVII-i)", patterns: { 4: [2, 5, 6, 0], 8: [2, 5, 6, 0, 2, 5, 6, 0], 16: [2, 5, 6, 0, 2, 5, 6, 0, 5, 6, 2, 0, 5, 5, 6, 0] } }
    ]
};

export function cleanDissonance(notes) {
    let voiced = [...notes];
    voiced.sort((a, b) => a - b);
    
    // If any two notes are within 2 semitones (minor/major second clashes),
    // we shift the higher note of the colliding pair up by 12 semitones to open the voicing.
    let attempts = 0;
    while (attempts < 5) {
        let hasClash = false;
        voiced.sort((a, b) => a - b);
        for (let i = 0; i < voiced.length - 1; i++) {
            let diff = voiced[i+1] - voiced[i];
            if (diff <= 2) {
                voiced[i+1] += 12;
                hasClash = true;
                break;
            }
        }
        if (!hasClash) break;
        attempts++;
    }
    
    // Safety check: if clash remains, drop the higher colliding note completely
    voiced.sort((a, b) => a - b);
    let finalClean = [];
    for (let i = 0; i < voiced.length; i++) {
        let clash = false;
        for (let j = 0; j < finalClean.length; j++) {
            let diff = Math.abs(voiced[i] - finalClean[j]);
            if (diff <= 2) {
                clash = true;
                break;
            }
        }
        if (!clash) {
            finalClean.push(voiced[i]);
        }
    }
    return finalClean;
}

export function computeChords(state) {
    const { hour, minute, genre, accumulatedKeyOffset, progressionVariant = 0 } = state;
    
    let derivedBpm = 60;
    let vibe = "";
    if (state.selectedVibe && state.selectedVibe !== 'auto') {
        // User-selected vibe override
        if (state.selectedVibe === 'morning') {
            derivedBpm = 65;
            vibe = "Morning (Simple Mode)";
        } else if (state.selectedVibe === 'afternoon') {
            derivedBpm = 126;
            vibe = "Afternoon (Rocky/Heavy Mode)";
        } else if (state.selectedVibe === 'night') {
            derivedBpm = 80;
            vibe = "Night (Chill Mode)";
        }
    } else {
        // Auto: time-of-day seeded
        if (hour >= 3 && hour < 12) {
            derivedBpm = 65; 
            vibe = "Morning (Simple Mode)";
        } else if (hour >= 12 && hour < 18) {
            derivedBpm = 126; 
            vibe = "Afternoon (Rocky/Heavy Mode)";
        } else {
            derivedBpm = 80; 
            vibe = "Night (Chill Mode)";
        }
    }

    let scaleMode = "major"; 
    if (genre === "rap" || genre === "lofi") {
        scaleMode = "minor";
    }

    const genreVariants = PROGRESSION_VARIANTS[genre] || PROGRESSION_VARIANTS["pop"];
    const selectedVariant = genreVariants[progressionVariant] || genreVariants[0];
    const interstatePatterns = selectedVariant.patterns;

    let activeKeyIndex;
    if (state.selectedKey && state.selectedKey !== 'auto') {
        // User-selected key override
        activeKeyIndex = (parseInt(state.selectedKey) + accumulatedKeyOffset) % 12;
        if (activeKeyIndex < 0) activeKeyIndex += 12;
    } else {
        // Auto: time-seeded key
        let baseKeyIndex = (hour + minute) % 12;
        activeKeyIndex = (baseKeyIndex + accumulatedKeyOffset) % 12;
        if (activeKeyIndex < 0) activeKeyIndex += 12;
    }

    const flavor = state.chordVoicingFlavor || '7th';
    const activeProfile = CHORD_PROFILES[flavor][scaleMode];
    let minuteInversionOffset = Math.floor(minute / 12); 

    const targetNotes = (degree, baseOctave = 60) => {
        const size = state.chordSize || 3;
        const intervals = activeProfile[degree].intervals.slice(0, size);
        return intervals.map((val, idx) => {
            let modulatedInterval = val + (idx === 1 ? minuteInversionOffset : 0);
            return activeKeyIndex + modulatedInterval + baseOctave;
        });
    };

    const getChordsForLength = (len) => {
        let chords = [];
        let names = [];
        let preciseChords = [];
        interstatePatterns[len].forEach(d => {
            let idx = d % activeProfile.length; 
            let rawNotes = targetNotes(idx);
            let cleanedNotes = cleanDissonance(rawNotes);
            chords.push(cleanedNotes); 
            names.push(activeProfile[idx].name);
            preciseChords.push(getAbsoluteChordName(activeKeyIndex, scaleMode, activeProfile[idx].name, flavor, state.chordSize));
        });
        return { chords, names, preciseChords };
    };

    return {
        derivedBpm,
        vibe,
        scaleMode,
        activeKeyIndex,
        keyName: KEYS[activeKeyIndex] + (scaleMode === "major" ? " Major" : " Minor"),
        loop4: getChordsForLength(4),
        loop8: getChordsForLength(8),
        loop16: getChordsForLength(16),
    };
}
