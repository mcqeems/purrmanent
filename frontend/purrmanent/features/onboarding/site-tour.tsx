"use client";

import { useEffect } from "react";
import { driver } from "driver.js";

const SEEN_KEY = "purrmanent.tourSeen";

/** One-time guided tour of the dashboard (driver.js). Runs once per browser. */
export function SiteTour() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SEEN_KEY)) return;

    const tour = driver({
      showProgress: true,
      steps: [
        {
          element: '[data-tour="ask"]',
          popover: {
            title: "Your AI coach",
            description:
              "Ask anything about cat care, or tell it to do things like “add a cat”. It can take actions for you (with your confirmation).",
          },
        },
        {
          element: '[data-tour="stats"]',
          popover: {
            title: "Progress at a glance",
            description: "Points, your daily streak, and completion across all your cats.",
          },
        },
        {
          element: '[data-tour="cats"]',
          popover: {
            title: "Your cats",
            description: "Open a cat to work its 90-day Kanban board and health log.",
          },
        },
        {
          element: '[data-tour="crisis"]',
          popover: {
            title: "Crisis mode",
            description: "Something wrong? Get an immediate, step-by-step protocol here.",
          },
        },
      ],
      onDestroyed: () => localStorage.setItem(SEEN_KEY, "1"),
    });

    // Let the dashboard render before highlighting.
    const t = setTimeout(() => tour.drive(), 700);
    return () => clearTimeout(t);
  }, []);

  return null;
}
