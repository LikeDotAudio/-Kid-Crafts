// Drum-specific rendering and state logic

/**
 * 2. Positions each flat div into a 3D drum shape.
 */
function createDrumSlices(container, totalSlices, lines, sliceColors, sliceItems) {
    container.innerHTML = ''; // Clear existing slices
    const panelHeight = 60; // Consistent with current CSS
    const radius = Math.round((panelHeight / 2) / Math.tan(Math.PI / totalSlices));
    const anglePerPanel = 360 / totalSlices;

    // Apply 3D settings to container
    container.style.transformStyle = 'preserve-3d';
    
    // Center the drum vertically within the window (compensating for slice height)
    scaler.style.transform = `scale(1.2) translateY(30px) translateZ(0px)`; 

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
        
        // The Magic: Rotate the panel to its angle, then push it outward by the radius
        div.style.transform = `rotateX(${i * anglePerPanel}deg) translateZ(${radius}px)`;
        container.appendChild(div);
    });
}
window.createDrumSlices = createDrumSlices;
