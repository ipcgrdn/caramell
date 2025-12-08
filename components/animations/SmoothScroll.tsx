"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const smoother = useRef<any>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Create ScrollSmoother
    smoother.current = ScrollSmoother.create({
      smooth: 1, // Balanced smooth amount
      effects: true,
      smoothTouch: 0.1,
    });

    return () => {
      if (smoother.current) {
        smoother.current.kill();
      }
    };
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
