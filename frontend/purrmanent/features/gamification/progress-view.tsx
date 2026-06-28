"use client";

import { differenceInCalendarDays } from "date-fns";
import { Card, Pill, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useCats } from "@/features/cats/hooks";
import { BADGES, useGamificationStatus } from "./hooks";

function dayNumber(adoptionDate: string): number {
  return differenceInCalendarDays(new Date(), new Date(adoptionDate)) + 1;
}

export function ProgressView() {
  const { data: status, isLoading } = useGamificationStatus();
  const { data: cats = [] } = useCats();
  const points = status?.points ?? 0;
  const graduated = cats.filter((c) => dayNumber(c.adoptionDate) >= 90);

  if (isLoading) return <Spinner className="size-6 text-accent-violet" />;

  return (
    <div className="space-y-8">
      <Card variant="featured" className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2px] text-on-dark-muted">
            Total points
          </p>
          <p className="font-display text-5xl font-bold text-accent-lime">
            {points}
          </p>
        </div>
        <span className="text-5xl" aria-hidden>
          🏆
        </span>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGES.map((b) => {
            const earned = points >= b.points;
            return (
              <Card
                key={b.label}
                className={cn(
                  "flex flex-col items-center gap-1 text-center",
                  !earned && "opacity-40",
                )}
              >
                <span className="text-3xl" aria-hidden>
                  {b.icon}
                </span>
                <p className="text-sm font-semibold">{b.label}</p>
                <Pill tone={earned ? "lime" : "neutral"}>{b.points} pts</Pill>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Graduation certificates</h2>
        {graduated.length === 0 ? (
          <p className="text-sm text-on-dark-muted">
            Reach day 90 with a cat to earn a graduation certificate.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {graduated.map((c) => (
              <Card key={c.id} variant="featured" className="text-center">
                <p className="text-sm uppercase tracking-[0.2px] text-accent-lime">
                  Graduated 🎓
                </p>
                <p className="mt-2 font-display text-2xl font-bold">{c.name}</p>
                <p className="mt-1 text-sm text-on-dark-muted">
                  Completed the 90-day journey. You did it!
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
