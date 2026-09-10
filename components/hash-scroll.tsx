"use client";

import { useEffect } from "react";

export function HashScroll() {
  useEffect(() => {
    // The track page streams, so the section can mount after the browser has
    // already handled the URL fragment. Redo the jump once it exists.
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    document.getElementById(id)?.scrollIntoView();
  }, []);

  return null;
}
