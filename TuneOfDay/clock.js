/**
 * Clock Controller Module
 * Handles SVG Clock drag gestures, digital display updates, and time state.
 */
export class ClockController {
    constructor({ svgId, hourHandId, minuteHandId, digitalTimeId, ampmBtnId, initialHour = 11, initialMinute = 27, onTimeChange }) {
        this.clockSvg = document.getElementById(svgId);
        this.hourHand = document.getElementById(hourHandId);
        this.minuteHand = document.getElementById(minuteHandId);
        this.digitalTime = document.getElementById(digitalTimeId);
        this.ampmBtn = document.getElementById(ampmBtnId);
        this.hour = initialHour;
        this.minute = initialMinute;
        this.onTimeChange = onTimeChange;
        this.activeHand = null;
        this.isLocked = false;

        this.initEvents();
        this.updateUI();
    }

    setLocked(locked) {
        this.isLocked = !!locked;
        if (this.isLocked) {
            this.clockSvg.classList.add('locked');
            this.activeHand = null;
            const overlay = document.getElementById('clock-lock-overlay');
            if (overlay) overlay.style.display = 'block';
        } else {
            this.clockSvg.classList.remove('locked');
            const overlay = document.getElementById('clock-lock-overlay');
            if (overlay) overlay.style.display = 'none';
        }
    }

    updateUI() {
        let displayHour = this.hour % 12;
        if (displayHour === 0) displayHour = 12;
        this.ampmBtn.innerText = this.hour >= 12 ? "PM" : "AM";
        this.digitalTime.innerText = `${String(displayHour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`;
        this.hourHand.setAttribute('transform', `rotate(${(this.hour % 12) * 30 + this.minute * 0.5})`);
        this.minuteHand.setAttribute('transform', `rotate(${this.minute * 6})`);
    }

    setTime(h, m) {
        this.hour = h;
        this.minute = m;
        this.updateUI();
        if (this.onTimeChange) {
            this.onTimeChange(this.hour, this.minute);
        }
    }

    initEvents() {
        const dragStart = (hand, e) => {
            if (this.isLocked) return;
            e.preventDefault();
            this.activeHand = hand;
        };

        this.hourHand.addEventListener('mousedown', (e) => dragStart('hour', e));
        this.minuteHand.addEventListener('mousedown', (e) => dragStart('minute', e));
        this.hourHand.addEventListener('touchstart', (e) => dragStart('hour', e));
        this.minuteHand.addEventListener('touchstart', (e) => dragStart('minute', e));

        const handleClockDrag = (e) => {
            if (!this.activeHand) return;
            const rect = this.clockSvg.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            let angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
            if (angle < 0) angle += 360;

            if (this.activeHand === 'minute') {
                let newMin = Math.round(angle / 6) % 60;
                let diff = newMin - this.minute;
                if (diff < -30) {
                    this.hour = (this.hour + 1) % 24;
                } else if (diff > 30) {
                    this.hour = (this.hour - 1 + 24) % 24;
                }
                this.minute = newMin;
            } else if (this.activeHand === 'hour') {
                let calcHr = Math.floor(angle / 30) % 12;
                this.hour = (this.hour >= 12) ? (calcHr === 0 ? 12 : calcHr + 12) : (calcHr === 0 ? 0 : calcHr);
            }
            this.updateUI();
            if (this.onTimeChange) {
                this.onTimeChange(this.hour, this.minute);
            }
        };

        window.addEventListener('mousemove', handleClockDrag);
        window.addEventListener('touchmove', handleClockDrag, { passive: false });
        window.addEventListener('mouseup', () => this.activeHand = null);
        window.addEventListener('touchend', () => this.activeHand = null);

        this.ampmBtn.addEventListener('click', () => {
            if (this.isLocked) return;
            this.hour = (this.hour >= 12) ? this.hour - 12 : this.hour + 12;
            this.updateUI();
            if (this.onTimeChange) {
                this.onTimeChange(this.hour, this.minute);
            }
        });
    }
}
