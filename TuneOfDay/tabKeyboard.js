/**
 * Keyboard View Tab
 * Manages the SVG virtual piano keyboard, active chords list, and highlights keys.
 */

export class TabKeyboard {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <!-- Active Loop Chords Display above Piano Keyboard -->
            <div class="data-column" style="width: 100%; margin-bottom: 15px; border-bottom: 1px solid #2a2a3a; padding-bottom: 10px;">
                <span style="font-weight: bold; color: #a78bfa; font-size: 0.95rem;">Active Loop Chords:</span>
                <div class="chord-stream-container" id="keyboard-chord-stream"></div>
            </div>

            <div class="keyboard-wrapper" style="width: 100%; box-sizing: border-box;">
                <svg id="piano-svg" viewBox="0 0 280 80" width="100%">
                    <!-- White Keys -->
                    <rect id="key-60" class="kb-white" x="0" y="0" width="20" height="80"/>
                    <rect id="key-62" class="kb-white" x="20" y="0" width="20" height="80"/>
                    <rect id="key-64" class="kb-white" x="40" y="0" width="20" height="80"/>
                    <rect id="key-65" class="kb-white" x="60" y="0" width="20" height="80"/>
                    <rect id="key-67" class="kb-white" x="80" y="0" width="20" height="80"/>
                    <rect id="key-69" class="kb-white" x="100" y="0" width="20" height="80"/>
                    <rect id="key-71" class="kb-white" x="120" y="0" width="20" height="80"/>
                    <rect id="key-72" class="kb-white" x="140" y="0" width="20" height="80"/>
                    <rect id="key-74" class="kb-white" x="160" y="0" width="20" height="80"/>
                    <rect id="key-76" class="kb-white" x="180" y="0" width="20" height="80"/>
                    <rect id="key-77" class="kb-white" x="200" y="0" width="20" height="80"/>
                    <rect id="key-79" class="kb-white" x="220" y="0" width="20" height="80"/>
                    <rect id="key-81" class="kb-white" x="240" y="0" width="20" height="80"/>
                    <rect id="key-83" class="kb-white" x="260" y="0" width="20" height="80"/>
                    
                    <!-- Black Keys -->
                    <rect id="key-61" class="kb-black" x="13" y="0" width="14" height="50"/>
                    <rect id="key-63" class="kb-black" x="33" y="0" width="14" height="50"/>
                    <rect id="key-66" class="kb-black" x="73" y="0" width="14" height="50"/>
                    <rect id="key-68" class="kb-black" x="93" y="0" width="14" height="50"/>
                    <rect id="key-70" class="kb-black" x="113" y="0" width="14" height="50"/>
                    <rect id="key-73" class="kb-black" x="153" y="0" width="14" height="50"/>
                    <rect id="key-75" class="kb-black" x="173" y="0" width="14" height="50"/>
                    <rect id="key-78" class="kb-black" x="213" y="0" width="14" height="50"/>
                    <rect id="key-80" class="kb-black" x="233" y="0" width="14" height="50"/>
                    <rect id="key-82" class="kb-black" x="253" y="0" width="14" height="50"/>
                </svg>
            </div>
        `;
    }

    update(state, activeNotes, nextNotes = null, showPreview = false) {
        // 1. Render active loop chords in stream
        const kStream = document.getElementById('keyboard-chord-stream');
        if (kStream) {
            kStream.innerHTML = '';
            if (state.activeEngineMode && state.activeEngineMode !== '0') {
                const currentLoopData = (state.activeEngineMode === '16') 
                    ? state.chords.loop16 
                    : (state.activeEngineMode === '8' ? state.chords.loop8 : state.chords.loop4);

                if (currentLoopData && currentLoopData.preciseChords) {
                    currentLoopData.preciseChords.forEach((name, i) => {
                        let tok = document.createElement('div');
                        tok.className = 'chord-token';
                        if (i === state.currentStepIndex) {
                            tok.classList.add('active-chord');
                        }
                        tok.innerText = name;
                        kStream.appendChild(tok);
                    });
                }
            }
        }

        // 2. Reset and Highlight active keys
        document.querySelectorAll('.kb-white, .kb-black').forEach(k => {
            k.classList.remove('active-key', 'preview-key', 'fade-in');
        });

        if (activeNotes) {
            activeNotes.forEach(note => {
                let boundedNote = note;
                while (boundedNote < 60) boundedNote += 12;
                while (boundedNote > 83) boundedNote -= 12;
                let keyEl = document.getElementById(`key-${boundedNote}`);
                if (keyEl) keyEl.classList.add('active-key');
            });
        }

        // 3. Highlight next preview keys if requested (e.g. halfway through step)
        if (showPreview && nextNotes) {
            nextNotes.forEach(note => {
                let boundedNote = note;
                while (boundedNote < 60) boundedNote += 12;
                while (boundedNote > 83) boundedNote -= 12;
                let keyEl = document.getElementById(`key-${boundedNote}`);
                // Only show preview if it is not already playing in the active chord
                if (keyEl && !keyEl.classList.contains('active-key')) {
                    keyEl.classList.add('preview-key');
                    // Use requestAnimationFrame to trigger CSS fade-in smoothly
                    requestAnimationFrame(() => {
                        keyEl.classList.add('fade-in');
                    });
                }
            });
        }
    }
}
