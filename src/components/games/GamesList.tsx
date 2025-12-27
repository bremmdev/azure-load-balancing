import { Link, useLoaderData } from "react-router";
import { slugify } from "@/lib/utils";
import { Game } from "@/lib/types";

export default function GamesList() {
  const games = useLoaderData<Game[]>();

  return (
    <section className="space-y-12 md:space-y-16">
      <h2 className="text-xl sm:text-3xl text-primary-teal tracking-wide font-bold text-center leading-tight max-w-2xl mx-auto">
        Enhance your brain health through fun and engaging memory games
      </h2>
      <div className="text-slate-900 grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {games.map((game) => (
          <Link
            to={`/games/${slugify(game.name)}`}
            className="group"
            key={game.id}
            aria-label={`${game.name} game`}
            viewTransition
          >
            <div
              key={game.id}
              className="group-hover:-translate-y-1 transition-all"
            >
              <img
                src={game.image}
                alt={game.name}
                className="max-h-56 w-full"
              />
              <div className="p-6 border border-teal-500 border-t-0 rounded-b-md space-y-3 group-hover:border-primary-teal">
                <h3
                  className="text-primary-teal text-lg font-medium uppercase"
                  style={{
                    viewTransitionName: `card-${game.name
                      .replace(" ", "")
                      .toLowerCase()}`,
                  }}
                >
                  {game.name}
                </h3>
                <p className="line-clamp-4">{game.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
