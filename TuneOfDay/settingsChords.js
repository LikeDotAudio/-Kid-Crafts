import { LISTS } from './layout.js';

export class SettingsChords {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="settings-card">
                <h3 style="color: #10b981;">Chords Engine Settings</h3>
                <div class="selector-container" style="width: 100%;">
                    <span>Musical Key:</span>
                    <select id="key-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Vibe Filter:</span>
                    <select id="vibe-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Genre Core Profile:</span>
                    <select id="genre-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Progression Variant:</span>
                    <select id="progression-variant-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Chord Notes (Size):</span>
                    <select id="chord-size-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Voicing Flavor:</span>
                    <select id="chord-voicing-select"></select>
                </div>
                <div class="selector-container" style="width: 100%;">
                    <span>Structural Arrangement Cuts:</span>
                    <select id="structural-cut-select"></select>
                </div>
            </div>
        `;

        this.populateSelect(document.getElementById('key-select'), LISTS.musicalKeys, 'auto');
        this.populateSelect(document.getElementById('vibe-select'), LISTS.vibeFilters, 'auto');
        this.populateSelect(document.getElementById('genre-select'), LISTS.genres, 'pop');
        this.populateSelect(document.getElementById('chord-size-select'), LISTS.chordSizes, '3');
        this.populateSelect(document.getElementById('chord-voicing-select'), LISTS.chordVoicings, '7th');
        this.populateSelect(document.getElementById('structural-cut-select'), LISTS.arrangementCuts, 'dead_stop');
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
            }
        };
        syncValue('key-select', state.selectedKey);
        syncValue('vibe-select', state.selectedVibe);
        syncValue('genre-select', state.genre);
        syncValue('progression-variant-select', state.progressionVariant);
        syncValue('chord-size-select', state.chordSize);
        syncValue('chord-voicing-select', state.chordVoicingFlavor);
        syncValue('structural-cut-select', state.arrangementCutStyle);
    }
}
