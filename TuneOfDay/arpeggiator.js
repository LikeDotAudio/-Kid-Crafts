/**
 * Arpeggiator Module
 * Handles procedural generation of arpeggio note patterns based on minute-offset
 * and calendar date-seeded permutations.
 */
export function getArpStyles(dateStr, minute) {
    let dateSeed = 0;
    const sanitizedDate = dateStr.replace(/-/g, "");
    for (let char of sanitizedDate) {
        dateSeed += parseInt(char) || 0;
    }

    let minShift = minute % 3;

    return [
        { name: `Ascending Spiral`, pattern: [0 + minShift, 1, 2, 1] },
        { name: `Extended Leap`, pattern: [0, 2, 1 + minShift, 2] },
        { name: `Inverted Pendulum`, pattern: [2, 1, 0, 1 + minShift] },
        { name: `Mirror Split`, pattern: [0, 2, 0, 1] },
        { name: `Afternoon Glitch-Hop`, pattern: [0, 1, 2, 0, 2, 1, 0, 2] },
        { name: `Midnight Phantom Stutter`, pattern: [2, 0, 1, 2, 1, 0] }
    ];
}
