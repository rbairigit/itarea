export function createTransliterator(config, target = config.defaultTarget) {
  if (!config.targets[target]) throw new Error(`Unsupported target: ${target}`);
  const tokens = { ...config.tokens, ...config.aliases, ...config.punctuation };
  const keys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const consonants = new Set(['k','kh','g','gh','~N','ch','Ch','j','jh','~n','T','Th','D','Dh','N','t','th','d','dh','n','p','ph','b','bh','m','y','r','l','v','w','sh','Sh','s','h','L']);
  const vowelMarks = { a: '', A: 'ा', aa: 'ा', i: 'ि', I: 'ी', ii: 'ी', ee: 'ी', u: 'ु', U: 'ू', uu: 'ू', e: 'े', ai: 'ै', o: 'ो', au: 'ौ', RRi: 'ृ', 'R^i': 'ृ', RRI: 'ॄ', 'R^I': 'ॄ', LLi: 'ॢ', 'L^i': 'ॢ', LLI: 'ॣ', 'L^I': 'ॣ' };
  const independentVowels = new Set(Object.keys(vowelMarks));

  return (input) => {
    let output = '', index = 0, pendingConsonant = false;
    while (index < input.length) {
      const key = keys.find(candidate => input.startsWith(candidate, index));
      if (!key) { output += input[index]; pendingConsonant = false; index += 1; continue; }
      const glyph = tokens[key];
      if (independentVowels.has(key) && pendingConsonant) output += vowelMarks[key];
      else { if (pendingConsonant && !independentVowels.has(key)) output += '्'; output += glyph; }
      pendingConsonant = consonants.has(key);
      if (key === '.h' || key === 'M' || key === 'H' || key === '.N') pendingConsonant = false;
      index += key.length;
    }
    return output;
  };
}
