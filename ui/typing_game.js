document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const sentenceDisplay = document.getElementById("sentenceDisplay");
  const textInput = document.getElementById("textInput");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const startGameBtn = document.getElementById("startGameBtn");
  const resultsDisplay = document.getElementById("resultsDisplay");
  const wpmResult = document.getElementById("wpmResult");
  const accuracyResult = document.getElementById("accuracyResult");
  const restartGameBtn = document.getElementById("restartGameBtn");

  // --- Game State ---
  let sentences = []; // Will be populated by fetchSentences or a default set
  const TOTAL_SENTENCES = 10;
  let currentSentenceIndex = 0;
  let gameStartTime;
  let totalCorrectWords = 0;
  let totalWordsInGame = 0;

  // --- Sample Sentences (Replace with fetched sentences from your backend) ---
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

  // --- Functions ---

  // In a real application, you'd fetch sentences from your Python backend.
  // For now, we'll use the sample sentences.
  async function initializeSentences() {
    // Placeholder for fetching sentences.
    // For example, if your Python script runs an API:
    // try {
    //     const response = await fetch('/api/get-sentences?count=' + TOTAL_SENTENCES);
    //     sentences = await response.json();
    //     if (sentences.length !== TOTAL_SENTENCES) throw new Error("Not enough sentences");
    // } catch (error) {
    //     console.error("Failed to fetch sentences, using samples:", error);
    //     sentences = sampleSentences;
    // }
    sentences = sampleSentences; // Using sample sentences for this example
  }

  function startGame() {
    initializeSentences().then(() => {
      currentSentenceIndex = 0;
      totalCorrectWords = 0;
      totalWordsInGame = 0;
      gameStartTime = new Date();

      textInput.disabled = false;
      textInput.value = "";
      textInput.focus();

      resultsDisplay.style.display = "none";
      startGameBtn.style.display = "none";

      loadNextSentence();
      updateProgress();
    });
  }

  function loadNextSentence() {
    if (currentSentenceIndex < TOTAL_SENTENCES) {
      sentenceDisplay.textContent = sentences[currentSentenceIndex];
      textInput.value = ""; // Clear input for the new sentence
      textInput.focus();
    } else {
      endGame();
    }
  }

  function updateProgress() {
    const progressPercentage = (currentSentenceIndex / TOTAL_SENTENCES) * 100;
    progressBar.style.width = progressPercentage + "%";
    progressText.textContent = `Sentence ${currentSentenceIndex} of ${TOTAL_SENTENCES}`;
  }

  function processSentenceCompletion() {
    const typedText = textInput.value.trim();
    const currentTargetSentence = sentences[currentSentenceIndex];

    const targetWords = currentTargetSentence
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const typedWords = typedText.split(/\s+/).filter((word) => word.length > 0);

    totalWordsInGame += targetWords.length;

    for (let i = 0; i < targetWords.length; i++) {
      if (i < typedWords.length && typedWords[i] === targetWords[i]) {
        totalCorrectWords++;
      }
    }

    currentSentenceIndex++;
    updateProgress();
    loadNextSentence();
  }

  function endGame() {
    textInput.disabled = true;
    textInput.value = ""; // Clear input field
    sentenceDisplay.textContent = "Game Over!";

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
    startGameBtn.style.display = "block"; // Show as "Play Again" or change text
    startGameBtn.textContent = "Play Again?";
    progressText.textContent = `Completed ${TOTAL_SENTENCES} sentences!`;
  }

  // --- Event Listeners ---
  startGameBtn.addEventListener("click", startGame);
  restartGameBtn.addEventListener("click", startGame); // restartGameBtn in results also calls startGame

  textInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !textInput.disabled) {
      event.preventDefault(); // Prevent default Enter behavior (like adding a new line)
      if (textInput.value.trim() !== "") {
        // Only process if there's some input
        processSentenceCompletion();
      }
    }
  });

  // Optional: Auto-submit if typed length matches sentence length (can be tricky with punctuation/spacing)
  // textInput.addEventListener('input', () => {
  //     if (!textInput.disabled && currentSentenceIndex < TOTAL_SENTENCES) {
  //         const typedText = textInput.value;
  //         const currentTargetSentence = sentences[currentSentenceIndex];
  //         if (typedText.length === currentTargetSentence.length) {
  //              // Potentially add a small delay or check if last char matches before auto-submitting
  //             if (typedText === currentTargetSentence) { // Strict match for auto-submit
  //                 processSentenceCompletion();
  //             }
  //         }
  //     }
  // });

  // Initialize
  progressText.textContent = `Sentence 0 of ${TOTAL_SENTENCES}`;
  sentenceDisplay.textContent = 'Press "Start Game" to begin.';
});
