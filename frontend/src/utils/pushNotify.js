const PUSH_KEY = "lw-push-enabled";

export async function requestPushPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") {
    localStorage.setItem(PUSH_KEY, "true");
    return true;
  }
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  const granted = result === "granted";
  if (granted) localStorage.setItem(PUSH_KEY, "true");
  return granted;
}

export function isPushEnabled() {
  return localStorage.getItem(PUSH_KEY) === "true" && Notification.permission === "granted";
}

export function sendPushNotification(title, body, icon = "/logo.png") {
  if (!isPushEnabled()) return;
  try {
    new Notification(title, { body, icon, badge: "/logo.png" });
  } catch (e) {
    console.warn("Push notification failed:", e);
  }
}

/**
 * Schedule check-in reminders for all active vaults.
 * Runs every hour. Fires push 24 hours before deadline.
 */
export function scheduleCheckInReminders(vaults) {
  if (!isPushEnabled() || !vaults?.length) return;

  const now = Math.floor(Date.now() / 1000);
  const reminded = JSON.parse(localStorage.getItem("lw-reminded") || "{}");

  for (const vault of vaults) {
    const deadline = Number(vault.deadline);
    const status   = Number(vault.status);
    const id       = String(vault.id);

    if (status !== 0) continue; // only active vaults

    const timeLeft = deadline - now;

    // Send push if within 24 hours and not yet reminded
    if (timeLeft > 0 && timeLeft <= 86400 && !reminded[id]) {
      const hours = Math.floor(timeLeft / 3600);
      sendPushNotification(
        "⚠ LiteWill Protocol — Check-In Due",
        `Your vault "${vault.name}" expires in ${hours} hour${hours !== 1 ? "s" : ""}. Check in now to keep it active.`,
      );
      reminded[id] = true;
      localStorage.setItem("lw-reminded", JSON.stringify(reminded));
    }

    // Also send if overdue and not reminded
    if (timeLeft <= 0 && !reminded[`${id}-overdue`]) {
      sendPushNotification(
        "🚨 LiteWill Protocol — Vault Expired",
        `Your vault "${vault.name}" has expired. Heirs can now initiate a claim.`,
      );
      reminded[`${id}-overdue`] = true;
      localStorage.setItem("lw-reminded", JSON.stringify(reminded));
    }
  }
}
