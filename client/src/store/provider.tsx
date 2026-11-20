"use client";
import { useState, useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { makeStore } from "./store";
import { ToastProvider } from "@/components/ui/toast-provider";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [instance] = useState(makeStore);
  useEffect(() => setupListeners(instance.dispatch), [instance]);
  return (
    <Provider store={instance}>
      <ToastProvider />
      {children}
    </Provider>
  );
}
