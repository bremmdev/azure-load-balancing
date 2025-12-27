import useScrollToTop from "@/hooks/useScrollToTop";
import Container from "@/components/layout/Container";
import { Link, useLoaderData } from "react-router";
import { MoveLeft } from "lucide-react";
import type { Game } from "@/lib/types";

function HighscorePage() {
  useScrollToTop();

  const { games, highscores } = useLoaderData<{games: Game[], highscores: Record<string, number>}>();

  const gamesWithHighscores = games?.map((game) => {
    const highscore = highscores![game.name] || "N/A";
    return { ...game, highscore: highscore };
  });

  return (
    <Container>
      <div className="max-sm:-mt-6 flex-column sm:flex-row justify-center items-center relative">
        <Link
          to="/"
          className="sm:absolute sm:left-0 flex text-primary-teal justify-center gap-2 items-center border border-primary-teal px-4 py-2 w-fit rounded-md font-medium uppercase hover:bg-primary-teal/10"
          viewTransition
        >
          <MoveLeft className="size-5" />
          Back
        </Link>
        <h1 className="max-sm:mt-6 w-fit mx-auto sm:translate-y-1.5 text-2xl sm:text-3xl tracking-wide font-bold text-center text-primary-teal">
          Highscores
        </h1>
      </div>
      <ul>
        {gamesWithHighscores?.map((game) => (
          <li
            key={game.id}
            className="flex justify-between items-center py-4 border-b border-gray-200"
          >
            <span className="flex gap-6 items-center">
              <img src={game.image} alt={game.name} width={64} height={64} />
              <span className="font-medium">{game.name}</span>
            </span>

            <span className="text-primary-teal font-medium">
              {game.highscore}
            </span>
          </li>
        ))}
      </ul>
    </Container>
  );
}

export const Component = HighscorePage;