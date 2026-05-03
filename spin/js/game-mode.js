// Game-mode-specific logic and light animations

function toggleGameMode() {
    gameMode = !gameMode;
    lightFrame.style.display = gameMode ? 'block' : 'none';
    document.getElementById('game-btn').innerText = gameMode ? "Game Mode: On" : "Game Mode: Off";
    if (gameMode && lightFrame.children.length === 0) createLights();
}

function createLights() {
    const totalLights = 80;
    for (let i = 0; i < totalLights; i++) {
        const l = document.createElement('div');
        l.className = 'light';
        // Precise placement based on specification: 25 top, 15 right, 25 bottom, 15 left
        if (i < 25) { l.style.top = '-8px'; l.style.left = (i * 4) + '%'; }
        else if (i < 40) { l.style.right = '-8px'; l.style.top = ((i - 25) * 6.6) + '%'; }
        else if (i < 65) { l.style.bottom = '-8px'; l.style.right = ((i - 40) * 4) + '%'; }
        else { l.style.left = '-8px'; l.style.bottom = ((i - 65) * 6.6) + '%'; }
        lightFrame.appendChild(l);
    }
}

// Optimized Light animation interval (40ms = ~25fps)
setInterval(() => {
    if (!gameMode) return;
    lightSequence = (lightSequence + 1) % 80;
    const lights = lightFrame.querySelectorAll('.light');

    // 1. Turn off all lights first
    lights.forEach(l => l.classList.remove('active'));

    // 2. Calculate and turn on ONLY the 16 lights that need to be active
    for (let c = 0; c < 4; c++) {
        // Calculate the head of the current string (4 strings spaced 20 apart)
        const head = (lightSequence + (c * 20)) % 80;
        
        // Turn on the head and its 3 trailing lights (tail length of 4)
        for (let b = 0; b < 4; b++) { 
            const activeIdx = (head - b + 80) % 80;
            lights[activeIdx].classList.add('active'); 
        }
    }
}, 40);

window.toggleGameMode = toggleGameMode;
