import React from "react";
import { cn } from "@/lib/utils";
import { generateRandomColors } from "./ColorMatch.utils";
import GameOver from "@/components/shared/GameOver";
import { updateHighscores } from "../game.utils";
import { useRevalidator } from "react-router";

type baseProps = {
  color: string;
  clickable?: boolean;
  onChoice?: (color: string) => void;
};

type ColorProps =
  | (React.ComponentPropsWithoutRef<"div"> & baseProps)
  | (React.ComponentPropsWithoutRef<"button"> & baseProps);

type ColorMatchColors = {
  colorToMatch: string;
  colors: Array<string>;
};

const Color = ({ color, clickable = false, onChoice }: ColorProps) => {
  const Component = clickable ? "button" : "div";
  return (
    <Component
      className={cn("size-16 sm:size-24 inline-block rounded-lg", {
        "cursor-pointer": clickable,
      })}
      onClick={() => clickable && onChoice && onChoice(color)}
      style={{ backgroundColor: color }}
    ></Component>
  );
};

export default function ColorMatch() {
  const [colors, setColors] = React.useState<ColorMatchColors>(() =>
    generateRandomColors(1)
  );
  const [level, setLevel] = React.useState<number>(1);
  const [gameOver, setGameOver] = React.useState<boolean>(false);

  const revalidator = useRevalidator();

  function resetGame() {
    setLevel(1);
    setColors(generateRandomColors(1));
    setGameOver(false);
  }

  function handleChoice(color: string) {
    if (color !== colors.colorToMatch) {
      setGameOver(true);
      return;
    }
    const newLevel = level + 1;
    setLevel(newLevel);
    setColors(generateRandomColors(newLevel));
  }

  React.useEffect(() => {
    if(!gameOver) return
    updateHighscores("Color Match", level - 1);
    //revalidate so highscore gets refetched
    revalidator.revalidate();
     /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [gameOver])

  return (
    <section className="flex items-center flex-col gap-8">
      {gameOver ? (
        <GameOver onRestart={resetGame} score={level - 1} />
      ) : (
        <>
          <span className="text-3xl text-primary-teal font-medium">
            Level: {level}
          </span>
          <p>Color to guess:</p>
          <Color color={colors.colorToMatch} />
          <p>Choose the correct color from these options.</p>
          <div className="flex gap-4">
            {colors.colors.map((color, index) => (
              <Color
                key={index}
                color={color}
                clickable={true}
                onChoice={handleChoice}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
