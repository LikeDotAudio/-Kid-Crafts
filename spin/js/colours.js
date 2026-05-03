function getNextColor(index, prevColor) {
    let colorIndex = index % colors.length;
    // Ensure no two adjacent colors are the same
    if (index > 0 && colors[colorIndex] === prevColor) {
        colorIndex = (colorIndex + 1) % colors.length;
    }
    return colors[colorIndex];
}

window.getNextColor = getNextColor;
