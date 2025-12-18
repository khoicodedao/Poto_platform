/**
 * Utility functions for notifications
 * These are NOT server actions - they're just helper functions
 */

/**
 * Format template with variables
 */
export function formatNotificationTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
}

/**
 * Format a simple message with timestamp
 */
export function formatNotificationMessage(
  baseMessage: string,
  timestamp?: Date
): string {
  if (!timestamp) return baseMessage;
  const time = timestamp.toLocaleTimeString("vi-VN");
  return `${baseMessage} (${time})`;
}

/**
 * Get notification type label
 */
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    reminder: "Nhắc Nhở",
    report: "Báo Cáo",
    assignment: "Bài Tập",
    attendance: "Điểm Danh",
    general: "Thông Báo Chung",
  };
  return labels[type] || type;
}

/**
 * Get notification channel label
 */
export function getNotificationChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    app: "Ứng Dụng",
    zalo: "Zalo",
    email: "Email",
  };
  return labels[channel] || channel;
}
