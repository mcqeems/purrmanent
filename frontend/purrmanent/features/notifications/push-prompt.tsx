"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { enablePush } from "./push";

export function PushPrompt() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      const res = await enablePush();
      toast({ tone: res.ok ? "success" : "error", description: res.message });
      if (res.ok) setDone(true);
    } catch {
      toast({ tone: "error", description: "Could not enable reminders." });
    } finally {
      setBusy(false);
    }
  }

  if (done) return null;

  return (
    <Button size="sm" variant="outline" onClick={onClick} disabled={busy}>
      <Bell size={16} /> {busy ? "Enabling…" : "Enable reminders"}
    </Button>
  );
}
