'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Cat,
  Sparkles,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import logo from '@/app/assets/logo/logo-1000x1000.png';
import { cn } from '@/lib/utils/cn';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  TooltipProvider,
} from '@/components/ui';
import { PointsPill } from '@/features/gamification/points-pill';
import { SidebarUserMenu } from '@/features/auth/user-menu';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/cats', label: 'Cats', icon: Cat },
  { href: '/coach', label: 'Coach', icon: Sparkles },
  { href: '/progress', label: 'Progress', icon: Trophy },
];

/**
 * Primary app navigation (DESIGN.md light canvas, violet accent — see the
 * --sidebar-* tokens in globals.css). Replaces the old top Nav + BottomNav:
 * shadcn's Sidebar already renders as a Sheet drawer on mobile.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={200}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
          >
            <Image
              src={logo}
              alt="Purrmanent logo"
              width={28}
              height={28}
              className="rounded-md shrink-0"
              priority
            />
            <span className="font-display text-lg font-bold text-ink-deep group-data-[collapsible=icon]:hidden">
              Purrmanent
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={label}
                        render={<Link href={href} />}
                        className={cn(
                          'py-5',
                          active &&
                            'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                        )}
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Crisis"
                render={<Link href="/crisis" data-tour="crisis" />}
                className="bg-danger text-on-primary font-bold uppercase tracking-[0.2px] shadow-emboss rounded-[24px] border border-danger/20 hover:bg-danger/90 hover:scale-[0.97] active:scale-[0.95] active:bg-danger/90 transition-all duration-200 py-5"
              >
                <AlertTriangle />
                <span>Crisis</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:flex-col-reverse group-data-[collapsible=icon]:gap-2">
            <SidebarUserMenu />
            <PointsPill />
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
