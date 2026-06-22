import { LISTS } from './layout.js';

export class SettingsArp2 {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="settings-card">
                <h3 style="color: #f97316;">Global Arp 2 Style</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Voicing Mode:</span>
                    <select id="arp2-voicing-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Arpeggiator 2 Style (Time):</span>
                    <select id="arp-style-2-select"></select>
                </div>
            </div>

            <div class="settings-card">
                <h3 style="color: #f97316;">Arpeggiator 2 (Analog Lead) Settings</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Playback Mode:</span>
                    <select id="arp2-mode-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Melodic Pattern:</span>
                    <select id="arp2-pattern-select"></select>
                </div>
                 <div class="selector-container" style="width: 100%;">
                    <span>Rest Mode:</span>
                    <select id="arp2-rest-select"></select>
                </div>
                 <div class="selector-container" style="width: 100%;">
                    <span>Arpeggiator Notes (Length):</span>
                    <select id="arp2-note-count-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Latch Mode:</span>
                    <input type="checkbox" id="arp2-latch-checkbox" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Gate Length:</span>
                    <input type="range" id="arp2-gate-slider" min="0.1" max="1.5" step="0.05" value="0.6">
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Swing Timing:</span>
                    <input type="range" id="arp2-swing-slider" min="0" max="100" step="1" value="0">
                </div>
            </div>
        `;

        this.populateSelect(document.getElementById('arp2-voicing-select'), LISTS.voicingModes, 'single');
        this.populateSelect(document.getElementById('arp2-mode-select'), LISTS.arpModes, 'up');
        this.populateSelect(document.getElementById('arp2-pattern-select'), LISTS.arpPatternStyles, 'straight');
        this.populateSelect(document.getElementById('arp2-rest-select'), LISTS.arpRests, 'none');
        this.populateSelect(document.getElementById('arp2-note-count-select'), LISTS.arpNoteCounts, '8');
    }

    populateSelect(selectEl, listData, defaultValue) {
        if (!selectEl) return;
        selectEl.innerHTML = '';
        listData.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.value;
            opt.innerText = item.label;
            if (item.value === defaultValue) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });
    }

    populate(state) {
        const syncValue = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = !!val;
                } else {
                    el.value = val;
                    const readout = document.getElementById(`${id}-readout`);
                    if (readout) {
                        readout.innerText = typeof val === 'number' ? val.toFixed(1) : val;
                    }
                }
            }
        };

        syncValue('arp2-voicing-select', state.arp2Voicing);
        syncValue('arp-style-2-select', state.arpStyle2Index);
        syncValue('arp2-mode-select', state.arp2Mode);
        syncValue('arp2-pattern-select', state.arp2Pattern);
        syncValue('arp2-rest-select', state.arp2Rest);
        syncValue('arp2-note-count-select', state.arp2NoteCount);
        syncValue('arp2-latch-checkbox', state.arp2Latch);
        syncValue('arp2-gate-slider', state.arp2Gate);
        syncValue('arp2-swing-slider', state.arp2Swing);
    }
}
