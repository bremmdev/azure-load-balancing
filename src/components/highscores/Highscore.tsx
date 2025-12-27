import HighscoreTooltip from "./HighscoreTooltip";
import { useLoaderData } from "react-router";

export default function Highscore({ gameName }: { gameName: string }) {
  
  const { highscores } = useLoaderData()

  const highscore = (highscores && highscores[gameName]) || "N/A";

  return (
    <div className="text-primary-teal font-bold flex gap-2">
      <span>Your personal highscore: {highscore}</span>
      <HighscoreTooltip />
    </div>
  );
}
