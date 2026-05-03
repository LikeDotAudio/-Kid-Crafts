// Event listeners and drag handling
function onStart(e) { 
    isDragging = true; 
    velocity = 0; 
    lastY = e.clientY || e.touches[0].clientY; 
    lastTime = performance.now(); 
}

function onMove(e) {
    if (!isDragging) return;
    const currentY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    const currentTime = performance.now();
    const deltaY = currentY - lastY;
    
    rotation += deltaY * 0.4;
    
    if (currentTime - lastTime > 0) {
        velocity = (deltaY / (currentTime - lastTime)) * 16;
    }
    
    lastY = currentY; 
    lastTime = currentTime; 
    updateTransform();
}

function onEnd() { isDragging = false; }

function initEventListeners() {
    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    container.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    window.addEventListener('resize', applyNames);
}
