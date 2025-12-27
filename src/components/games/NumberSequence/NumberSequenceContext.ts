import React from "react";

export const TOTAL_TIME = 5;

type NumberSequenceContextType = {
  number: number;
  setNumber: React.Dispatch<React.SetStateAction<number>>;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NumberSequenceContext =
  React.createContext<NumberSequenceContextType | null>(null);

export const useNumberSequence = () => {
  const context = React.useContext(NumberSequenceContext);
  if (!context) {
    throw new Error(
      "useNumberSequence must be used within a NumberSequenceProvider"
    );
  }
  return context;
};
