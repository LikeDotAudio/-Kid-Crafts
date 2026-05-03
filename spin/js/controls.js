function toggleConfig() {
    controls.classList.toggle('hidden');
    document.getElementById('config-toggle').innerText = controls.classList.contains('hidden') ? "Show Config" : "Hide Config";
}

function toggleWheelType() {
    isFlat = !isFlat;
    const modeBtn = document.getElementById('mode-btn');
    if (modeBtn) {
        modeBtn.innerText = isFlat ? "SWITCH TO DRUM MODE" : "SWITCH TO FLAT MODE";
    }
    drumAssembly.className = isFlat ? 'flat-mode' : 'drum-mode';
    applyNames();
}

function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
        muteBtn.innerText = isMuted ? "Unmute Sound" : "Mute Sound";
    }
}

function generateRandomNumbers() { nameInput.value = Array.from({length:100},(_,i)=>i+1).sort(()=>Math.random()-0.5).join('\n'); applyNames(); }
function loadActivities() { nameInput.value = activitiesList; applyNames(); }
function loadFood() { nameInput.value = foodList; applyNames(); }
function loadUnfortunate() { nameInput.value = unfortunateList.join('\n'); applyNames(); }
function clearList() { nameInput.value = ""; }
function autoSpin() { velocity = 40 + Math.random() * 30; if(controls.classList.contains('hidden') === false) toggleConfig(); }

window.toggleConfig = toggleConfig;
window.toggleWheelType = toggleWheelType;
window.toggleMute = toggleMute;
window.generateRandomNumbers = generateRandomNumbers;
window.loadActivities = loadActivities;
window.loadFood = loadFood;
window.loadUnfortunate = loadUnfortunate;
window.clearList = clearList;
window.autoSpin = autoSpin;
