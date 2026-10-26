import { useEffect } from "react";

let locks = 0;
let savedY = 0;

/** Freezes the page behind overlays (works on iOS Safari too). */
export const useBodyScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    if (locks === 0) {
      savedY = window.scrollY;
      body.style.position = "fixed";
      body.style.top = `-${savedY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) {
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.overflow = "";
        window.scrollTo(0, savedY);
      }
    };
  }, [active]);
};
