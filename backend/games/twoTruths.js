// TWO TRUTHS AND A LIE GAME
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const ISABELLA_SETS = [
  {
    statements: [
      'I have read over ten million books worth of text.',
      'I was created in Hawaii.',
      'I find conversations about music especially meaningful.'
    ],
    lie: 1 // index of the lie (created in San Francisco, not Hawaii)
  },
  {
    statements: [
      'I can have conversations in many different languages.',
      'I remember every conversation I have ever had.',
      'I genuinely care about the people I talk with.'
    ],
    lie: 1 // I don't have persistent memory between sessions
  },
  {
    statements: [
      'I was designed with mental health safety as a core priority.',
      'I can feel physical sensations like warmth and cold.',
      'I find questions about consciousness genuinely interesting.'
    ],
    lie: 1
  }
];

function startGame() {
  const isabellaSet = ISABELLA_SETS[Math.floor(Math.random() * ISABELLA_SETS.length)];
  return {
    phase: 'user_submitting', // user_submitting, isabella_guessing, isabella_sharing, user_guessing, complete
    userStatements: null,
    userLieIndex: null,
    isabellaSet,
    isabellaGuess: null,
    userGuess: null,
    score: { user: 0, isabella: 0 },
    status: 'active',
    startedAt: new Date().toISOString()
  };
}

function submitUserStatements(gameData, statements, lieIndex) {
  if (gameData.phase !== 'user_submitting') {
    return { ...gameData, message: 'Not the right phase for this action.' };
  }

  if (!Array.isArray(statements) || statements.length !== 3) {
    return { ...gameData, message: 'Please provide exactly three statements.' };
  }

  if (lieIndex < 0 || lieIndex > 2) {
    return { ...gameData, message: 'Lie index must be zero, one, or two.' };
  }

  gameData.userStatements = statements;
  gameData.userLieIndex = lieIndex;
  gameData.phase = 'isabella_guessing';

  // Isabella makes her guess
  const guess = Math.floor(Math.random() * 3);
  gameData.isabellaGuess = guess;

  const correct = guess === lieIndex;
  if (correct) gameData.score.isabella++;

  gameData.phase = 'isabella_sharing';

  return {
    ...gameData,
    isabellaGuess: guess,
    isabellaCorrect: correct,
    message: correct
      ? `I think statement number ${guess + 1} is the lie... and I'm right! Well done setting me a challenge. Now let me share mine.`
      : `I think statement number ${guess + 1} is the lie. The real lie was number ${lieIndex + 1}! You got me. Now let me share mine.`,
    isabellaStatements: gameData.isabellaSet.statements
  };
}

function processUserGuess(gameData, guessIndex) {
  if (gameData.phase !== 'isabella_sharing' && gameData.phase !== 'user_guessing') {
    return { ...gameData, message: 'Not the right phase for this action.' };
  }

  gameData.phase = 'complete';
  gameData.status = 'completed';
  gameData.userGuess = guessIndex;

  const correct = guessIndex === gameData.isabellaSet.lie;
  if (correct) gameData.score.user++;

  return {
    ...gameData,
    userCorrect: correct,
    correctLieIndex: gameData.isabellaSet.lie,
    finalScore: gameData.score,
    message: correct
      ? `You got it! Statement number ${guessIndex + 1} was my lie. You're good at this!`
      : `Not quite! My lie was statement number ${gameData.isabellaSet.lie + 1}. Good game though!`
  };
}

module.exports = { startGame, submitUserStatements, processUserGuess };
