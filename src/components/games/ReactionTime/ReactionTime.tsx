import React from "react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { updateHighscores } from "../game.utils";
import { useRevalidator } from "react-router";
import F1Beep from "@/assets/f1beep.mp3";

const Result = ({
  reactionTime,
  onReset,
}: {
  reactionTime: number;
  onReset: () => void;
}) => {
  const revalidator = useRevalidator();

  React.useEffect(() => {
    updateHighscores("Reaction Time", Math.round(reactionTime), true);
    //revalidate so highscore gets refetched
    revalidator.revalidate();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [reactionTime]);

  return (
    <div>
      <p className="flex space-between gap-4">
        Your reaction time:
        <span className="font-bold text-primary-teal ml-auto">
          {Math.round(reactionTime)}ms
        </span>
      </p>
      <Button className="my-6" onClick={onReset}>
        Play again
      </Button>
    </div>
  );
};

const F1Lights = ({
  countingDown,
  setCountingDown,
  clearLights,
}: {
  countingDown: boolean;
  setCountingDown: React.Dispatch<React.SetStateAction<boolean>>;
  clearLights: boolean;
}) => {
  const [lightCount, setLightCount] = React.useState<number>(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  React.useEffect(() => {
    if (!countingDown) return;

    intervalRef.current = setInterval(() => {
      setLightCount((prevCount) => prevCount + 1);
      const beep = new Audio(F1Beep);
      beep.play();
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countingDown]);

  // Clear the interval if the active lights reach 5
  React.useEffect(() => {
    if (lightCount === 5) {
      clearInterval(intervalRef.current!);
      setCountingDown(false);
    }
  }, [lightCount, setCountingDown]);

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center justify-center">
          <div
            className={cn(
              "w-12 h-24 bg-black rounded-lg flex flex-col items-center justify-center gap-2",
              ""
            )}
          >
            <span className="block w-8 h-8 bg-slate-700 rounded-full"></span>
            <span
              className={cn(
                "block w-8 h-8 rounded-full transition-colors duration-200",
                i < lightCount && !clearLights
                  ? "bg-red-500 shadow-lg shadow-red-500/50"
                  : "bg-gray-700"
              )}
            ></span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ReactionTime() {
  const [countingDown, setCountingDown] = React.useState(true);
  const [clearLights, setClearLights] = React.useState(false);
  const [reactionTime, setReactionTime] = React.useState<number | undefined>(
    undefined
  );
  const [timeStamp, setTimeStamp] = React.useState<number>(0);

  function handleReactionClick() {
    const reactionTime = Date.now() - timeStamp;
    setReactionTime(reactionTime);
  }

  function resetGame() {
    setCountingDown(true);
    setClearLights(false);
    setReactionTime(undefined);
    setTimeStamp(0);
  }

  // Random time between 2 and 5 seconds before the lights go out
  React.useEffect(() => {
    if (countingDown) return;

    //random time between 2 and 5 seconds
    const timeout = setTimeout(() => {
      setClearLights(true);
      setTimeStamp(Date.now());
    }, Math.floor(Math.random() * 3000) + 2000);

    return () => clearTimeout(timeout);
  }, [countingDown]);

  const showResult = reactionTime !== undefined;

  return (
    <div className="flex items-center flex-col gap-12">
      {showResult ? (
        <Result reactionTime={reactionTime} onReset={resetGame} />
      ) : (
        <>
          <p>Click the figure as soon as the lights go out!</p>
          <F1Lights
            countingDown={countingDown}
            setCountingDown={setCountingDown}
            clearLights={clearLights}
          />
          <button
            className={cn(
              "size-24 inline-block rotate-45 bg-primary-teal opacity-25 rounded-lg my-2",
              {
                "opacity-100 cursor-pointer": clearLights,
              }
            )}
            disabled={!clearLights}
            onClick={handleReactionClick}
          ></button>
        </>
      )}
    </div>
  );
}
