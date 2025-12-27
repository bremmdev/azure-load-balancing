import React from "react";
import GameOver from "@/components/shared/GameOver";
import { cn } from "@/lib/utils";
import { updateHighscores } from "@/components/games/game.utils";
import { useRevalidator } from "react-router";

const TILE_COUNT = 25;

function generateRandomTiles(level: number) {
  const highlightedTiles = new Set<number>();

  while (highlightedTiles.size < level) {
    highlightedTiles.add(Math.floor(Math.random() * TILE_COUNT));
  }

  return highlightedTiles;
}

const Tile = ({
  isHighlighted,
  level,
  onClick,
}: {
  isHighlighted: boolean;
  level: number;
  onClick: () => void;
}) => {
  const [selected, setSelected] = React.useState(false);

  function handleTileClick() {
    setSelected((prev) => !prev);
    onClick();
  }

  React.useEffect(() => {
    setSelected(false);
  }, [level]);

  return (
    <button
      className={cn("size-16 bg-primary-teal/5", {
        "bg-primary-teal": isHighlighted,
        "border-2 border-primary-teal": selected,
        "cursor-not-allowed": isHighlighted,
      })}
      onClick={handleTileClick}
      disabled={isHighlighted}
    />
  );
};

export default function MemoryTile() {
  const [level, setLevel] = React.useState(1);
  const [gameOver, setGameOver] = React.useState(false);
  const [highlightedTiles, setHighlightedTiles] = React.useState(
    React.useMemo(() => generateRandomTiles(level), [level])
  );
  const [isHighlighted, setIsHighlighted] = React.useState(true);
  const [selectedTiles, setSelectedTiles] = React.useState(new Set<number>());
  const gridRef = React.useRef<HTMLDivElement>(null);

  const revalidator = useRevalidator();

  //briefly highlight the tiles
  React.useEffect(() => {
    const timeout = 1500 + level * 250;

    setTimeout(() => {
      setIsHighlighted(false);
    }, timeout);
  }, [level]);

  React.useEffect(() => {
    gridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [level]);

  React.useEffect(() => {
    if (!gameOver) return;
    updateHighscores("Memory Tile", level - 1);
    //revalidate so highscore gets refetched
    revalidator.revalidate();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [gameOver]);

  function resetGame() {
    setLevel(1);
    setHighlightedTiles(generateRandomTiles(1));
    setSelectedTiles(new Set());
    setIsHighlighted(true);
    setGameOver(false);
  }

  function handleTitleSelect(index: number) {
    //if already selected, remove it
    if (selectedTiles.has(index)) {
      selectedTiles.delete(index);
      setSelectedTiles(new Set(selectedTiles));
      return;
    }

    //handle success
    if (highlightedTiles.has(index)) {
      //check if all tiles are selected
      if (selectedTiles.size === level - 1) {
        setLevel((prev) => prev + 1);
        setHighlightedTiles(generateRandomTiles(level + 1));
        setSelectedTiles(new Set());
        setIsHighlighted(true);
        return;
      }

      //add selected tile to the set
      setSelectedTiles((prev) => new Set(prev.add(index)));
    } else {
      setGameOver(true);
    }
  }

  return (
    <div>
      {gameOver && <GameOver score={level - 1} onRestart={resetGame} />}
      {!gameOver && (
        <div className="text-center mx-auto space-y-6">
          <span className="text-3xl text-primary-teal font-medium block">
            Level: {level}
          </span>
          <div
            className={cn("w-fit mx-auto grid grid-cols-5 gap-1", {
              "pointer-events-none": isHighlighted,
            })}
            ref={gridRef}
          >
            {Array.from({ length: TILE_COUNT }).map((_, index) => (
              <Tile
                key={index}
                isHighlighted={highlightedTiles.has(index) && isHighlighted}
                level={level}
                onClick={handleTitleSelect.bind(null, index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
