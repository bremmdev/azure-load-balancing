import Button from "../ui/Button";

type Props = {
  score: number;
  onRestart: () => void;
};

export default function GameOver(props: Props) {
  const { score, onRestart } = props;

  return (
    <div className="text-center mx-auto space-y-6">
      <h2 className="text-2xl sm:text-3xl font-mediun text-primary-teal font-medium">
        Game Over
      </h2>
      <p className="text-lg">
        Your final score is <span className="font-medium">{score}</span>
      </p>
      <Button onClick={onRestart}>Play again</Button>
    </div>
  );
}
