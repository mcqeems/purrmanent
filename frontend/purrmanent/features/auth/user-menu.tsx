'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { authClient, useSession } from '@/lib/auth/client';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';

function initials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/** User identity + logout, for the sidebar footer (dropdown + avatar). */
export function SidebarUserMenu() {
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;

  async function logout() {
    await authClient.signOut();
    router.replace('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex h-auto flex-1 items-center justify-start gap-2 px-2 py-1.5 normal-case"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{initials(user?.name)}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium text-ink-deep group-data-[collapsible=icon]:hidden">
          {user?.name ?? 'Account'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {user?.email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
