export function generateRandomNumber(length: number) {
  let rnd = "";

  // Generate the first digit separately to ensure it is not '0'
  while (rnd.length === 0) {
    const firstDigit = Math.floor(Math.random() * 9) + 1; // Generates a number between 1 and 9
    rnd += firstDigit.toString();
  }

  // Generate the rest of the digits
  while (rnd.length < length) {
    const newNumber = Math.floor(Math.random() * 10).toString();

    if (newNumber !== rnd[rnd.length - 1]) {
      rnd += newNumber;
    }
  }

  return parseInt(rnd, 10);
}

export function updateHighscores(
  gameName: string,
  score: number,
  minimum = false
) {
  const highscoresFromLocalStorage = JSON.parse(
    localStorage.getItem("memcaydia_highscores") || "{}"
  );

  if (!highscoresFromLocalStorage[gameName]) {
    highscoresFromLocalStorage[gameName] = score;
  } else {
    // Update the highscore if the new score is better (lower for reaction time, higher for the rest)
    if (minimum) {
      highscoresFromLocalStorage[gameName] = Math.min(
        highscoresFromLocalStorage[gameName],
        score
      );
    } else {
      highscoresFromLocalStorage[gameName] = Math.max(
        highscoresFromLocalStorage[gameName],
        score
      );
    }
  }

  localStorage.setItem(
    "memcaydia_highscores",
    JSON.stringify(highscoresFromLocalStorage)
  );
}
