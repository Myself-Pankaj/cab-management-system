"use client";
import { useEffect } from "react";
import { Toast, toast } from "@heroui/react/toast";
import { expireNotifications } from "./notifications";

export function ToastProvider() {
  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) expireNotifications();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", expireNotifications);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", expireNotifications);
    };
  }, []);
  return (
    <Toast.Provider
      placement="top end"
      width="min(400px, calc(100vw - 32px))"
      maxVisibleToasts={3}
      isExpanded
    >
      {({ toast: item }) => (
        <Toast
          toast={item}
          variant={item.content.variant}
          data-notification-key={item.key}
        >
          <Toast.Indicator />
          <Toast.Content>
            <Toast.Title>{item.content.title}</Toast.Title>
          </Toast.Content>
          <Toast.CloseButton
            aria-label="Dismiss notification"
            onPress={() => toast.close(item.key)}
          />
        </Toast>
      )}
    </Toast.Provider>
  );
}
