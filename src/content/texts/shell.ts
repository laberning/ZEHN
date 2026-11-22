// Start und Schale: Startseite, Lade-, Speicher- und Fehlerhinweise.

/** Startseite ohne Akten: Überschrift (Erzähler), ein Satz von Krümel, Absatz (Welt, Weg, Versprechen), drei Chips und der Zettel am F (kein Hinweis darauf, wer der Dieb ist) */
export const START_TEXTS = {
  headline: 'Jemand stiehlt die Buchstaben von Bad\u00a0Qwertz. Nachts.',
  /** Krümels Funk-Zeile unter der Überschrift (die Stimme des Spiels, ohne dass die Startseite zum Dialog wird) */
  kruemel: 'Piep. Der Zettel klebt noch. Der Dieb ist weg. Du bist da. Gutes Timing.',
  pitch:
    'Bad Qwertz hat eine Backstube, einen geheimen Keller und seit heute Nacht einen Buchstaben weniger. In sieben Akten lernst du neue Tasten und holst damit Buchstaben zurück: vom Dach, aus der U-Bahn, vom Turm, aus dem Tresor. Verglichen wirst du nur mit dir selbst, alles bleibt auf deinem Gerät.',
  /** keine Zeitangabe („5–10 Minuten am Tag“ klang nach Pflicht, Story-Regel 11) */
  chips: ['7 Akte, 1 Finale', 'alle Tasten, zehn Finger', 'ohne Konto, ohne Werbung'],
  /** Zettel am verschwundenen F: die Unterschrift des Diebs, wie auf seiner ersten Karte in Akt 1 */
  note: 'B. v. B.',
} as const;

/** Öffentliche Adresse des Repositorys (Hilfe lesen, Fehler melden); der Link im Spiel öffnet sie in einem neuen Tab */
export const REPO_URL = 'https://github.com/laberning/ZEHN';

/** Beschriftung des Links zum Repository (Startseite und Hauptquartier) */
export const HELP_LINK_LABEL = 'Hilfe & Feedback';

/** Warnung auf dem Startbildschirm, wenn gespeicherte Akten nicht lesbar sind */
export function brokenProfilesText(n: number): string {
  return n === 1 ? 'Eine gespeicherte Akte ließ sich nicht lesen und wird nicht angezeigt.' : `${n} gespeicherte Akten ließen sich nicht lesen und werden nicht angezeigt.`;
}

/** Hinweis, wenn Speichern fehlschlägt (das Spiel läuft weiter) */
export const SAVE_FAILED_TEXT =
  'Speichern hat gerade nicht geklappt. Dein Fortschritt ist noch da, bis du die Seite schließt – sichere zur Not die Akte als Datei (Agentenakte).';

/** Während die Spielstände geladen werden */
export const LOADING_TEXT = 'Verbindung zum Hauptquartier …';

/** Wenn die Spielstände nicht geladen werden können */
export const LOAD_ERROR_TEXTS = {
  title: 'Keine Verbindung zum Hauptquartier',
  text: 'Die Spielstände konnten nicht geladen werden. Lade die Seite neu. Hilft das nicht: Ist der Browser im privaten Modus oder ist der Speicher voll?',
} as const;
