import { words } from "./words";
import { generateRandomWords, TOTAL_TIME } from "./SpeedTyping.utils";
import React from "react";
import { calculateScore } from "./SpeedTyping.utils";
import { updateHighscores } from "../game.utils";
import { useRevalidator } from "react-router";

export default function SpeedTyping() {
  const [randomWords, setRandomWords] = React.useState<string[]>(() =>
    generateRandomWords(60, words)
  );
  const [timerStarted, setTimerStarted] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(TOTAL_TIME);
  const [typedWords, setTypedWords] = React.useState("");
  const [correctWordsIndexes, setCorrectWordsIndexes] = React.useState<
    number[]
  >([]);
  const [WPM, setWPM] = React.useState(0);
  const textareRef = React.useRef<HTMLTextAreaElement>(null);

  const revalidator = useRevalidator();

  function handleTyping(event: React.FormEvent<HTMLTextAreaElement>) {
    if (!timerStarted) {
      setTimerStarted(true);
    }
    setTypedWords(event.currentTarget.value);
  }

  function handleGameEnd() {
    const { wpm, correctWordsByIndex } = calculateScore(
      randomWords,
      typedWords,
      TOTAL_TIME - timeRemaining
    );
    setWPM(wpm);
    setCorrectWordsIndexes(correctWordsByIndex);
    updateHighscores("Speed Typing", wpm);
    //revalidate so highscore gets refetched
    revalidator.revalidate();
  }

  function resetGame() {
    setRandomWords(generateRandomWords(60, words));
    setTypedWords("");
    setTimeRemaining(TOTAL_TIME);
    setTimerStarted(false);
    setCorrectWordsIndexes([]);
    setWPM(0);
    if (textareRef.current) {
      textareRef.current.value = "";
      setTimeout(() => {
        textareRef.current?.focus();
      }, 0);
    }
  }

  const onGameEnd = React.useEffectEvent(() => handleGameEnd());

  React.useEffect(() => {
    if (!timerStarted) return;
    if (timeRemaining === 0) {
      onGameEnd();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerStarted, timeRemaining]);

  /* STATE DERIVED VALUES */
  const gameFinished = timeRemaining === 0;
  const wordTrackCount = typedWords.trim().split(" ").filter(Boolean).length;
  const showMobileLastSeconds = timeRemaining !== 0 && timeRemaining <= 5;

  return (
    <>
      <section className="font-mono bg-white border-primary-teal border select-none p-2.5 rounded-xl sm:p-6 md:p-8 sm:text-left relative text-xs sm:text-base">
        {randomWords.map((word, index) => {
          const isIncorrect = !correctWordsIndexes.includes(index);
          const classNames = !gameFinished
            ? typedWords && index < wordTrackCount
              ? "font-bold"
              : ""
            : isIncorrect
            ? "text-red-500 font-bold"
            : "";
          return <span className={classNames} key={index}>{`${word} `}</span>;
        })}
        {/* for mobile devices, show as overlay or words because of limited screen space */}
        {showMobileLastSeconds && (
          <span className="sm:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-9xl z-10 opacity-30 text-primary-teal font-medium transition-all">
            {timeRemaining}
          </span>
        )}
      </section>
      <section className="space-y-8">
        <textarea
          ref={textareRef}
          className="outline-none font-mono bg-primary-teal/15 rounded-xl p-4 w-full resize-none h-40 sm:h-56 md:h-52 sm:p-6 md:p-8 text-xs sm:text-base focus-visible:ring-primary-teal focus-visible:ring-2 disabled:opacity-50"
          placeholder="Start typing the words to begin the test..."
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          autoCapitalize="off"
          onInput={handleTyping}
          disabled={gameFinished}
        ></textarea>
        <button
          disabled={timerStarted && !gameFinished}
          onClick={resetGame}
          className="transition-all w-fit mx-auto duration-300 text-base sm:text-lg block bg-primary-teal/15 text-primary-teal font-bold py-2 px-8 rounded-lg cursor-pointer ring-primary-teal ring-2 border-b-primary-teal border-b-2 hover:bg-primary-teal/30 hover:scale-105 disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed"
        >
          Play Again
        </button>
        <div className="flex justify-between mx-auto w-3/4">
          <div className="flex flex-col gap-3">
            <span>Time Remaining:</span>
            <span className="text-center text-2xl sm:text-3xl text-primary-teal font-medium">
              {timeRemaining}s
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <span>Speed (WPM):</span>
            <span className="text-center text-2xl sm:text-3xl text-primary-teal font-medium">
              {WPM}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
