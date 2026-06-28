"use client";

import { useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { CrisisSlide } from "@/lib/types/api";
import { useCompleteStep } from "./api";

export function SlideCarousel({
  eventId,
  slides,
}: {
  eventId: number;
  slides: CrisisSlide[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const completeStep = useCompleteStep();
  const [done, setDone] = useState<Set<number>>(new Set());

  // Per-slide starting offset → flat global index for each todo (matches backend stepIndex).
  const slideBase = useMemo(() => {
    const bases: number[] = [];
    let acc = 0;
    for (const s of slides) {
      bases.push(acc);
      acc += s.todos.length;
    }
    return bases;
  }, [slides]);

  function toggle(globalIndex: number) {
    if (done.has(globalIndex)) return; // completion is one-way
    completeStep.mutate({ eventId, stepIndex: globalIndex });
    setDone((prev) => new Set(prev).add(globalIndex));
  }

  return (
    <div className="space-y-3">
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {slides.map((slide, si) => (
            <div key={si} className="min-w-0 flex-[0_0_100%] px-1">
              <div className="rounded-xl bg-surface-night p-6 text-on-primary">
                <p className="mb-1 text-xs uppercase tracking-[0.2px] text-accent-lime">
                  Step {si + 1} of {slides.length}
                </p>
                <h3 className="mb-3 text-xl font-semibold">{slide.title}</h3>
                <div className="prose-sm mb-4 space-y-2 text-on-dark-muted [&_a]:text-accent-lime [&_a]:underline">
                  <ReactMarkdown>{slide.markdown}</ReactMarkdown>
                </div>
                <ul className="space-y-2">
                  {slide.todos.map((todo, ti) => {
                    const idx = slideBase[si] + ti;
                    const checked = done.has(idx);
                    return (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(idx)}
                        />
                        <span className={cn(checked && "text-on-dark-muted line-through")}>
                          {todo}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => emblaApi?.scrollPrev()}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <Button variant="outline" size="sm" onClick={() => emblaApi?.scrollNext()}>
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
