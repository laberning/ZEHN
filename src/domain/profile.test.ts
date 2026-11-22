import { describe, expect, it } from 'vitest';
import { codenameMatches } from './profile.ts';

describe('codenameMatches', () => {
  it('Groß-/Kleinschreibung und Leerzeichen am Rand zählen nicht', () => {
    expect(codenameMatches('Wolke Sieben', 'Wolke Sieben')).toBe(true);
    expect(codenameMatches('  wolke sieben ', 'Wolke Sieben')).toBe(true);
    expect(codenameMatches('WOLKE SIEBEN', ' Wolke Sieben')).toBe(true);
  });
  it('Zeichen im Inneren und ein anderer Name zählen', () => {
    expect(codenameMatches('Wolke  Sieben', 'Wolke Sieben')).toBe(false);
    expect(codenameMatches('Wolke', 'Wolke Sieben')).toBe(false);
    expect(codenameMatches('', 'Wolke')).toBe(false);
  });
});
