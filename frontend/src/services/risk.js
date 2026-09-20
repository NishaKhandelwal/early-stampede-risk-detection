// Backend sends "NORMAL" | "WARNING" | "HIGH RISK".
// This maps all supported variants to NORMAL / WARNING / HIGH.

export function normalizeRisk(risk) {
    const value = String(risk ?? "").trim().toUpperCase();

    if (["HIGH RISK", "HIGH", "CRITICAL", "EXTREME"].includes(value)) {
        return "HIGH";
    }

    if (["WARNING", "MEDIUM"].includes(value)) {
        return "WARNING";
    }

    return "NORMAL";
}

export function getRiskColor(risk) {
    switch (normalizeRisk(risk)) {
        case "HIGH":
            return "#ef4444";

        case "WARNING":
            return "#f59e0b";

        default:
            return "#22c55e";
    }
}

export function getRiskEmoji(risk) {
    switch (normalizeRisk(risk)) {
        case "HIGH":
            return "🔴";

        case "WARNING":
            return "🟡";

        default:
            return "🟢";
    }
}

export function getRiskLabel(risk) {
    switch (normalizeRisk(risk)) {
        case "HIGH":
            return "HIGH RISK";

        case "WARNING":
            return "WARNING";

        default:
            return "NORMAL";
    }
}

export function getRiskRecommendation(risk) {
    switch (normalizeRisk(risk)) {
        case "HIGH":
            return "Immediate attention required. Manage crowd movement and prepare emergency response procedures.";

        case "WARNING":
            return "Monitor the area and control crowd flow if required.";

        default:
            return "Crowd conditions are currently stable.";
    }
}