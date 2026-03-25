// WORD ASSOCIATION GAME
// Isabella Community Edition — Open Source
// Vaultagon Industries

'use strict';

const STARTER_WORDS = [
  'sunshine', 'ocean', 'mountain', 'dream', 'forest',
  'music', 'river', 'cloud', 'garden', 'fire',
  'journey', 'mirror', 'shadow', 'lighthouse', 'bridge'
];

const WORD_CHAINS = {
  sunshine: ['warm', 'bright', 'happy', 'yellow', 'summer'],
  ocean: ['waves', 'deep', 'blue', 'salt', 'vast'],
  mountain: ['tall', 'cold', 'climb', 'peak', 'snow'],
  dream: ['sleep', 'hope', 'vision', 'night', 'wish'],
  music: ['rhythm', 'melody', 'dance', 'sound', 'harmony']
};

function startGame() {
  const starterWord = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
  return {
    currentWord: starterWord,
    chain: [starterWord],
    round: 1,
    maxRounds: 20,
    status: 'active',
    score: 0,
    startedAt: new Date().toISOString(),
    isabellasTurn: false
  };
}

function processUserWord(gameData, userWord) {
  if (gameData.status !== 'active') {
    return { ...gameData, message: 'Game is not active.' };
  }

  const word = userWord.toLowerCase().trim();

  if (!word || word.includes(' ')) {
    return { ...gameData, message: 'Please respond with a single word.' };
  }

  if (gameData.chain.includes(word)) {
    gameData.status = 'ended';
    return {
      ...gameData,
      message: `That word was already used! Game over. You made it ${gameData.round} rounds with a score of ${gameData.score}.`
    };
  }

  gameData.chain.push(word);
  gameData.score++;
  gameData.currentWord = word;

  if (gameData.round >= gameData.maxRounds) {
    gameData.status = 'completed';
    return {
      ...gameData,
      message: `Amazing! You completed all twenty rounds! Final score: ${gameData.score}.`
    };
  }

  // Isabella's response word
  const isabellaWord = getIsabellaWord(word, gameData.chain);
  gameData.chain.push(isabellaWord);
  gameData.currentWord = isabellaWord;
  gameData.round++;

  return {
    ...gameData,
    isabellaWord,
    message: `${isabellaWord}`,
    roundsLeft: gameData.maxRounds - gameData.round
  };
}

function getIsabellaWord(word, chain) {
  const associations = {
    warm: 'cozy', bright: 'star', happy: 'laugh', yellow: 'sunflower',
    waves: 'surf', deep: 'dive', blue: 'sky', salt: 'sea',
    tall: 'tree', cold: 'winter', climb: 'reach', peak: 'summit',
    sleep: 'rest', hope: 'future', night: 'stars', wish: 'candle',
    rhythm: 'beat', melody: 'sing', dance: 'move', sound: 'echo'
  };

  if (associations[word] && !chain.includes(associations[word])) {
    return associations[word];
  }

  // Fallback word generation
  const fallbacks = ['light', 'breath', 'path', 'wind', 'river', 'stone', 'heart', 'voice'];
  const available = fallbacks.filter(w => !chain.includes(w));
  return available.length > 0 ? available[0] : 'peace';
}

module.exports = { startGame, processUserWord };
