/**
 * Dynamic Layout Builder
 * Keeps Index.html minimal and builds DOM elements and selector lists programmatically.
 */

export const LISTS = {
    genres: [
        { value: "pop", label: "Pop (Four-Chord Magic)" },
        { value: "rock", label: "Rock (Power & Flat-VII Roots)" },
        { value: "country", label: "Country (Three Chords & Truth)" },
        { value: "rap", label: "Rap/Hip-Hop (Hypnotic Minor Loops)" },
        { value: "blues", label: "Blues (I-IV-V Compression)" },
        { value: "lofi", label: "Lo-Fi (Melancholy v-i loops)" }
    ],
    chordSizes: [
        { value: "3", label: "3 Notes (Triads)" },
        { value: "4", label: "4 Notes (7th Chords)" },
        { value: "5", label: "5 Notes (9th Chords)" }
    ],
    chordVoicings: [
        { value: "7th", label: "7th / 9th Extensions" },
        { value: "6th", label: "6th / 6/9 Extensions" }
    ],
    arpModes: [
        { value: "off", label: "Off (Deactivated)" },
        { value: "up", label: "Up (Ascending)" },
        { value: "down", label: "Down (Descending)" },
        { value: "updown", label: "Up/Down (Alternate)" },
        { value: "asplayed", label: "As Played (Sequential)" },
        { value: "random", label: "Random (Generative)" },
        { value: "chord", label: "Chord (Rhythmic Stabs)" },
        { value: "root", label: "Root (Chord Bass)" }
    ],
    arpPatternStyles: [
        { value: "straight", label: "Straight (Consistent Motorik)" },
        { value: "triplets", label: "Triplets (Swinging Tri-Beat)" },
        { value: "syncopated", label: "Syncopated (Groove Holes)" },
        { value: "octave", label: "Octave Jump (Sweeping Range)" },
        { value: "broken", label: "Broken Chords (Harmonic Jumps)" },
        { value: "glitch", label: "Glitch/Stutter (Rapid Chops)" }
    ],
    hatGrooves: [
        { value: "straight_8", label: "Straight 8th Notes Drive" },
        { value: "trap_rolls", label: "Syncopated Trap Double-Time" },
        { value: "offbeat_disco", label: "Offbeat Disco Up-Chops" },
        { value: "shuffle", label: "Classic Swing Shuffle" },
        { value: "muted", label: "Mute Hi-Hats" }
    ],
    voicingModes: [
        { value: "single", label: "Single Note Voice" },
        { value: "doubles", label: "Octave Doubling" },
        { value: "triples", label: "Rich Triad Voicing" }
    ],
    arrangementCuts: [
        { value: "none", label: "Continuous Loop (No Breaks)" },
        { value: "dead_stop", label: "Dead Stop (Silence on Last 2 Beats)" },
        { value: "gated_hitch", label: "Gated Pause (Mute on Beat 4)" },
        { value: "diamond_decay", label: "Diamond Decay (Ring out final chord only)" }
    ],
    arpRests: [
        { value: "none", label: "None (Full Density)" },
        { value: "sparse", label: "Sparse Random (70% Prob)" },
        { value: "euclidean", label: "Euclidean Grid (Math Rests)" },
        { value: "velocity_lfo", label: "Velocity-Triggered LFO" },
        { value: "human", label: "Off-beat Humanized" },
        { value: "call_response", label: "Call & Response Density" }
    ],
    kickPatterns: [
        { value: "four_on_floor", label: "Four-on-the-Floor" },
        { value: "downbeat", label: "Downbeat Only" },
        { value: "syncopated", label: "Syncopated Pop Kick" },
        { value: "boomboop", label: "Boom Bap Double" },
        { value: "muted", label: "Mute Kick" }
    ],
    snarePatterns: [
        { value: "backbeat", label: "Standard Backbeat" },
        { value: "double_time", label: "Double Time Snare" },
        { value: "syncopated", label: "Offbeat Syncopated" },
        { value: "muted", label: "Mute Snare" }
    ],
    arpNoteCounts: [
        { value: "2", label: "2 Notes (Slow)" },
        { value: "4", label: "4 Notes" },
        { value: "8", label: "8 Notes (Default)" },
        { value: "16", label: "16 Notes (Fast)" },
        { value: "32", label: "32 Notes (Rapid)" }
    ],
    musicalKeys: [
        { value: "auto", label: "Auto (Time-Seeded)" },
        { value: "0", label: "C" },
        { value: "1", label: "C# / Db" },
        { value: "2", label: "D" },
        { value: "3", label: "D# / Eb" },
        { value: "4", label: "E" },
        { value: "5", label: "F" },
        { value: "6", label: "F# / Gb" },
        { value: "7", label: "G" },
        { value: "8", label: "G# / Ab" },
        { value: "9", label: "A" },
        { value: "10", label: "A# / Bb" },
        { value: "11", label: "B" }
    ],
    vibeFilters: [
        { value: "auto", label: "Auto (Time-of-Day)" },
        { value: "morning", label: "Morning (Simple Mode) — 65 BPM" },
        { value: "afternoon", label: "Afternoon (Rocky/Heavy) — 126 BPM" },
        { value: "night", label: "Night (Chill Mode) — 80 BPM" }
    ]
};

export function buildLayout(targetElement) {
    targetElement.innerHTML = `
        <div id="splash-lock">
            <div class="splash-box">
                <h2>Tune Of Day</h2>
                <p style="color: #94a3b8;">Click below to engage vintage modeling matrices and auto-start engine.</p>
                <button class="splash-btn" id="engage-btn">Engage Engine</button>
            </div>
        </div>

        <div class="container">
            <!-- Top Half Section -->
            <div class="top-section">
                <!-- Clock Column -->
                <div class="clock-column">
                    <div class="clock-row-layout" style="display: flex; align-items: center; gap: 15px; position: relative;">
                        <svg id="clock-svg" viewBox="0 0 250 250">
                            <circle cx="125" cy="125" r="115" fill="none" stroke="#475569" stroke-width="2"/>
                            <line x1="125" y1="10" x2="125" y2="22" stroke="#94a3b8" stroke-width="3"/>
                            <line x1="240" y1="125" x2="228" y2="125" stroke="#94a3b8" stroke-width="3"/>
                            <line x1="125" y1="240" x2="125" y2="228" stroke="#94a3b8" stroke-width="3"/>
                            <line x1="10" y1="125" x2="22" y2="125" stroke="#94a3b8" stroke-width="3"/>
                            <text x="125" y="34" class="clock-text">12</text>
                            <text x="216" y="125" class="clock-text">3</text>
                            <text x="125" y="218" class="clock-text">6</text>
                            <text x="34" y="125" class="clock-text">9</text>
                            <line id="hour-hand" x1="125" y1="125" x2="125" y2="70" class="hand" />
                            <line id="minute-hand" x1="125" y1="125" x2="125" y2="40" class="hand" />
                            <circle cx="125" cy="125" r="7" fill="#ffffff"/>
                            
                            <!-- Lock overlay layer -->
                            <g id="clock-lock-overlay" class="lock-overlay" style="display: none;">
                                <circle cx="125" cy="125" r="115" fill="rgba(10, 10, 15, 0.75)" />
                                <g transform="translate(101, 105) scale(2)">
                                    <path d="M8 8V5a4 4 0 1 1 8 0v3" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
                                    <rect x="5" y="8" width="14" height="11" rx="2" fill="#f59e0b" />
                                    <circle cx="12" cy="13" r="1.5" fill="#1e1b4b" />
                                    <path d="M12 14.5v2.5" stroke="#1e1b4b" stroke-width="1.5" stroke-linecap="round"/>
                                </g>
                            </g>
                        </svg>
                        <button id="clock-lock-btn" class="lock-toggle-btn" title="Toggle Lock Time">
                            <svg viewBox="0 0 24 24" width="22" height="22">
                                <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6-5c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm6 17H6V10h12v10z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    <div class="time-row">
                        <div class="time-display" id="digital-time">10:30</div>
                        <button class="ampm-btn" id="ampm-toggle-btn">PM</button>
                    </div>
                    <input type="date" id="calendar-input">
                </div>
            </div>

            <!-- Lower Section: Tabs Controller -->
            <div class="lower-section">
                <div class="tabs-nav">
                    <button class="tab-btn active" data-tab="matrix">Matrix Harmonics</button>
                    <button class="tab-btn" data-tab="keyboard">Keyboard View</button>
                    <button class="tab-btn" data-tab="settings">Instruments</button>
                </div>
                <div class="tab-panes">
                    <div class="tab-pane" id="tab-matrix-container"></div>
                    <div class="tab-pane" id="tab-keyboard-container" style="display: none;"></div>
                    <div class="tab-pane" id="tab-settings-container" style="display: none;"></div>
                </div>
                <div id="save-it-container" style="width: 100%; margin-top: 15px; display: none;"></div>
            </div>
        </div>

        <header>
            <h1 id="footer-title" style="cursor: pointer; user-select: none;">Tune Of Day <span class="auto-badge">B3 Organ & Wurli Modeling Active</span></h1>
            <p class="subtitle">Designed by Anthony Kuzub</p>
        </header>
    `;
}
