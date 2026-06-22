import { LISTS } from './layout.js';

export class SaveItController {
    constructor(container) {
        this.container = container;
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="save-it-card" style="
                background: #15151e;
                border: 1px solid #2d2d3d;
                border-radius: 12px;
                padding: 15px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="font-weight: bold; color: #a78bfa; font-size: 0.95rem;">Save & Recreate Vibe:</span>
                    <button id="copy-summary-btn" style="
                        padding: 6px 12px;
                        font-size: 0.8rem;
                        background: #6366f1;
                        border: none;
                        border-radius: 6px;
                        color: #ffffff;
                        cursor: pointer;
                        font-weight: bold;
                        transition: all 0.2s ease;
                    ">Copy Configuration</button>
                </div>
                <textarea id="summary-textarea" readonly style="
                    background: #0f0f15;
                    border: 1px solid #232330;
                    border-radius: 8px;
                    color: #10b981;
                    font-family: monospace;
                    font-size: 0.82rem;
                    padding: 10px;
                    width: 100%;
                    height: 140px;
                    resize: none;
                    box-sizing: border-box;
                    outline: none;
                "></textarea>
            </div>
        `;
    }

    bindEvents() {
        const copyBtn = document.getElementById('copy-summary-btn');
        const textarea = document.getElementById('summary-textarea');

        if (copyBtn && textarea) {
            copyBtn.addEventListener('click', () => {
                textarea.select();
                textarea.setSelectionRange(0, 99999);
                navigator.clipboard.writeText(textarea.value).then(() => {
                    const originalText = copyBtn.innerText;
                    copyBtn.innerText = "Copied!";
                    copyBtn.style.background = "#10b981";
                    setTimeout(() => {
                        copyBtn.innerText = originalText;
                        copyBtn.style.background = "#6366f1";
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        }
    }

    update(state) {
        const textarea = document.getElementById('summary-textarea');
        if (!textarea) return;

        const getLabel = (list, val) => {
            const item = list.find(x => x.value === String(val) || x.value === val);
            return item ? item.label : val;
        };

        const displayHour = state.hour % 12 === 0 ? 12 : state.hour % 12;
        const ampm = state.hour >= 12 ? "PM" : "AM";
        const formattedTime = `${String(displayHour).padStart(2, '0')}:${String(state.minute).padStart(2, '0')} ${ampm}`;

        const currentLoopData = (state.activeEngineMode === '16')
            ? state.chords.loop16
            : (state.activeEngineMode === '8' ? state.chords.loop8 : state.chords.loop4);

        const chordListStr = (currentLoopData && currentLoopData.preciseChords)
            ? currentLoopData.preciseChords.join(" - ")
            : "None";

        const summaryText = `======================================================
🎵 TUNE OF DAY RECREATION SCHEMA 🎵
======================================================
[Seeded Time & Date]
• Date: ${state.date}
• Time: ${formattedTime}
• Lock State: ${state.isLocked ? 'Locked' : 'Unlocked'}

[Chords & Harmonic Profile]
• Musical Key Override: ${getLabel(LISTS.musicalKeys, state.selectedKey)}
• Vibe Filter Override: ${getLabel(LISTS.vibeFilters, state.selectedVibe)}
• Genre Profile: ${getLabel(LISTS.genres, state.genre)}
• Progression Variant: ${state.progressionVariant}
• Scale / Key: ${state.keyName} (${state.scaleMode}) (Vibe: ${state.vibe})
• Chord Size: ${state.chordSize} Notes
• Voicing Extension: ${state.chordVoicingFlavor}
• Loop Length: ${state.activeEngineMode} bars
• Precise Loop Chords: ${chordListStr}

[Arpeggiator 1 (Wurlitzer)]
• Voicing Mode: ${getLabel(LISTS.voicingModes, state.arp1Voicing)}
• Style Preset: ${state.dynamicArpStyles[state.arpStyleIndex]?.name || 'N/A'}
• Playback Mode: ${getLabel(LISTS.arpModes, state.arp1Mode)}
• Melodic Pattern: ${getLabel(LISTS.arpPatternStyles, state.arp1Pattern)}
• Rest Mode: ${getLabel(LISTS.arpRests, state.arp1Rest)}
• Note Count: ${getLabel(LISTS.arpNoteCounts, state.arp1NoteCount)}
• Latch Mode: ${state.arp1Latch ? 'On' : 'Off'}
• Gate Length: ${state.arp1Gate}
• Swing Timing: ${state.arp1Swing}%
• Volume: ${state.volumeArp1Boost}

[Arpeggiator 2 (Analog Lead)]
• Voicing Mode: ${getLabel(LISTS.voicingModes, state.arp2Voicing)}
• Style Preset: ${state.dynamicArpStyles[state.arpStyle2Index]?.name || 'N/A'}
• Playback Mode: ${getLabel(LISTS.arpModes, state.arp2Mode)}
• Melodic Pattern: ${getLabel(LISTS.arpPatternStyles, state.arp2Pattern)}
• Rest Mode: ${getLabel(LISTS.arpRests, state.arp2Rest)}
• Note Count: ${getLabel(LISTS.arpNoteCounts, state.arp2NoteCount)}
• Latch Mode: ${state.arp2Latch ? 'On' : 'Off'}
• Gate Length: ${state.arp2Gate}
• Swing Timing: ${state.arp2Swing}%
• Volume: ${state.volumeArp2Boost}

[Drums Configuration]
• Hi-Hat Groove: ${getLabel(LISTS.hatGrooves, state.hatGroove)}
• Kick Rhythm: ${getLabel(LISTS.kickPatterns, state.kickPattern)}
• Snare Rhythm: ${getLabel(LISTS.snarePatterns, state.snarePattern)}
• Mix Levels: Master=${state.volumeDrumBoost} | Kick=${state.drumKickVolume} | Snare=${state.drumSnareVolume} | Hat=${state.drumHatVolume}

======================================================
Copy and paste this config text to save your vibe!
======================================================`;

        textarea.value = summaryText;
    }
}
