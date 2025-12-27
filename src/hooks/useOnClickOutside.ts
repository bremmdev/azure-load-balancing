import React from "react";

type Event = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement | null>(
  element: React.RefObject<T> | null,
  handler: (e: Event) => void
) {
  React.useEffect(() => {
    const listener = (e: Event) => {
      if (!element?.current) {
        return;
      }

      const el = element.current;
      const target = e.target as HTMLElement;

      if (!el || target === el || el.contains(target) || target.closest("#trigger")) {
        return;
      }
      handler(e); //Call the handler only if the click is outside of the element
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [element, handler]);
}