// Global state shared across modules
let rotation = 0, velocity = 0, isDragging = false;
let lastY = 0, lastTime = 0;
let sliceItems = [], sliceColors = [], lastIndex = -1;
let isMuted = true, isFlat = false, gameMode = false, lightSequence = 0;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const colors = ['#C71C22', '#E25822', '#E9B100', '#008C45', '#009ECA', '#004B98', '#663399', '#D1225B'];

window.colors = colors;
window.isMuted = isMuted;
window.isFlat = isFlat;
window.gameMode = gameMode;
window.rotation = rotation;
window.velocity = velocity;
window.isDragging = isDragging;
window.lastY = lastY;
window.lastTime = lastTime;
window.sliceItems = sliceItems;
window.sliceColors = sliceColors;
window.lastIndex = lastIndex;
window.lightSequence = lightSequence;
window.audioCtx = audioCtx;
