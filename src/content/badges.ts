// Abzeichen. `check` bekommt den Spielstand NACH dem Ereignis (siehe domain/badges.ts).

import type { BadgeRule } from '../domain/badges.ts';
import type { Profile } from '../domain/profile.ts';

const lessonMastered = (id: string) => (p: Profile) => p.lessons[id]?.mastered === true;
/** Abzeichen zum Abschluss eines Auftrags: Bedingung und Anzeige („am Ende dieses Auftrags“) aus derselben ID */
const forLesson = (id: string) => ({ lessonId: id, check: lessonMastered(id) });

export const BADGES: readonly BadgeRule[] = [
  {
    id: 'erster-auftrag', title: 'Erster Auftrag', icon: '01', category: 'fortschritt',
    description: 'Die erste Übung abgeschlossen.',
    check: (p) => p.history.length >= 1,
  },
  {
    id: 'tastsinn', title: 'Tastsinn', icon: 'FJ', category: 'fortschritt',
    description: 'F und J sitzen – die Geheimzeichen der Agenten.',
    ...forLesson('m1-l1'),
  },
  {
    id: 'entschluesselt', title: 'Entschlüsselt', icon: '♛', category: 'fortschritt',
    description: 'Eine geheime Botschaft bis zum Ende entschlüsselt.',
    ...forLesson('m1-l4'),
  },
  {
    id: 'grundreihe', title: 'Grundreihe gesichert', icon: 'ASDF', category: 'fortschritt',
    description: 'Den ersten Einsatz bestanden.',
    check: (p) => p.exams.m1?.outcome === 'passed',
  },
  {
    id: 'obere-reihe', title: 'Obere Reihe gesichert', icon: 'QWER', category: 'fortschritt',
    description: 'Den zweiten Einsatz bestanden.',
    check: (p) => p.exams.m2?.outcome === 'passed',
  },
  {
    id: 'untere-reihe', title: 'Untere Reihe gesichert', icon: 'YXCV', category: 'fortschritt',
    description: 'Den dritten Einsatz bestanden.',
    check: (p) => p.exams.m3?.outcome === 'passed',
  },
  {
    id: 'grossschreibung', title: 'Großschreibung gesichert', icon: 'ÄÖÜ', category: 'fortschritt',
    description: 'Den vierten Einsatz bestanden.',
    check: (p) => p.exams.m4?.outcome === 'passed',
  },
  {
    id: 'satzzeichen', title: 'Satzzeichen gesichert', icon: '?!', category: 'fortschritt',
    description: 'Den fünften Einsatz bestanden.',
    check: (p) => p.exams.m5?.outcome === 'passed',
  },
  {
    id: 'zahlen', title: 'Zahlen gesichert', icon: '1-0', category: 'fortschritt',
    description: 'Den sechsten Einsatz bestanden.',
    check: (p) => p.exams.m6?.outcome === 'passed',
  },
  {
    id: 'sonderzeichen', title: 'Sonderzeichen gesichert', icon: '@{}', category: 'fortschritt',
    description: 'Den siebten Einsatz bestanden.',
    check: (p) => p.exams.m7?.outcome === 'passed',
  },
  {
    id: 'sauber-100', title: 'Saubere Arbeit', icon: '100', category: 'praezision',
    description: 'Eine Übung mit mindestens 100 Zeichen ohne einen einzigen Fehler.',
    check: (_p, e) => !!e.result && e.result.errors === 0 && e.result.length >= 100,
  },
  {
    id: 'drei-sterne', title: 'Sternstunde', icon: '★★★', category: 'praezision',
    description: 'In drei verschiedenen Aufträgen drei Sterne geholt.',
    check: (p) => Object.values(p.lessons).filter((l) => l.bestStars === 3).length >= 3,
  },
  {
    id: 'sterne-12', title: 'Sternensammler', icon: '12★', category: 'praezision',
    description: '12 Sterne in den Aufträgen gesammelt (beste Wertung je Auftrag).',
    check: (p) => Object.values(p.lessons).reduce((s, l) => s + l.bestStars, 0) >= 12,
  },
  {
    id: 'tempo-60', title: 'Flinke Finger', icon: '60', category: 'praezision',
    description: '60 Anschläge pro Minute in einer Übung.',
    check: (_p, e) => (e.result?.apm ?? 0) >= 60 && (e.result?.accuracy ?? 0) >= 0.9,
  },
  {
    id: 'tempo-100', title: 'Blitzfinger', icon: '100!', category: 'praezision',
    description: '100 Anschläge pro Minute in einer Übung.',
    check: (_p, e) => (e.result?.apm ?? 0) >= 100 && (e.result?.accuracy ?? 0) >= 0.9,
  },
  {
    // ID von früher, als es eine Serie war (steht in Spielständen)
    id: 'serie-3', title: 'Dranbleiber', icon: 'III', category: 'ausdauer',
    description: 'An 3 Tagen trainiert.',
    check: (p) => p.days.count >= 3,
  },
  {
    id: 'serie-7', title: 'Wochenagent', icon: 'VII', category: 'ausdauer',
    description: 'An 7 Tagen trainiert.',
    check: (p) => p.days.count >= 7,
  },
  {
    id: 'uebungen-25', title: 'Fleißig', icon: '25', category: 'ausdauer',
    description: '25 Übungen absolviert.',
    check: (p) => p.history.length >= 25,
  },
  {
    id: 'tippstunde', title: 'Tippstunde', icon: '∞', category: 'ausdauer', secret: true,
    description: 'Zehn Runden in Bennos Tippstunde.',
    check: (p) => p.history.filter((e) => e.kind === 'tippstunde').length >= 10,
  },
  {
    id: 'spielhalle', title: 'Spielkind', icon: '▶', category: 'ausdauer',
    description: 'Zum ersten Mal in Krümels Spielhalle gespielt.',
    check: (_p, e) => e.kind === 'arcade',
  },
  {
    id: 'regenmacher', title: 'Regenmacher', icon: '↓↓', category: 'praezision',
    description: '150 Punkte im Buchstabenregen.',
    check: (_p, e) => e.arcade?.game === 'regen' && e.arcade.score >= 150,
  },
  {
    id: 'tresorknacker', title: 'Tresorknacker', icon: '◎', category: 'praezision',
    description: '15 Codes in einer Runde Tresorknacker geknackt.',
    check: (_p, e) => e.arcade?.game === 'tresor' && e.arcade.count >= 15,
  },
  {
    id: 'regen-gold', title: 'Regen-Meister', icon: '★', category: 'praezision',
    description: 'Gold im Buchstabenregen.',
    check: (_p, e) => e.arcade?.game === 'regen' && e.arcade.medal === 'gold',
  },
  {
    id: 'tresor-gold', title: 'Tresor-Meister', icon: '★', category: 'praezision',
    description: 'Gold im Tresorknacker.',
    check: (_p, e) => e.arcade?.game === 'tresor' && e.arcade.medal === 'gold',
  },
  {
    id: 'null-fehler', title: 'Null Fehler', icon: '0', category: 'geheim', secret: true,
    description: 'Einen Einsatz ohne einen einzigen Fehler bestanden.',
    check: (_p, e) => e.kind === 'exam' && !!e.examPassed && e.result?.errors === 0,
  },
  {
    id: 'ehrenkodex', title: 'Ehrenkodex', icon: '◆', category: 'geheim', secret: true,
    description: 'Durch die Hintertür gegangen – und den Einsatz später trotzdem bestanden.',
    check: (p, e) => e.kind === 'exam' && !!e.examPassed && p.exams[e.moduleId ?? '']?.usedBackdoor === true,
  },
];

