"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update();
          console.log("[ServiceWorker] Registered and updated:", reg.scope);
        })
        .catch((err) => {
          console.error("[ServiceWorker] Registration failed: ", err);
        });
    }
  }, []);

  return null;
}
