/**
 * Matrix Harmonics Tab
 * Manages display items and chord token streams.
 */

export class TabMatrix {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="data-item"><span>Vibe Filter:</span><span class="data-val" id="vibe-val">-</span></div>
            <div class="data-item"><span>Key Signature:</span><span class="data-val" id="key-val">-</span></div>
            <div class="data-item"><span>Modulation Center:</span><span class="data-val" id="modulation-val">Rot 0/8</span></div>
            <div class="data-item"><span>Tempo Base:</span><span class="data-val" id="tempo-val">-</span></div>
            <div class="data-item"><span>Arrangement FX:</span><span class="data-val" id="break-status-val">None</span></div>
            
            <div class="loop-column" style="width: 100%; align-items: center; margin-bottom: 12px; margin-top: 5px;">
                <h3 style="color: #a78bfa; margin: 0 0 10px 0; font-size: 1.1rem; text-align: center;">Loops (Step Length)</h3>
                <div class="btn-group" style="margin-top: 0;">
                    <button id="loop-0-btn" class="engine-btn">0</button>
                    <button id="loop-4-btn" class="engine-btn">4</button>
                    <button id="loop-8-btn" class="engine-btn">8</button>
                    <button id="loop-16-btn" class="engine-btn">16</button>
                </div>
            </div>

            <div class="data-column" style="width: 100%;">
                <span>Active Core Array Loop:</span>
                <div class="chord-stream-container" id="roman-stream"></div>
                <div class="chord-stream-container" id="absolute-stream"></div>
            </div>
        `;
    }

    update(state) {
        const vibeVal = document.getElementById('vibe-val');
        const keyVal = document.getElementById('key-val');
        const modulationVal = document.getElementById('modulation-val');
        const tempoVal = document.getElementById('tempo-val');
        const breakStatusVal = document.getElementById('break-status-val');

        if (vibeVal) vibeVal.innerText = state.vibe || '-';
        if (keyVal) keyVal.innerText = state.keyName || '-';
        if (tempoVal) tempoVal.innerText = `${state.derivedBpm} BPM` || '-';
        
        if (modulationVal) {
            if (state.currentModulationIndex > 0) {
                // If it is a modulation step
                modulationVal.innerText = `Mod: Semitone (Idx ${state.currentModulationIndex}/5)`;
            } else {
                modulationVal.innerText = `Rot: ${state.rotationCounter}/8`;
            }
        }
        
        if (breakStatusVal) {
            breakStatusVal.innerText = state.breakStatusText || 'None';
        }

        this.renderChordTokens(state);
    }

    renderChordTokens(state) {
        const rStream = document.getElementById('roman-stream');
        const aStream = document.getElementById('absolute-stream');
        if (!rStream || !aStream) return;

        rStream.innerHTML = ''; 
        aStream.innerHTML = '';

        const currentLoopData = (state.activeEngineMode === '16') 
            ? state.chords.loop16 
            : (state.activeEngineMode === '8' ? state.chords.loop8 : state.chords.loop4);

        if (!currentLoopData || !currentLoopData.names) return;

        currentLoopData.names.forEach((name, i) => {
            let tok = document.createElement('div'); 
            tok.className = `chord-token token-r-${i}`; 
            if (i === state.currentStepIndex) {
                tok.classList.add('active-chord');
            }
            tok.innerText = name; 
            rStream.appendChild(tok);
        });

        currentLoopData.preciseChords.forEach((name, i) => {
            let tok = document.createElement('div'); 
            tok.className = `chord-token token-a-${i}`; 
            if (i === state.currentStepIndex) {
                tok.classList.add('active-chord');
            }
            tok.innerText = name; 
            aStream.appendChild(tok);
        });
    }
}
