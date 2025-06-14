/**
 * Normalizes a name by:
 * 1. Converting to lowercase
 * 2. Removing accents
 * 3. Removing special characters
 * 4. Removing extra spaces
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates the Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Levenshtein distance
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates the similarity between two names
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} Similarity score (0-1)
 */
function calculateNameSimilarity(name1, name2) {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);
  
  if (!normalized1 || !normalized2) return 0;
  if (normalized1 === normalized2) return 1;

  const maxLength = Math.max(normalized1.length, normalized2.length);
  const distance = levenshteinDistance(normalized1, normalized2);
  
  return 1 - (distance / maxLength);
}

/**
 * Finds the best match for a name in a list of names
 * @param {string} targetName - Name to match
 * @param {Array<string>} nameList - List of names to search in
 * @param {number} threshold - Minimum similarity threshold (0-1)
 * @returns {Object|null} Best match with similarity score, or null if no match found
 */
function findBestNameMatch(targetName, nameList, threshold = 0.8) {
  let bestMatch = null;
  let bestScore = 0;

  for (const name of nameList) {
    const score = calculateNameSimilarity(targetName, name);
    if (score > bestScore && score >= threshold) {
      bestScore = score;
      bestMatch = { name, score };
    }
  }

  return bestMatch;
}

module.exports = {
  normalizeName,
  levenshteinDistance,
  calculateNameSimilarity,
  findBestNameMatch
}; 