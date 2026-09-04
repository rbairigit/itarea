export function createTransliterator(config, target = config.defaultTarget) {
  const targetConfig = config.targets[target];
  if (!targetConfig) throw new Error(`Unsupported target: ${target}`);
  if (target === 'sanskrit-iast') {
    const tokens = config.iastTokens || {};
    const keys = Object.keys(tokens).sort((a, b) => b.length - a.length);
    return (input) => {
      let output = '', index = 0;
      while (index < input.length) {
        const key = keys.find(candidate => input.startsWith(candidate, index));
        if (!key) { output += input[index]; index += 1; continue; }
        output += tokens[key]; index += key.length;
      }
      return output;
    };
  }
  const tokens = { ...config.tokens, ...config.aliases, ...config.punctuation };
  const keys = Object.keys(tokens).sort((a, b) => b.length - a.length);
  const consonants = new Set(['k','kh','g','gh','~N','ch','Ch','j','jh','~n','T','Th','D','Dh','N','t','th','d','dh','n','p','ph','b','bh','m','y','r','l','v','w','sh','Sh','S','s','h','L','kSh','kS']);
  const vowelMarks = { a: '', A: 'ा', aa: 'ा', i: 'ि', I: 'ी', ii: 'ी', ee: 'ी', u: 'ु', U: 'ू', uu: 'ू', e: 'े', ai: 'ै', o: 'ो', au: 'ौ', RRi: 'ृ', 'R^i': 'ृ', RRI: 'ॄ', 'R^I': 'ॄ', LLi: 'ॢ', 'L^i': 'ॢ', LLI: 'ॣ', 'L^I': 'ॣ', ...(config.vowelMarks || {}) };
  const independentVowels = new Set(Object.keys(vowelMarks));

  const devanagari = (input) => {
    let output = '', index = 0, pendingConsonant = false;
    while (index < input.length) {
      const key = keys.find(candidate => input.startsWith(candidate, index));
        if (!key) {
          if (pendingConsonant) output += '्';
          output += input[index]; pendingConsonant = false; index += 1; continue;
        }
      const glyph = tokens[key];
      if (independentVowels.has(key) && pendingConsonant) output += vowelMarks[key];
      else { if (pendingConsonant && !independentVowels.has(key) && key !== '.N') output += '्'; output += glyph; }
      pendingConsonant = consonants.has(key);
      if (key === '.h' || key === 'M' || key === 'H' || key === '.N') pendingConsonant = false;
      index += key.length;
    }
    return pendingConsonant ? output + '्' : output;
  };
  if (targetConfig.transform === 'script-offset') {
    return (input) => [...devanagari(input)].map(char => {
      if (targetConfig.replacements?.[char]) return targetConfig.replacements[char];
      const code = char.codePointAt(0);
      return code >= 0x0900 && code <= 0x097f && code !== 0x0964 && code !== 0x0965
        ? String.fromCodePoint(code + targetConfig.offset) : char;
    }).join('');
  }
  if (targetConfig.transform === 'tamil') {
    const tamil = {
      'अ':'அ','आ':'ஆ','इ':'இ','ई':'ஈ','उ':'உ','ऊ':'ஊ','ऋ':'஋','ॠ':'௠','ऌ':'஌','ॡ':'௡','ए':'ஏ','ऐ':'ஐ','ओ':'ஓ','औ':'ஔ',
      'ा':'ா','ि':'ி','ी':'ீ','ु':'ு','ू':'ூ','ृ':'்ரு','ॄ':'்ரூ','ॢ':'்லு','ॣ':'்லூ','े':'ே','ै':'ை','ो':'ோ','ौ':'ௌ',
      'क':'க','ख':'க','ग':'க','घ':'க','ङ':'ங','च':'ச','छ':'ச','ज':'ஜ','झ':'ஜ','ञ':'ஞ','ट':'ட','ठ':'ட','ड':'ட','ढ':'ட','ण':'ண','त':'த','थ':'த','द':'த','ध':'த','न':'ந','प':'ப','फ':'ப','ब':'ப','भ':'ப','म':'ம','य':'ய','र':'ர','ल':'ல','व':'வ','ळ':'ள','श':'ஶ','ष':'ஷ','स':'ஸ','ह':'ஹ',
      'ं':'ம்','ः':'ஃ','ँ':'ம்','्':'்','ऽ':'ऽ','।':'।','॥':'॥','ॐ':'ௐ',
      '०':'௦','१':'௧','२':'௨','३':'௩','४':'௪','५':'௫','६':'௬','७':'௭','८':'௮','९':'௯'
    };
    return (input) => [...devanagari(input)].map(char => tamil[char] ?? char).join('');
  }
  return devanagari;
}
