"use client";

import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui";

export function UserMenu() {
  const router = useRouter();
  const { data } = useSession();

  async function logout() {
    await authClient.signOut();
    router.replace("/login");
  }

  return (
    <div className="flex items-center gap-3">
      {data?.user?.name && (
        <span className="hidden text-sm text-on-dark-muted sm:inline">
          {data.user.name}
        </span>
      )}
      <Button size="sm" variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
