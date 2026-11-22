// Das Training „Bennos Tippstunde“ als Bündel: Szenen nach Runden, Abzeichen-Szene, Fälle der Woche und ihre Szenen.
// Kein Akt (`ActContent`): kein Modul, kein Bilderbuch, keine Fallakte, kein Einsatz. Immer im Spiel; die Szenen werden erst
// nach Tippstunden-Runden fällig, die Fälle erst ab dem letzten Auftrag von Akt 7 (acts.ts reiht das Bündel hinter die Akte).
// Szenen-IDs tragen das Präfix `tr-`.
// Quelle der Texte: Drehbuch Training (liegt nicht im Repository).

import type { TrainingContent } from '../types.ts';
import { CASE_SCENES, CASES } from './cases.ts';
import { TRAINING_SCENES } from './scenes.ts';

export const TRAINING: TrainingContent = { scenes: TRAINING_SCENES, cases: CASES, caseScenes: CASE_SCENES };
