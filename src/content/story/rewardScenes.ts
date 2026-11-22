// Akt-neutrale Übergaben von Belohnungen: Jede Belohnung überreicht dir eine Figur – nackte „Freigeschaltet!“-Meldungen gibt es nicht.
// Pakete von Herrn Kringel (Krümel zitiert ihn im Krümel-Chat), Gadgets der Spielhalle baut Krümel, zum Rang gratuliert Ada
// und Krümel überreicht ein Geschenk. Alle tragen `gift` (höchstens eines je Durchgang) und überreichen mit `gives`.
// Stillgelegte bleiben für alte Spielstände. Die Geschenke der Geschichte eines Akts stehen in dessen Ordner (akt1/rewards.ts).
// Vorrang bei `gift` = Reihenfolge von SCENES (content/story/acts.ts): erst die Szenen der Akte, dann diese hier.
// Szenen-IDs sind Speicherformat: nie umbenennen.

import type { StoryScene } from '../../domain/scenes.ts';
import { itemDescription } from '../items.ts';
import { ada, kr, wardrobeChoices } from './builders.ts';
import { RETIRED, RETIRED_7, packageScene, rankScene } from './rewardBuilders.ts';

/** Was Herr Kringel an der Tür sagt – jedes Mal etwas anderes (er weiß nichts von der ZEHN) */
const KRINGEL_SAYS: Record<string, string> = {
  tastsinn: 'Paket für {vorname}! Von … der Backstube? Ich bin doch IN der Backstube.',
  entschluesselt: 'Paket für {vorname}! Schon wieder von der Backstube. Seltsame Sachen backt die.',
  'serie-7': 'Eilpost für {vorname}! Ich bin extra schnell gelaufen. Also fast.',
  'uebungen-25': 'Paket für {vorname}! Es ist ganz leicht. Und es riecht nach Bügeleisen.',
  'tempo-60': "Paket für {vorname}! Die Briefmarke klebt schief. Ich war's nicht.",
  'sauber-100': 'Paket für {vorname}! Schwerer, als es aussieht. Ich hab es mit Stolz getragen.',
  'drei-sterne': 'Paket für {vorname}! Ich hab geklopft. Die Hintertür sagt immer „Piep“.',
  'sterne-12': 'Paket für {vorname}! Mit Schleife. Ich hab mich nicht getraut zu schnüffeln.',
  'erster-auftrag': 'Paket für {vorname}! Das erste von vielen, wette ich.',
  'tempo-100': 'Expresspaket für {vorname}! So schnell war ich noch nie. Fühlt sich gut an.',
  'null-fehler': 'Paket für {vorname}! Ich hab es ganz vorsichtig getragen. Null Kratzer.',
  ehrenkodex: 'Paket für {vorname}! Es kam durch die Hintertür. Seltsam, oder?',
};

/** Der fertige Agentenausweis (zeigt den aktuellen Rang) */
const ID_CARD = { object: { lessonId: 'm1-l2', at: 1 } };

const pkg = (badgeId: string, clothId: string) => packageScene(badgeId, KRINGEL_SAYS[badgeId]!, clothId);
/** Stillgelegtes Paket: Das Abzeichen bringt kein Teil mehr, wer es schon bekommen hat, behält es (Teil zurückgelegt für später) */
const retiredPkg = (badgeId: string, clothId: string, since = RETIRED, note?: string) => packageScene(badgeId, KRINGEL_SAYS[badgeId]!, clothId, since, { note });

export const REWARD_SCENES: readonly StoryScene[] = [
  // Reihenfolge = Vorrang hinter den Geschenken der Geschichte: 1. Ränge, 2. Pakete, 3. Gadgets der Spielhalle.

  // Rang-Aufstiege (nie für den ersten Rang)
  // Rangnamen über {rang_<key>}: „Anwärterin“ oder „Anwärter“ passend zum Profil
  rankScene('anwaerter', [ada('Beförderung! Ab heute bist du {rang_anwaerter}.'), kr('Ratter, ratter! Das kommt auf deinen Ausweis!')], 'colors-fresh'),
  rankScene(
    'agent',
    [ada('{rang_agent}! Jetzt auch dem Rang nach. Das ist eine Verantwortung. Und Croissants.'), kr('Ratter, ratter! Neuer Ausweis! Diesmal mit Hologramm. Fast.', ID_CARD)],
    'colors-neon',
  ),
  rankScene('spezialagent', [ada('{rang_spezialagent}. Das wollte ich schon immer mal sagen.'), kr('Der Drucker qualmt. Neuer Ausweis!', ID_CARD)], 'colors-autumn'),
  rankScene('geheimagent', [ada('{rang_geheimagent}. Kein Wort zu Juna.'), kr('Ratter, ratter! Neuer Ausweis. Streng geheim, also ohne Foto.')], 'spiked'),
  rankScene('meisterhacker', [ada('{rang_meisterhacker}. Ich bin stolz auf dich.'), kr('Der Drucker ist beleidigt, aber der Ausweis ist da!', ID_CARD)], 'curlylong'),
  // Kleidung per Paket
  pkg('tastsinn', 'cuffed'),
  pkg('entschluesselt', 'nerd'),
  // Nadelstreifen und Agentenlook haben mit Akt 4 neue Quellen (akt4/rewards.ts); die alten Meldungen behalten ihren Zettel
  retiredPkg('serie-7', 'striped', RETIRED_7),
  retiredPkg('uebungen-25', 'agent', RETIRED, '25 Übungen. Zeit für eine Krawatte.'),
  // Leggings und Faltstiefel haben mit Akt 3 neue Quellen (akt3/rewards.ts); die alten Meldungen behalten ihren Zettel
  retiredPkg('tempo-60', 'leggings', RETIRED, 'Für schnelle Agenten. Bewegungsfreiheit!'),
  retiredPkg('sauber-100', 'boots', RETIRED_7, 'Wer sauber tippt, hat saubere Stiefel.'),
  // Agentenstiefel haben mit Akt 7 eine neue Quelle (akt7/rewards.ts); die alte Meldung behält ihren Zettel
  retiredPkg('drei-sterne', 'agentboots', RETIRED_7, 'Drei Sterne, drei Mal. Das verdient Stiefel.'),
  // Sonnenbrille und Shorts haben mit Akt 2 neue Quellen (akt2/rewards.ts); die alten Meldungen behalten ihren Zettel
  retiredPkg('sterne-12', 'sun', RETIRED, 'Bei so vielen Sternen braucht man eine.'),
  retiredPkg('erster-auftrag', 'shorts', RETIRED, 'Der erste Auftrag ist geschafft. Bein frei!'),
  // Sandalen haben mit Akt 6 eine neue Quelle (akt6/rewards.ts); die alte Meldung behält ihren Zettel
  retiredPkg('tempo-100', 'sandals', RETIRED_7, 'Für die schnellsten Füße. Äh, Finger.'),
  // Bob und Strubbelig haben mit Akt 5 neue Quellen (akt5/rewards.ts); die alten Meldungen behalten ihren Zettel
  retiredPkg('null-fehler', 'bob', RETIRED_7, 'Null Fehler. Dazu passt eine Frisur ohne einen Haar zu viel.'),
  retiredPkg('ehrenkodex', 'messy', RETIRED_7, 'Hintertür und doch geschafft. Chaos steht dir.'),

  // Ada überreicht die Strickjacke selbst (zählt wie ein Paket)
  {
    id: 'badge-serie-3',
    chat: 'intern',
    trigger: { on: 'badge', badgeId: 'serie-3' },
    gives: ['cardigan'],
    gift: true,
    lines: [ada(itemDescription('cardigan')), kr('Die Strickjacke hängt schon im Kleiderschrank.', wardrobeChoices)],
  },
  // Krümel baut Spezial-Gadgets aus Spielhallen-Erfolgen
  {
    id: 'badge-spielhalle',
    chat: 'kruemel',
    trigger: { on: 'badge', badgeId: 'spielhalle' },
    gives: ['buchstabenkescher'],
    gift: true,
    lines: [
      kr('Aus deinen ersten Spielhallen-Punkten habe ich etwas gebaut: einen Buchstabenkescher!', { item: 'buchstabenkescher' }),
      kr('Damit fängst du Buchstaben, die herumfliegen. Kommt öfter vor, als man denkt.'),
      kr('So läuft das hier: Gadgets gibt es in der Geschichte und hier. Kleidung für Können und Rang.'),
      kr('Die Spielhalle bringt Ausrüstung für Extra-Fälle. Und jede Belohnung kommt persönlich.'),
    ],
  },
  {
    id: 'badge-tresorknacker',
    chat: 'kruemel',
    trigger: { on: 'badge', badgeId: 'tresorknacker' },
    gives: ['stethoskop'],
    gift: true,
    lines: [kr('Aus deinen Tresor-Punkten habe ich etwas gebaut: ein Stethoskop!', { item: 'stethoskop' }), kr(itemDescription('stethoskop'))],
  },
  {
    id: 'badge-regenmacher',
    chat: 'kruemel',
    trigger: { on: 'badge', badgeId: 'regenmacher' },
    gives: ['rotlicht-lampe'],
    gift: true,
    lines: [kr('Aus deinem Regen-Rekord habe ich eine Rotlicht-Lampe gebaut.', { item: 'rotlicht-lampe' }), kr(`${itemDescription('rotlicht-lampe')} Hab's probiert.`)],
  },
];
