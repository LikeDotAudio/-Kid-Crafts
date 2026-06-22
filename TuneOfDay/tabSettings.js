/**
 * Engine Settings Tab
 * Manages parameter dropdown select inputs and ranges.
 */
import { SettingsChords } from './settingsChords.js';
import { SettingsArp1 } from './settingsArp1.js';
import { SettingsArp2 } from './settingsArp2.js';
import { SettingsDrums } from './settingsDrums.js';

export class TabSettings {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <!-- Mixer section before sub tabs -->
            <div class="mixer-section">
                <div class="mixer-channel" style="border-top: 3px solid #10b981;">
                    <span>Chords</span>
                    <input type="range" id="volume-chord-boost" min="0.0" max="2.0" step="0.05" value="2.0">
                    <div class="mixer-readout" id="volume-chord-boost-readout">2.0</div>
                </div>
                <div class="mixer-channel" style="border-top: 3px solid #6366f1;">
                    <span>Arp 1</span>
                    <input type="range" id="volume-arp1-boost" min="0.0" max="2.0" step="0.05" value="0.5">
                    <div class="mixer-readout" id="volume-arp1-boost-readout">0.5</div>
                </div>
                <div class="mixer-channel" style="border-top: 3px solid #f97316;">
                    <span>Arp 2</span>
                    <input type="range" id="volume-arp2-boost" min="0.0" max="2.0" step="0.05" value="0.5">
                    <div class="mixer-readout" id="volume-arp2-boost-readout">0.5</div>
                </div>
                <div class="mixer-channel" style="border-top: 3px solid #f43f5e;">
                    <span>Drums</span>
                    <input type="range" id="volume-drum-boost" min="0.0" max="2.0" step="0.05" value="1.75">
                    <div class="mixer-readout" id="volume-drum-boost-readout">1.75</div>
                </div>
            </div>

            <!-- Sub Tab Content Panes -->
            <div class="settings-subtabs-content" style="width: 100%;">
                <!-- CHORDS PANE -->
                <div class="settings-subtab-pane" id="subtab-chords-pane"></div>

                <!-- ARP 1 PANE -->
                <div class="settings-subtab-pane" id="subtab-arp1-pane" style="display: none;"></div>

                <!-- ARP 2 PANE -->
                <div class="settings-subtab-pane" id="subtab-arp2-pane" style="display: none;"></div>

                <!-- DRUMS PANE -->
                <div class="settings-subtab-pane" id="subtab-drums-pane" style="display: none;"></div>
            </div>
        `;

        // Instantiate sub-settings panels
        this.chordsPanel = new SettingsChords(document.getElementById('subtab-chords-pane'));
        this.arp1Panel = new SettingsArp1(document.getElementById('subtab-arp1-pane'));
        this.arp2Panel = new SettingsArp2(document.getElementById('subtab-arp2-pane'));
        this.drumsPanel = new SettingsDrums(document.getElementById('subtab-drums-pane'));

        // Bind mixer faders and channels to activate corresponding settings tabs
        const bindFaderToTab = (faderId, tabName) => {
            const fader = this.container.querySelector(`#${faderId}`);
            if (fader) {
                const triggerTabSwitch = () => {
                    this.activateTab(tabName);
                };
                fader.addEventListener('mousedown', triggerTabSwitch);
                fader.addEventListener('touchstart', triggerTabSwitch);
                fader.addEventListener('input', triggerTabSwitch);
            }
            
            const channelDiv = fader?.closest('.mixer-channel');
            if (channelDiv) {
                channelDiv.addEventListener('click', () => {
                    this.activateTab(tabName);
                });
            }
        };

        bindFaderToTab('volume-chord-boost', 'chords');
        bindFaderToTab('volume-arp1-boost', 'arp1');
        bindFaderToTab('volume-arp2-boost', 'arp2');
        bindFaderToTab('volume-drum-boost', 'drums');
    }

    activateTab(tabName) {
        this.container.querySelectorAll('.settings-subtab-pane').forEach(pane => {
            pane.style.display = 'none';
        });
        
        const activePane = this.container.querySelector(`#subtab-${tabName}-pane`);
        if (activePane) {
            activePane.style.display = 'block';
        }
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

        // Sync mixer levels
        syncValue('volume-chord-boost', state.volumeChordBoost);
        syncValue('volume-arp1-boost', state.volumeArp1Boost);
        syncValue('volume-arp2-boost', state.volumeArp2Boost);
        syncValue('volume-drum-boost', state.volumeDrumBoost);

        // Delegate state sync to sub-panels
        if (this.chordsPanel) this.chordsPanel.populate(state);
        if (this.arp1Panel) this.arp1Panel.populate(state);
        if (this.arp2Panel) this.arp2Panel.populate(state);
        if (this.drumsPanel) this.drumsPanel.populate(state);
    }
}

