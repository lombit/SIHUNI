"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset indicator when route finishes loading
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept click on internal links to show instant progress bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.getAttribute("target") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        // Only trigger if navigating to a different destination
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 animate-pulse shadow-sm shadow-sky-500/50" />
    </div>
  );
}
