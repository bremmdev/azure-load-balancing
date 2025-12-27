export const TOTAL_TIME = 60;

export function generateRandomWords(count: number, wordList: string[]) {
  const randomWords: string[] = [];
  for (let i = 0; i < count; i++) {
    let randomIndex = Math.floor(Math.random() * wordList.length);

    while (randomWords.includes(wordList[randomIndex])) {
      // Regenerate random index if word is already included
      const newIndex = Math.floor(Math.random() * wordList.length);
      randomIndex = newIndex;
    }

    randomWords.push(wordList[randomIndex]);
  }
  return randomWords;
}

export function calculateScore(
  words: string[],
  typedWords: string,
  timeInSeconds: number
) {
  // Split typed words by spaces and filter out any empty strings
  const typedWordsArray = typedWords.trim().split(" ").filter(Boolean);

  const correctWordsByIndex = words.reduce<number[]>(
    (acc, correctWord, index) => {
      const typedWord = typedWordsArray[index];
      if (typedWord && typedWord === correctWord) {
        acc.push(index);
      }
      return acc;
    },
    []
  );

  const wpm = Math.round((correctWordsByIndex.length / timeInSeconds) * 60);

  return {
    wpm,
    correctWordsByIndex,
  };
}
