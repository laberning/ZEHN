// Teaser der Startseite: die Grundreihe, das F verschwindet, am Platz klebt der Zettel des Diebs.
// Reine Dekoration (Text steht darunter); bei reduzierter Bewegung steht das F still als leere Kappe.

import { START_TEXTS } from '../../content/texts/shell.ts';

const LEFT = ['A', 'S', 'D', 'F'];
const RIGHT = ['J', 'K', 'L', 'Ö'];
const GONE = 'F';

function Cap({ letter }: { letter: string }) {
  const gone = letter === GONE;
  return (
    <div className={gone ? 'start-key gone' : 'start-key'}>
      {letter}
      {gone && <span className="start-note">{START_TEXTS.note}</span>}
    </div>
  );
}

export function StartTeaser() {
  return (
    <div className="start-keys" aria-hidden="true">
      {LEFT.map((k) => (
        <Cap key={k} letter={k} />
      ))}
      <div className="start-gap" />
      {RIGHT.map((k) => (
        <Cap key={k} letter={k} />
      ))}
    </div>
  );
}
