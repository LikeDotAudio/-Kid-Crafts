const FRICTION = 0.985;

function playBoop() {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}
function updateTransform() {
    if (isFlat) {
        container.style.transform = `rotate(${-rotation}deg)`;
    } else {
        container.style.transform = `rotateX(${-rotation}deg)`;
    }

    const count = 48; // Updated to 48 slices
    const index = Math.round((rotation % 360 + 360) % 360 / (360 / count)) % count;

    if (index !== lastIndex) {
        playBoop(); 
        lastIndex = index;
        displayHeader.innerText = sliceItems[index] || "---";
        const color = sliceColors[index];
        displayHeader.style.borderColor = displayHeader.style.color = pointer.style.borderRightColor = color || "#00ffcc";
    }
}

window.applyNames = function applyNames() {
    const lines = nameInput.value.split('\n').map(l => l.trim()).filter(l => l !== '');
    if(lines.length === 0) lines.push("EMPTY");

    sliceItems = []; sliceColors = []; container.innerHTML = '';
    const totalSlices = 48; // Updated to 48 slices

    for (let i = 0; i < totalSlices; i++) {
        sliceItems.push(lines[i % lines.length]);
    }

    if (isFlat) {
        scaler.style.transform = `scale(${Math.min(window.innerWidth/700, window.innerHeight/700)}) translateZ(0px)`;
        let prevColor = null;
        sliceItems.forEach((text, i) => {
            const div = document.createElement('div');
            div.className = 'slice';
            // Use span for text to ensure rendering
            const span = document.createElement('span');
            span.innerText = text;
            div.appendChild(span);

            const color = getNextColor(i, prevColor);
            div.style.backgroundColor = sliceColors[i] = color;
            prevColor = color;

            div.style.transform = `rotate(${i * (360/totalSlices)}deg)`;
            container.appendChild(div);
        });
    } else {
        // Center the drum assembly and apply scaling
        scaler.style.transform = `scale(1.2) translateZ(0px)`;
        createDrumSlices(container, totalSlices, lines, sliceColors, sliceItems);
    }

    updateTransform();
};



window.animate = function animate() {
    if (!isDragging && Math.abs(velocity) > 0.05) { 
        rotation += velocity; 
        velocity *= FRICTION; 
        updateTransform(); 
    }
    requestAnimationFrame(animate);
}
