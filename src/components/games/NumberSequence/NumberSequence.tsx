import React from "react";
import { generateRandomNumber, updateHighscores } from "../game.utils";
import Button from "../../ui/Button";
import {
  NumberSequenceContext,
  TOTAL_TIME,
  useNumberSequence,
} from "./NumberSequenceContext";
import { GameComponentType } from "@/lib/types";
import { useRevalidator } from "react-router";
import GameOver from "@/components/shared/GameOver";

const NumberInput = () => {
  const { number, level, setLevel, setTimeRemaining, setNumber, setGameOver } =
    useNumberSequence();

  function goToNextLevel() {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setTimeRemaining(TOTAL_TIME);
    setNumber(generateRandomNumber(nextLevel));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector("#number") as HTMLInputElement;
    if (!input) return;

    const value = input.value;

    if (value === number.toString()) {
      goToNextLevel();
    } else {
      setGameOver(true);
    }
  }

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row max-w-2xl mx-auto animate-fade-in"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4 flex-1">
        <label htmlFor="number" className="text-primary-teal font-medium block">
          Enter the number
        </label>
        <input
          type="text"
          className="p-2 border-primary-teal border rounded-md flex-1 w-full text-inherit h-10"
          id="number"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          required
        />
      </div>
      <Button className="max-sm:w-full self-end" type="submit">
        Submit
      </Button>
    </form>
  );
};

const ProgressBar = () => {
  return (
    <div className="w-full bg-primary-teal h-2 rounded-full overflow-hidden max-w-56 mx-auto">
      <div
        className="h-full bg-teal-200 animate-progress-shrink"
        style={{ animationDuration: `${TOTAL_TIME}s` }}
      ></div>
    </div>
  );
};

const GameOverComp = () => {
  const {
    gameOver,
    level,
    setLevel,
    setNumber,
    setGameOver,
    setTimeRemaining,
  } = useNumberSequence();

  function resetGame() {
    setLevel(1);
    setTimeRemaining(TOTAL_TIME);
    setNumber(generateRandomNumber(1));
    setGameOver(false);
  }

  const revalidator = useRevalidator();

  React.useEffect(() => {
    if (!gameOver) return;
    updateHighscores("Number Sequence", level - 1);
    //revalidate so highscore gets refetched
    revalidator.revalidate();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [gameOver]);

  return <GameOver score={level - 1} onRestart={resetGame} />;
};

export default function NumberSequence({ isPlaying }: GameComponentType) {
  const [timeRemaining, setTimeRemaining] = React.useState<number>(TOTAL_TIME);
  const [number, setNumber] = React.useState(
    React.useMemo(() => generateRandomNumber(1), [])
  );
  const [level, setLevel] = React.useState(1);
  const [gameOver, setGameOver] = React.useState(false);

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);

      if (timeRemaining === 0) {
        clearInterval(interval);
      }

      return () => clearInterval(interval);
    }
  }, [isPlaying, timeRemaining]);

  return (
    <NumberSequenceContext.Provider
      value={{
        number,
        setNumber,
        level,
        setLevel,
        timeRemaining,
        setTimeRemaining,
        gameOver,
        setGameOver,
      }}
    >
      {gameOver && <GameOverComp />}
      {!gameOver && timeRemaining > 0 && (
        <div className="text-center mx-auto space-y-6">
          <span className="text-3xl text-primary-teal font-medium">
            Level: {level}
          </span>
          <p className="my-4">
            Remember the following number:
            <span className="text-2xl sm:text-3xl text-primary-teal font-medium block my-4">
              {number}
            </span>
          </p>
          <ProgressBar />
        </div>
      )}
      {!gameOver && timeRemaining === 0 && <NumberInput />}
    </NumberSequenceContext.Provider>
  );
}
