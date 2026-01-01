export const validator = (value, words) => {
  const sanitizedVal = value.trim();
  const splittedVal = sanitizedVal.split(' ').filter((word) => word !== '');

  // Check if the word count matches the exact limit
  const isValid = splittedVal.length < words;

  // Calculate remainingWords irrespective of the isValid value
  const remainingWords = words - splittedVal.length;

  return {
    isValid: !isValid,
    remainingWords: remainingWords,
  };
};

export const validateWordCount = (text, wordLimits) => {
  const trimmedText = text?.trim();
  const wordCount = trimmedText?.split(/\s+/).filter(Boolean).length ?? 0;

  const { min, max } = wordLimits;
  if (!trimmedText) {
    return {
      isValid: min === 0,
      wordCount: 0,
      remainingToMin: min > 0 ? min : 0,
    };
  }

  if (wordCount < min) {
    return { isValid: false, wordCount, remainingToMin: min - wordCount };
  } else if (max && wordCount > max) {
    return { isValid: false, wordCount, overByMax: wordCount - max };
  }
  return { isValid: true, wordCount };
};
