/**
 * Utility functions for class sessions
 */

/**
 * Calculate session status dynamically based on scheduled time and duration
 * @param scheduledAt - The scheduled start time of the session
 * @param durationMinutes - Duration of the session in minutes (default: 60)
 * @param manualStatus - Manually set status that takes precedence for "cancelled"
 * @returns The calculated status: "scheduled" | "in-progress" | "completed" | "cancelled"
 */
export function calculateSessionStatus(
    scheduledAt: Date | string,
    durationMinutes: number = 60,
    manualStatus?: "scheduled" | "in-progress" | "completed" | "cancelled"
): "scheduled" | "in-progress" | "completed" | "cancelled" {
    // If manually cancelled, always return cancelled
    if (manualStatus === "cancelled") {
        return "cancelled";
    }

    const now = new Date();
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // If current time is before start time: scheduled
    if (now < startTime) {
        return "scheduled";
    }

    // If current time is between start and end time: in-progress
    if (now >= startTime && now < endTime) {
        return "in-progress";
    }

    // If current time is after end time: completed
    return "completed";
}
