let lastAnnouncement = null;
let lastAnnouncementTime = 0;

const ANNOUNCEMENT_COOLDOWN = 30000; // 30 seconds

let audioContext = null;

const playAttentionSiren = () => {
    try {
        if (!audioContext) {
            audioContext = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        const ctx = audioContext;

        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = "square";

        const startTime = ctx.currentTime;

        oscillator.frequency.setValueAtTime(
            700,
            startTime
        );

        oscillator.frequency.linearRampToValueAtTime(
            1000,
            startTime + 0.25
        );

        oscillator.frequency.linearRampToValueAtTime(
            700,
            startTime + 0.5
        );

        oscillator.frequency.linearRampToValueAtTime(
            1000,
            startTime + 0.75
        );

        oscillator.frequency.linearRampToValueAtTime(
            700,
            startTime + 1
        );

        gainNode.gain.setValueAtTime(
            0,
            startTime
        );

        gainNode.gain.linearRampToValueAtTime(
            0.45,
            startTime + 0.05
        );

        gainNode.gain.linearRampToValueAtTime(
            0.45,
            startTime + 0.9
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + 1
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 1);
    } catch (error) {
        console.error(
            "Attention siren playback failed:",
            error
        );
    }
};

export const announceAlert = (alert) => {
    if (!alert) {
        return;
    }

    if (!("speechSynthesis" in window)) {
        console.warn(
            "Speech synthesis is not supported by this browser."
        );
        return;
    }

    const risk = String(
        alert.risk_level || ""
    ).toUpperCase();

    if (
        risk !== "WARNING" &&
        risk !== "HIGH" &&
        risk !== "CRITICAL" &&
        risk !== "EXTREME"
    ) {
        return;
    }

    const camera =
        alert.camera_id || "unknown camera";

    const location =
        alert.location || null;

    const locationText = location
        ? `at ${location}`
        : `on camera ${camera}`;

    const announcementKey = [
        camera,
        location,
        risk,
    ].join("|");

    const now = Date.now();

    console.log("Voice cooldown check:", {
        announcementKey,
        lastAnnouncement,
        elapsed:
            now - lastAnnouncementTime,
    });

    if (
        announcementKey === lastAnnouncement &&
        now - lastAnnouncementTime <
            ANNOUNCEMENT_COOLDOWN
    ) {
        return;
    }

    lastAnnouncement = announcementKey;
    lastAnnouncementTime = now;

    window.speechSynthesis.cancel();

    let text = "";

    switch (risk) {
        case "WARNING":
            text =
                `Attention. Crowd risk detected ${locationText}. ` +
                `Please monitor the area and take necessary safety measures.`;
            break;

        case "HIGH":
            text =
                `Attention. High crowd risk detected ${locationText}. ` +
                `Please monitor the area and manage crowd movement.`;
            break;

        case "CRITICAL":
        case "EXTREME":
            text =
                `Critical crowd alert detected ${locationText}. ` +
                `Initiate emergency response procedures and direct people toward safe routes.`;
            break;

        default:
            return;
    }

    // Attention sound first.
    playAttentionSiren();

    // Give the siren a moment before speech starts.
    setTimeout(() => {
        if (!("speechSynthesis" in window)) {
            return;
        }

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(
            utterance
        );
    }, 1100);
};

