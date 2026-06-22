import { LISTS } from './layout.js';

export class SettingsDrums {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="settings-card">
                <h3 style="color: #f43f5e;">Drums Groove Settings</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Hi-Hat Groove Matrix:</span>
                    <select id="hat-groove-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Kick Pattern Rhythm:</span>
                    <select id="kick-pattern-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Snare Pattern Rhythm:</span>
                    <select id="snare-pattern-select"></select>
                </div>
            </div>

            <div class="settings-card">
                <h3 style="color: #f43f5e;">Individual Drum Volumes</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Kick Volume:</span>
                    <input type="range" id="drum-kick-volume" min="0.0" max="2.0" step="0.1" value="1.0">
                    <span id="drum-kick-volume-readout" class="mixer-readout">1.0</span>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Snare Volume:</span>
                    <input type="range" id="drum-snare-volume" min="0.0" max="2.0" step="0.1" value="1.0">
                    <span id="drum-snare-volume-readout" class="mixer-readout">1.0</span>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Hi-Hat Volume:</span>
                    <input type="range" id="drum-hat-volume" min="0.0" max="2.0" step="0.1" value="1.0">
                    <span id="drum-hat-volume-readout" class="mixer-readout">1.0</span>
                </div>
            </div>
        `;

        this.populateSelect(document.getElementById('hat-groove-select'), LISTS.hatGrooves, 'straight_8');
        this.populateSelect(document.getElementById('kick-pattern-select'), LISTS.kickPatterns, 'four_on_floor');
        this.populateSelect(document.getElementById('snare-pattern-select'), LISTS.snarePatterns, 'backbeat');
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
                el.value = val;
                const readout = document.getElementById(`${id}-readout`);
                if (readout) {
                    readout.innerText = typeof val === 'number' ? val.toFixed(1) : val;
                }
            }
        };

        syncValue('hat-groove-select', state.hatGroove);
        syncValue('kick-pattern-select', state.kickPattern);
        syncValue('snare-pattern-select', state.snarePattern);
        syncValue('drum-kick-volume', state.drumKickVolume);
        syncValue('drum-snare-volume', state.drumSnareVolume);
        syncValue('drum-hat-volume', state.drumHatVolume);
    }
}
