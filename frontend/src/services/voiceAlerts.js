let lastAnnouncement = null;
let lastAnnouncementTime = 0;

const ANNOUNCEMENT_COOLDOWN = 15000; // 15 seconds


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

    const risk = alert.risk_level;

    if (
        risk !== "WARNING" &&
        risk !== "HIGH RISK"
    ) {
        return;
    }

    const camera =
        alert.camera_id || "unknown camera";

    const message =
        alert.message ||
        `${risk} detected`;

    const announcementKey =
        `${camera}|${risk}|${message}`;

    const now = Date.now();

    /*
     * Prevent the same persistent danger from being
     * announced every time the AI processes another frame.
     */
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

    const text =
        risk === "HIGH RISK"
            ? `High risk alert. ${message}. Camera ${camera}.`
            : `Warning. ${message}. Camera ${camera}.`;

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(
        utterance
    );
};