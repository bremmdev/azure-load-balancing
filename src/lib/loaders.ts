import { slugify } from "@/lib/utils";
import React from "react";
import { games as gamesData } from "../data/games-data";

function getHighscores() {
  return JSON.parse(
    localStorage.getItem("memcaydia_highscores") || "{}"
  ) as Record<string, number>;
}

export async function indexRouteLoader() {
  return gamesData;
}

export async function gameRouteLoader(slug?: string) {
  try {
    const games = gamesData;
    const game = games?.find((game) => slugify(game.name) === slug);
    const highscoresFromLocalStorage = getHighscores();
    const unsluggedGameName = game?.name.replace(/ /g, "");
    const gameComponent = React.lazy(
      () =>
        import(
          `../components/games/${unsluggedGameName}/${unsluggedGameName}.tsx`
        )
    );
    return { game, highscores: highscoresFromLocalStorage, gameComponent };
  } catch {
    throw new Error("Could not load game");
  }
}

export async function highscoreRouteLoader() {
  try {
    const games = gamesData;
    const highscoresFromLocalStorage = getHighscores();
    return { games, highscores: highscoresFromLocalStorage };
  } catch {
    throw new Error("Could not load data");
  }
}
