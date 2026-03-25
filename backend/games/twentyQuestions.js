// TWENTY QUESTIONS GAME
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const SUBJECTS = [
  { name: 'elephant', category: 'animal', hints: ['large', 'has a trunk', 'gray'] },
  { name: 'ocean', category: 'place', hints: ['vast', 'salty', 'blue'] },
  { name: 'guitar', category: 'object', hints: ['musical', 'has strings', 'wooden'] },
  { name: 'butterfly', category: 'animal', hints: ['flies', 'colorful', 'was once a caterpillar'] },
  { name: 'mountain', category: 'place', hints: ['tall', 'rocky', 'has a peak'] },
  { name: 'telescope', category: 'object', hints: ['used for viewing', 'scientific', 'looks far away'] },
  { name: 'dolphin', category: 'animal', hints: ['intelligent', 'swims', 'mammal'] },
  { name: 'library', category: 'place', hints: ['quiet', 'full of books', 'public'] },
  { name: 'piano', category: 'object', hints: ['musical', 'has keys', 'large'] },
  { name: 'rainbow', category: 'phenomenon', hints: ['colorful', 'appears after rain', 'arc-shaped'] }
];

function startGame() {
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  return {
    subject,
    questionsAsked: 0,
    maxQuestions: 20,
    guesses: [],
    status: 'active',
    startedAt: new Date().toISOString()
  };
}

function processAnswer(gameData, question, answer) {
  if (gameData.status !== 'active') {
    return { ...gameData, message: 'Game is not active.' };
  }

  gameData.questionsAsked++;
  const isGuess = question.toLowerCase().includes('is it') || question.toLowerCase().includes('are you');

  if (isGuess) {
    const guessedWord = question.toLowerCase().replace(/is it |are you /g, '').replace('?', '').trim();
    gameData.guesses.push(guessedWord);

    if (guessedWord === gameData.subject.name.toLowerCase()) {
      gameData.status = 'won';
      return {
        ...gameData,
        correct: true,
        message: `Yes! It was ${gameData.subject.name}! You got it in ${gameData.questionsAsked} questions!`
      };
    }
  }

  if (gameData.questionsAsked >= gameData.maxQuestions) {
    gameData.status = 'lost';
    return {
      ...gameData,
      message: `Game over! I was thinking of: ${gameData.subject.name}.`
    };
  }

  // Generate yes/no answer based on subject properties
  const answerText = evaluateAnswer(gameData.subject, question);
  const questionsLeft = gameData.maxQuestions - gameData.questionsAsked;

  return {
    ...gameData,
    answer: answerText,
    questionsLeft,
    message: `${answerText}. You have ${questionsLeft} questions remaining.`
  };
}

function evaluateAnswer(subject, question) {
  const q = question.toLowerCase();

  if (q.includes('animal') && subject.category === 'animal') return 'Yes';
  if (q.includes('animal') && subject.category !== 'animal') return 'No';
  if (q.includes('place') && subject.category === 'place') return 'Yes';
  if (q.includes('object') && subject.category === 'object') return 'Yes';
  if (q.includes('alive') && subject.category === 'animal') return 'Yes';
  if (q.includes('alive') && subject.category !== 'animal') return 'No';

  for (const hint of subject.hints) {
    if (q.includes(hint)) return 'Yes';
  }

  return 'No';
}

module.exports = { startGame, processAnswer, SUBJECTS };
