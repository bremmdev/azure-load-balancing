export type Game = {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
};

export type GameComponentType = {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};
