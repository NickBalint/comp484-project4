## Live Site
[View the live site here](https://nickbalint.github.io/comp484-project4/)

## Presentation Cheat Sheet

### 30-Second Overview
This app is a timed typing test that starts timing on first keypress, checks accuracy in real time, gives visual border feedback, tracks live WPM and errors, randomizes prompts, and saves the top 3 fastest scores in local storage.

### What to Say for Each Requirement

#### 1) Timer and Core Logic
- The timer format is `MM:SS:HH` (minutes, seconds, hundredths).
- It starts only when the user begins typing.
- It stops only when the full text matches exactly.

#### 2) Real-Time Input Validation
- Every keyup compares typed text to the matching substring of the target paragraph.
- This lets the app detect mistakes immediately instead of waiting until the end.

#### 3) Border Color Feedback
- `Grey` = neutral/reset state.
- `Blue` = typing is correct so far.
- `Orange` = typo currently exists.
- `Green` = completed successfully.

#### 4) Random Paragraphs
- The app uses a paragraph bank (6 paragraphs).
- On each Start Over, it selects one random paragraph and injects it into the prompt area.

#### 5) Live Metrics
- WPM is updated live using:
	- `(Total Characters / 5) / (Total Seconds / 60)`
- Errors count how many mismatch streaks happened during the run.

#### 6) Top 3 Fastest Scores (Persistence)
- On completion, the app stores the time + WPM in `localStorage`.
- Scores are sorted by fastest time and only the top 3 are kept.
- They remain visible even after page refresh.

### Demo Flow (Suggested)
1. Press keys and show timer starts.
2. Type correctly to show blue border.
3. Make a typo to show orange border and error increment.
4. Finish text to show green border and saved score.
5. Click Start Over to show reset + random new paragraph.
6. Refresh page to show top scores persist.
