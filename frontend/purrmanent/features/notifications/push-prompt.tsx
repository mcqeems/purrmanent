"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button, Pill, useToast } from "@/components/ui";
import { enablePush } from "./push";

function alreadyGranted(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

export function PushPrompt() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  // Lazy init from the live permission so a reload reflects the enabled state.
  const [enabled, setEnabled] = useState(alreadyGranted);

  async function onClick() {
    setBusy(true);
    try {
      const res = await enablePush();
      toast({ tone: res.ok ? "success" : "error", description: res.message });
      if (res.ok) setEnabled(true);
    } catch {
      toast({ tone: "error", description: "Could not enable reminders." });
    } finally {
      setBusy(false);
    }
  }

  if (enabled) {
    return (
      <Pill tone="lime" className="gap-1">
        <BellRing size={14} /> Reminders on
      </Pill>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={onClick} disabled={busy}>
      <Bell size={16} /> {busy ? "Enabling…" : "Enable reminders"}
    </Button>
  );
}
