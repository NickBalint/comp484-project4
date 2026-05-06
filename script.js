const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
const originTextElement = document.querySelector("#origin-text p");
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const wpmDisplay = document.querySelector("#wpm");
const errorsDisplay = document.querySelector("#errors");
const scoresList = document.querySelector("#scores-list");

const paragraphBank = [
	"Typing with care is more important than typing with speed. Accuracy creates confidence, and confidence helps your speed grow naturally over time.",
	"Small, steady habits make a big difference in skill building. Practice for a few focused minutes each day and celebrate gradual improvement.",
	"A clear plan helps you solve problems faster. Break large tasks into simple steps, test often, and update your approach when needed.",
	"Good interfaces guide people without making them think too hard. Clear labels, useful feedback, and predictable behavior create trust.",
	"Learning to program is a long journey made of short victories. Keep asking questions, keep experimenting, and keep building things you care about.",
	"When pressure rises, pause for a breath and return to the basics. Calm attention usually beats rushed effort in both coding and typing."
];

const SCORE_STORAGE_KEY = "typingTopScores";

// Timer state uses [minutes, seconds, hundredths].
let timer = [0, 0, 0];
let interval;
let timerRunning = false;

// Tracks mistakes for the current run only.
let errorCount = 0;
let hasActiveMismatch = false;

// Updated whenever a new random paragraph is selected.
let activeOriginText = "";


// Add leading zero to numbers 9 or below (purely for aesthetics):
function leadingZero(time) {
	// PRESENTATION: Keeps clock values two digits (e.g., 7 -> 07).
	if (time <= 9) {
		return "0" + time;
	}

	return time;
}


// Run a standard minute/second/hundredths timer:
function runTimer() {
	// Display time first, then increment so the UI starts at 00:00:00.
	let currentTime =
		leadingZero(timer[0]) + ":" +
		leadingZero(timer[1]) + ":" +
		leadingZero(timer[2]);

	theTimer.textContent = currentTime;

	timer[2]++;

	if (timer[2] === 100) {
		timer[2] = 0;
		timer[1]++;
	}

	if (timer[1] === 60) {
		timer[1] = 0;
		timer[0]++;
	}
}

function totalSeconds() {
	return (timer[0] * 60) + timer[1] + (timer[2] / 100);
}

function calculateWpm(characterCount) {
	const seconds = totalSeconds();

	if (seconds <= 0 || characterCount <= 0) {
		return 0;
	}

	// PRESENTATION: WPM formula is ((characters / 5) / seconds) * 60.
	// Divide by 5 to estimate words, then scale seconds to per-minute speed.
	// Standard WPM formula: (characters / 5) / (seconds / 60).
	return Math.round(((characterCount / 5) / seconds) * 60);
}

function formatTimeFromHundredths(totalHundredths) {
	const minutes = Math.floor(totalHundredths / 6000);
	const seconds = Math.floor((totalHundredths % 6000) / 100);
	const hundredths = totalHundredths % 100;

	return (
		leadingZero(minutes) + ":" +
		leadingZero(seconds) + ":" +
		leadingZero(hundredths)
	);
}

function timeToHundredths() {
	return (timer[0] * 6000) + (timer[1] * 100) + timer[2];
}

function getSavedScores() {
	const raw = localStorage.getItem(SCORE_STORAGE_KEY);

	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);

		if (!Array.isArray(parsed)) {
			return [];
		}

		// Keep only valid score objects in case storage has old/invalid data.
		return parsed.filter((entry) =>
			typeof entry.timeHundredths === "number" && typeof entry.wpm === "number"
		);
	} catch (error) {
		return [];
	}
}

function saveScores(scores) {
	localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
}

function renderScores() {
	const scores = getSavedScores();
	scoresList.innerHTML = "";

	if (scores.length === 0) {
		const placeholder = document.createElement("li");
		placeholder.textContent = "No scores yet.";
		scoresList.appendChild(placeholder);
		return;
	}

	scores.forEach((score) => {
		const li = document.createElement("li");
		li.textContent =
			formatTimeFromHundredths(score.timeHundredths) + " (" + score.wpm + " WPM)";
		scoresList.appendChild(li);
	});
}

function recordScore() {
	const scores = getSavedScores();
	const score = {
		timeHundredths: timeToHundredths(),
		wpm: calculateWpm(activeOriginText.length)
	};

	scores.push(score);
	scores.sort((a, b) => a.timeHundredths - b.timeHundredths);
	// Fastest three times are persisted for the leaderboard.
	const topThree = scores.slice(0, 3);
	saveScores(topThree);
	renderScores();
}

function chooseRandomParagraph() {
	// Randomized prompt keeps each run different.
	const index = Math.floor(Math.random() * paragraphBank.length);
	activeOriginText = paragraphBank[index];
	originTextElement.textContent = activeOriginText;
}


// Match the text entered with the provided text on the page:
function spellCheck() {
	const textEntered = testArea.value;
	const textMatch = activeOriginText.substring(0, textEntered.length);

	wpmDisplay.textContent = String(calculateWpm(textEntered.length));

	if (textEntered === activeOriginText) {
		clearInterval(interval);
		timerRunning = false;
		// Green means the user completed the text exactly.
		testWrapper.style.borderColor = "#429890";
		recordScore();
	} else if (textEntered === textMatch) {
		// Blue means current input is correct so far.
		testWrapper.style.borderColor = "#65ccf3";
		hasActiveMismatch = false;
	} else {
		// Orange means a typo exists in the current input.
		testWrapper.style.borderColor = "#E95D0F";

		// Count one error per mismatch streak (not every key press).
		if (!hasActiveMismatch) {
			errorCount++;
			errorsDisplay.textContent = String(errorCount);
			hasActiveMismatch = true;
		}
	}
}


// Start the timer:
function start() {
	const textEnteredLength = testArea.value.length;

	if (textEnteredLength === 0 && !timerRunning) {
		timerRunning = true;
		interval = setInterval(runTimer, 10);
	}
}


// Reset everything:
function reset() {
	clearInterval(interval);
	interval = null;
	timer = [0, 0, 0];
	timerRunning = false;
	errorCount = 0;
	hasActiveMismatch = false;

	testArea.value = "";
	theTimer.textContent = "00:00:00";
	wpmDisplay.textContent = "0";
	errorsDisplay.textContent = "0";
	// Grey is the neutral state before typing starts.
	testWrapper.style.borderColor = "grey";

	chooseRandomParagraph();
}


// Event listeners for keyboard input and the reset button:
testArea.addEventListener("keypress", start, false);
testArea.addEventListener("keyup", spellCheck, false);
resetButton.addEventListener("click", reset, false);

renderScores();
reset();
