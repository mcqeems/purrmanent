"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <Button
      type="button"
      variant="inverted"
      className="w-full"
      onClick={() =>
        authClient.signIn.social({
          provider: "google",
          callbackURL: `${window.location.origin}/dashboard`,
        })
      }
    >
      {label}
    </Button>
  );
}
