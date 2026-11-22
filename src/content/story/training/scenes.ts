// Die Szenen der Tippstunde: zehn feste Szenen nach Runden (Auslöser `training { round }`) und die Abzeichen-Szene „Tippstunde“.
// Sie kommen als Funk-Nachricht nach der Runde, nie als Geschenk. Ids tragen das Präfix `tr-` und sind Speicherformat.
// Quelle der Texte: Drehbuch Training (liegt nicht im Repository).

import type { StoryScene } from '../../../domain/scenes.ts';
import { ada, ben, jun, kr } from '../builders.ts';

export const TRAINING_SCENES: StoryScene[] = [
  {
    id: 'tr-round-1',
    chat: 'intern',
    trigger: { on: 'training', round: 1 },
    lines: [
      ben('Erste Stunde. Zwei Finger, beide haben F und J gefunden. Mehr war nicht. Mehr kommt.'),
      ada('Ich backe nebenan und höre zu. Es klingt nach Anfang. Das ist gut so.'),
      kr('Runde eins für dich, Stunde eins für Benno. Ich zähle beides. Getrennt. ⚡'),
    ],
  },
  {
    id: 'tr-round-2',
    chat: 'juna',
    trigger: { on: 'training', round: 2 },
    lines: [
      jun('ZEHN-FINGER-NEWS, Beitrag drei: {vorname} trainiert weiter. Ohne Fall, ohne Baron. Freiwillig. 😮'),
      jun('Pit will wissen, was du tippst. Ich: Sätze aus der Geschichte. Er: „Auch meine?“ Noch nicht, Pit.'),
    ],
  },
  {
    id: 'tr-round-3',
    chat: 'intern',
    trigger: { on: 'training', round: 3 },
    lines: [
      ben('Erster Satz aus der Grundstellung: „Zwei sind ein Anfang.“ Vier Fehler, alle stehen gelassen.'),
      ada('Der Satz passt. Die Fehler auch. Ich habe ihn damals auch nicht fehlerfrei gesagt.'),
      kr('Fehler, die stehen bleiben, sind ehrlich. Tippi nickt. (Sie hat vorher gefragt, ob sie darf.)'),
    ],
  },
  {
    id: 'tr-round-5',
    chat: 'kruemel',
    trigger: { on: 'training', round: 5 },
    lines: [
      kr('Fünf Runden ohne Auftrag, ohne Baron, ohne Haken. Nur du und die Tasten. Ich habe mitgezählt. ⚡'),
      kr('Benno übt, wenn du übst. Und wenn nicht, auch. Er sagt: Zwei Schüler, ein Takt. (Das ist der Trick.)'),
    ],
  },
  {
    id: 'tr-round-8',
    chat: 'intern',
    trigger: { on: 'training', round: 8 },
    lines: [
      ben('Erstes Wort mit zehn Fingern: „Kipferl“. Ringfinger und kleiner Finger haben protestiert. Ich auch.'),
      ada('Die beiden protestieren bei allen. Dann geben sie nach. Bei {vorname} haben sie auch nachgegeben.'),
      ben('Bei mir dauert es. Das ist in Ordnung. Ich habe Zeit. Und Kipferl.'),
    ],
  },
  {
    id: 'tr-round-12',
    chat: 'intern',
    trigger: { on: 'training', round: 12 },
    lines: [
      ben('Umschalttaste. Der kleine Finger hält, die andere Hand tippt. Ada zeigte es mir. Mit Mehl dran.'),
      ada('Großes T, großes B: „Tante“ und „Benno“. Beides richtig. Den Zettel habe ich aufgehoben.'),
      kr('Ich speichere beides. Den Zettel und das Mehl. (Das Mehl nur als Foto.)'),
    ],
  },
  {
    id: 'tr-round-16',
    chat: 'juna',
    trigger: { on: 'training', round: 16 },
    lines: [
      jun('PIT-UPDATE: Er tippt jetzt mit drei Fingern. Der dritte ist der Daumen, für die Leertaste. Stolz.'),
      jun('Er fragt, welcher Finger für das P ist. Ich: der rechte kleine. Er: „Der kann doch nichts.“ 😂'),
      jun('Ich hab gesagt: Frag {vorname}. Der kleine Finger kann das P. Und das Ö. Und das Fragezeichen.'),
    ],
  },
  {
    id: 'tr-round-20',
    chat: 'intern',
    trigger: { on: 'training', round: 20 },
    lines: [
      ben('Zahlen heute. Zeigefinger hoch und zurück auf F. Früher hatte ich Codes. Jetzt habe ich Finger.'),
      ada('Und ein Rezept mit Mengen: 200 Gramm Mehl, 2 Eigelb. Tipp es mir ab, dann glaube ich es.'),
      ben('Abgetippt. Bei den Zahlen kein Fehler. Bei „Vanille“ einer. Der bleibt stehen.'),
    ],
  },
  {
    id: 'tr-round-30',
    chat: 'intern',
    trigger: { on: 'training', round: 30 },
    lines: [
      ben('Zehn Finger. Alle. Langsam, aber alle. Ada hat die Backstube abgeschlossen, damit niemand stört.'),
      kr('Ich war dabei. Als Licht. Benno hat „Bad Qwertz, Kurort“ getippt. Mit großem K. Mit O. ⚡'),
      ada('Zwei waren ein Anfang. Zehn sind ein Satz. Danke, {vorname}. Das hat er dir zu verdanken. Und sich.'),
    ],
  },
  {
    id: 'tr-round-50',
    chat: 'intern',
    trigger: { on: 'training', round: 50 },
    lines: [
      jun('PIT HAT SEINEN ERSTEN SATZ GETIPPT. Mit allen Fingern, die er findet: „Ich bin bei der ZEHN.“ 🎉'),
      ben('Und ich habe das erste Rezept abgetippt. Zehn Finger, kein Fehler. Ada hat es trotzdem probiert.'),
      ada('Es war gut. Das Rezept und das Tippen. Zwei Schüler, und du. Mehr habe ich nicht zu sagen. Fast.'),
      kr('Fünfzig Runden. Die Tasten sind zu Hause, die Finger auch. Weiter geht es trotzdem. Piep. ⚡'),
    ],
  },
  {
    id: 'tr-badge-tippstunde',
    chat: 'kruemel',
    trigger: { on: 'badge', badgeId: 'tippstunde' },
    lines: [
      kr('Abzeichen „Tippstunde“: zehn Runden. Kein Paket diesmal, Kringel hat frei. Dafür ein Blitz. ⚡'),
      kr('Benno sagt, er hat auch zehn. Stunden, mit Mehl. Zählt auch. (Sagt Ada. Ada zählt alles.)'),
    ],
  },
];
