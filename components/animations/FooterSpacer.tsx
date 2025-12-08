"use client";

import { useEffect, useState } from "react";

export default function FooterSpacer() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const footer = document.getElementById("main-footer");
      if (footer) {
        setHeight(footer.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    // Optional: ResizeObserver for more robustness
    const footer = document.getElementById("main-footer");
    let resizeObserver: ResizeObserver | null = null;
    if (footer) {
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(footer);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      style={{ height }}
      className="w-full bg-transparent pointer-events-none"
    />
  );
}
