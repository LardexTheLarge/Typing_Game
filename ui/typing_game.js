document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const ghostText = document.getElementById("ghostText");
  const inputField = document.getElementById("inputField");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const startGameBtn = document.getElementById("startGameBtn");
  const resultsDisplay = document.getElementById("resultsDisplay");
  const wpmResult = document.getElementById("wpmResult");
  const accuracyResult = document.getElementById("accuracyResult");
  const restartGameBtn = document.getElementById("restartGameBtn");
  const timeRemainingText = document.getElementById("timeRemainingText");
  const timerProgressBar = document.getElementById("timerProgressBar");

  // --- Game State ---
  let sentences = [];
  const TOTAL_SENTENCES = 10;
  const TIME_PER_SENTENCE = 35; /* CHANGE THIS TO 35 */
  let currentSentenceIndex = 0;
  let gameStartTime;
  let totalCorrectWords = 0;
  let totalWordsInGame = 0;
  let sentenceTimerInterval;
  let timeLeftInSentence;

  const sampleSentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
    "Sphinx of black quartz, judge my vow.",
    "The five boxing wizards jump quickly.",
    "Jackdaws love my big sphinx of quartz.",
    "Waltz, nymph, for quick jigs vex Bud.",
    "Quick zephyrs blow, vexing daft Jim.",
    "Two driven jocks help fax my big quiz.",
  ];

  async function initializeSentences() {
    // --- Try to fetch sentences from the backend ---
    try {
      // Flask backend is running on http://127.0.0.1:5000
      const response = await fetch("http://127.0.0.1:5000/get-sentences");

      if (!response.ok) {
        // response is not OK, throw an error to be caught by the catch block
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const fetchedSentences = await response.json();

      if (
        fetchedSentences &&
        fetchedSentences.length === TOTAL_SENTENCES &&
        !fetchedSentences.some((s) => s.includes("Error:"))
      ) {
        sentences = fetchedSentences;
        console.log("Sentences fetched from backend:", sentences);
      } else {
        // fetched sentences are invalid or not the correct number, use fallback
        console.error(
          "Invalid sentences from backend or wrong count, using sample sentences."
        );
        sentences = sampleSentences; // Fallback to hardcoded sentences
      }
    } catch (error) {
      // there's an error during fetch (e.g., backend not running, network issue)
      console.error(
        "Failed to fetch sentences from backend, using sample sentences:",
        error
      );
      sentences = sampleSentences; // Fallback to hardcoded sentences
    }
  }

  function startGame() {
    initializeSentences().then(() => {
      currentSentenceIndex = 0;
      totalCorrectWords = 0;
      totalWordsInGame = 0;
      gameStartTime = new Date();

      inputField.contentEditable = true;
      inputField.textContent = "";
      ghostText.textContent = "";
      inputField.focus();

      resultsDisplay.style.display = "none";
      startGameBtn.style.display = "none";

      stopSentenceTimer();
      timeRemainingText.textContent = "--";
      timerProgressBar.style.width = "100%";

      loadNextSentence();
      updateProgress();
    });
  }

  function startSentenceTimer() {
    stopSentenceTimer();
    timeLeftInSentence = TIME_PER_SENTENCE;
    timeRemainingText.textContent = timeLeftInSentence;
    timerProgressBar.style.width = "100%";
    timerProgressBar.style.backgroundColor = "#2ecc71";

    sentenceTimerInterval = setInterval(() => {
      timeLeftInSentence--;
      timeRemainingText.textContent = timeLeftInSentence;
      const percentageLeft = (timeLeftInSentence / TIME_PER_SENTENCE) * 100;
      timerProgressBar.style.width = percentageLeft + "%";

      if (
        timeLeftInSentence <= TIME_PER_SENTENCE / 2 &&
        timeLeftInSentence > TIME_PER_SENTENCE / 4
      ) {
        timerProgressBar.style.backgroundColor = "#f39c12";
      } else if (timeLeftInSentence <= TIME_PER_SENTENCE / 4) {
        timerProgressBar.style.backgroundColor = "#e74c3c";
      }

      if (timeLeftInSentence <= 0) {
        stopSentenceTimer();
        processSentenceCompletion(true);
      }
    }, 1000);
  }

  function stopSentenceTimer() {
    clearInterval(sentenceTimerInterval);
  }

  function loadNextSentence() {
    stopSentenceTimer();
    if (currentSentenceIndex < TOTAL_SENTENCES) {
      const sentence = sentences[currentSentenceIndex];
      createGhostText(sentence);
      inputField.innerHTML = "";
      inputField.focus();
      startSentenceTimer();
    } else {
      endGame();
    }
  }

  function createGhostText(sentence) {
    ghostText.innerHTML = sentence
      .split("")
      .map((c) => `<span class="ghost-char">${c === " " ? "&nbsp;" : c}</span>`)
      .join("");
  }

  function handleInput() {
    const typedText = inputField.textContent;
    const targetText = sentences[currentSentenceIndex];
    let newHtml = "";
    let allCorrect = true;

    for (let i = 0; i < targetText.length; i++) {
      const targetChar = targetText[i];
      const typedChar = typedText[i] || "";
      const isCorrect = typedChar === targetChar;

      newHtml += `
      <span class="ghost-char">
        ${targetChar === " " ? "&nbsp;" : targetChar}
        ${
          typedChar
            ? `
          <span class="typed-char ${!isCorrect ? "incorrect" : ""}">
            ${typedChar === " " ? "&nbsp;" : typedChar}
          </span>
        `
            : ""
        }
      </span>
    `;

      if (!isCorrect) allCorrect = false;
    }

    ghostText.innerHTML = newHtml;

    // Auto-submit when fully typed correctly
    if (allCorrect && typedText.length === targetText.length) {
      processSentenceCompletion(false);
    }
  }

  // Update event listener
  inputField.addEventListener("input", handleInput);

  function updateProgress() {
    const progressPercentage = (currentSentenceIndex / TOTAL_SENTENCES) * 100;
    progressBar.style.width = progressPercentage + "%";
    progressText.textContent = `Sentence ${currentSentenceIndex} of ${TOTAL_SENTENCES}`;
  }

  function processSentenceCompletion(isTimeout = false) {
    stopSentenceTimer();

    const currentTargetSentence = sentences[currentSentenceIndex];
    const targetWords = currentTargetSentence
      .split(/\s+/)
      .filter((word) => word.length > 0);
    totalWordsInGame += targetWords.length;

    if (!isTimeout) {
      const typedText = inputField.textContent.trim();
      const typedWords = typedText
        .split(/\s+/)
        .filter((word) => word.length > 0);
      for (let i = 0; i < targetWords.length; i++) {
        if (i < typedWords.length && typedWords[i] === targetWords[i]) {
          totalCorrectWords++;
        }
      }
    } else {
      console.log(`Sentence ${currentSentenceIndex + 1} timed out.`);
    }

    currentSentenceIndex++;
    updateProgress();
    loadNextSentence();
  }

  function endGame() {
    stopSentenceTimer();
    inputField.contentEditable = false;
    inputField.textContent = "";
    ghostText.textContent = "";
    timeRemainingText.textContent = "--";
    timerProgressBar.style.width = "0%";

    const gameEndTime = new Date();
    const timeElapsedInSeconds = (gameEndTime - gameStartTime) / 1000;
    const timeElapsedInMinutes = timeElapsedInSeconds / 60;

    let wpm = 0;
    if (timeElapsedInMinutes > 0 && totalCorrectWords > 0) {
      wpm = Math.round(totalCorrectWords / timeElapsedInMinutes);
    }

    let accuracy = 0;
    if (totalWordsInGame > 0) {
      accuracy = Math.round((totalCorrectWords / totalWordsInGame) * 100);
    }

    wpmResult.textContent = wpm;
    accuracyResult.textContent = accuracy;
    resultsDisplay.style.display = "block";
    startGameBtn.style.display = "block";
    startGameBtn.textContent = "Play Again?";
    progressText.textContent = `Completed ${TOTAL_SENTENCES} sentences!`;
  }

  // Event Listeners
  startGameBtn.addEventListener("click", startGame);
  restartGameBtn.addEventListener("click", startGame);

  inputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !inputField.contentEditable) {
      event.preventDefault();
      if (
        inputField.textContent.trim() !== "" ||
        sentences[currentSentenceIndex]
      ) {
        processSentenceCompletion(false);
      }
    }
  });

  // Initial UI state
  progressText.textContent = `Sentence 0 of ${TOTAL_SENTENCES}`;
  timeRemainingText.textContent = "--";
  timerProgressBar.style.width = "100%";
});
