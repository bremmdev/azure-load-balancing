import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { Info } from "lucide-react";
import React from "react";

export default function HighscoreTooltip() {
  const [show, setShow] = React.useState(false);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  function handleOpen() {
    if (!show) {
      setShow(true);
    }
  }

  useOnClickOutside(tooltipRef, () => setShow(false));

  return (
    <div className="relative items-center flex">
      {show && (
        <div
          className="absolute bottom-7 left-[50%] -translate-x-[50%] p-2 border xs:min-w-40 border-slate-700 text-slate-700 bg-slate-100 rounded-md"
          ref={tooltipRef}
        >
          <p className="text-xs w-full">
            Highscores are saved in your current browser and not synced between
            devices
          </p>
        </div>
      )}
      <button onClick={handleOpen} id="trigger">
        <Info className="size-5" />
      </button>
    </div>
  );
}
