import React from "react";
import useScrollToTop from "@/hooks/useScrollToTop";
import { Link, useLoaderData } from "react-router";
import type { Game, GameComponentType } from "@/lib/types";
import Container from "@/components/layout/Container";
import GameHero from "@/components/games/GameHero";
import Button from "@/components/ui/Button";
import { MoveLeft } from "lucide-react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function Game() {
  useScrollToTop();

  const { game, gameComponent } = useLoaderData();

  const [isPlaying, setIsPlaying] = React.useState(false);

  //contains the dynamically imported game component
  const [GameComponent] =
    React.useState<React.ComponentType<GameComponentType> | null>(
      gameComponent
    );

  useDocumentTitle(`Memcaydia - ${game?.name}`, game?.name ? true : false);

  //if the slug does not match any game, return a not found message
  if (!game) {
    throw new Error("Game not found");
  }

  return (
    <div>
      {GameComponent && (
        <Container>
          <Link
            to="/"
            className="flex text-primary-teal justify-center gap-2 items-center border border-primary-teal px-4 py-2 w-fit rounded-md font-medium uppercase hover:bg-primary-teal/10 -mt-6"
            viewTransition
          >
            <MoveLeft className="size-5" />
            Back
          </Link>
          <GameHero game={game!} />
          {isPlaying ? (
            <GameComponent isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
          ) : (
            <Button
              onClick={() => {
                React.startTransition(() => {
                  setIsPlaying(true);
                });
              }}
            >
              Start
            </Button>
          )}
        </Container>
      )}
    </div>
  );
}
