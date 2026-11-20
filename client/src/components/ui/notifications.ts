import { toast } from "@heroui/react/toast";

type Notification = {
  expiresAt: number;
  expire: () => void;
};
const activeNotifications = new Map<string, Notification>();

/** Flush wall-clock deadlines after returning from a throttled background tab. */
export function expireNotifications(): void {
  const now = Date.now();
  for (const notification of activeNotifications.values()) {
    if (notification.expiresAt <= now) notification.expire();
  }
}

export function showNotification(
  kind: "success" | "danger",
  message: string,
): void {
  if (typeof window === "undefined") return;
  const duration = kind === "success" ? 4000 : 6000;
  let stopWaitingForFocus: (() => void) | undefined;
  const key = toast[kind](message, {
    // Own the deadline instead of the queue's hover/visibility-paused timer.
    timeout: 0,
    onClose: () => {
      clearTimeout(timer);
      stopWaitingForFocus?.();
      activeNotifications.delete(key);
    },
  });
  const expire = () => {
    const element = document.querySelector<HTMLElement>(
      `[data-notification-key="${CSS.escape(key)}"]`,
    );
    if (element?.contains(document.activeElement)) {
      if (!stopWaitingForFocus) {
        const onFocusOut = (event: FocusEvent) => {
          if (
            event.relatedTarget instanceof Node &&
            element.contains(event.relatedTarget)
          )
            return;
          queueMicrotask(expire);
        };
        element.addEventListener("focusout", onFocusOut);
        stopWaitingForFocus = () =>
          element.removeEventListener("focusout", onFocusOut);
      }
      return;
    }
    toast.close(key);
  };
  activeNotifications.set(key, { expiresAt: Date.now() + duration, expire });
  const timer = setTimeout(expire, duration);
}
