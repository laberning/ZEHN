// Spielende (Finale) und Bennos Tippstunde.

/**
 * Das Spielende (Bildschirm `ende`). Ohne Namen, ohne Druck, ohne Wartezeit (Story-Regel 11).
 * `story`: Krümel und Ada sprechen in der Geschichte; alles andere spricht außerhalb der Geschichte.
 */
export const STORY_END_TEXTS = {
  headline: 'Die Geschichte ist zu Ende. Deine Finger nicht.',
  story: [
    { speaker: 'kruemel', text: 'Piep! Der Fall ist gelöst. Alle Buchstaben zu Hause, alle Zeichen, alle Zahlen. Und das O hängt.' },
    { speaker: 'ada', text: 'Das habt ihr gut gemacht. Jetzt backe ich. Tagsüber. Und Bennos Tippstunde fängt jetzt an. Im HQ.' },
  ],
  outside: 'Die Geschichte von Bad Qwertz ist hier zu Ende. Üben geht weiter: Aufträge wiederholen, Spielhalle, Extra-Fälle, Garderobe und Bennos Tippstunde.',
  doTitle: 'Das kannst du weiter tun:',
  todo: ['Aufträge wiederholen und deine Sterne verbessern', 'in Krümels Spielhalle spielen', 'Extra-Fälle lösen', 'in der Garderobe etwas Neues anziehen'],
  backdoor: 'Tipp: Den Einsatz kannst du noch richtig schaffen. Du darfst ihn jederzeit im Hauptquartier wiederholen.',
  button: 'Zurück ins Hauptquartier',
} as const;

/** Nach dem Finale: die Karte im HQ unter dem letzten Akt startet Bennos Tippstunde; darunter der Link zum Spielende */
export const TRAINING_CARD = {
  title: 'Bennos Tippstunde',
  hint: 'Alle Tasten, deine Schwächen, Sätze aus der Geschichte. So oft du willst.',
  /** Überschrift über dem Tipptext */
  frame: 'Bennos Tippstunde',
  link: 'Das Ende noch einmal lesen',
  /** Nachbesprechung */
  debriefTitle: 'Tippstunde beendet',
  again: 'Noch eine Runde ⏎',
  home: 'Zum HQ',
} as const;
