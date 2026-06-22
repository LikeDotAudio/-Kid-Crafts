import { LISTS } from './layout.js';

export class SettingsArp1 {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="settings-card">
                <h3 style="color: #6366f1;">Global Arp 1 Style</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Voicing Mode:</span>
                    <select id="arp1-voicing-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Arpeggiator 1 Style (Time):</span>
                    <select id="arp-style-select"></select>
                </div>
            </div>

            <div class="settings-card">
                <h3 style="color: #6366f1;">Arpeggiator 1 (Wurli 12) Settings</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Playback Mode:</span>
                    <select id="arp1-mode-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Melodic Pattern:</span>
                    <select id="arp1-pattern-select"></select>
                </div>
                 <div class="selector-container" style="width: 100%;">
                    <span>Rest Mode:</span>
                    <select id="arp1-rest-select"></select>
                </div>
                 <div class="selector-container" style="width: 100%;">
                    <span>Arpeggiator Notes (Length):</span>
                    <select id="arp1-note-count-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Latch Mode:</span>
                    <input type="checkbox" id="arp1-latch-checkbox" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Gate Length:</span>
                    <input type="range" id="arp1-gate-slider" min="0.1" max="1.5" step="0.05" value="0.6">
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Swing Timing:</span>
                    <input type="range" id="arp1-swing-slider" min="0" max="100" step="1" value="0">
                </div>
            </div>
        `;

        this.populateSelect(document.getElementById('arp1-voicing-select'), LISTS.voicingModes, 'single');
        this.populateSelect(document.getElementById('arp1-mode-select'), LISTS.arpModes, 'up');
        this.populateSelect(document.getElementById('arp1-pattern-select'), LISTS.arpPatternStyles, 'straight');
        this.populateSelect(document.getElementById('arp1-rest-select'), LISTS.arpRests, 'none');
        this.populateSelect(document.getElementById('arp1-note-count-select'), LISTS.arpNoteCounts, '8');
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

        syncValue('arp1-voicing-select', state.arp1Voicing);
        syncValue('arp-style-select', state.arpStyleIndex);
        syncValue('arp1-mode-select', state.arp1Mode);
        syncValue('arp1-pattern-select', state.arp1Pattern);
        syncValue('arp1-rest-select', state.arp1Rest);
        syncValue('arp1-note-count-select', state.arp1NoteCount);
        syncValue('arp1-latch-checkbox', state.arp1Latch);
        syncValue('arp1-gate-slider', state.arp1Gate);
        syncValue('arp1-swing-slider', state.arp1Swing);
    }
}
