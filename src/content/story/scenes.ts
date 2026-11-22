// Inhaltsversion der Story. Die Szenen selbst sammelt content/story/acts.ts aus den Akt-Bündeln.
// Szenen-IDs sind Speicherformat: nie umbenennen.

/**
 * Inhaltsversion. Steigt, sobald neue Szenen dazukommen, die bei bestehenden Spielständen nicht
 * nachträglich erscheinen sollen: Beim Laden gilt dann alles, was schon fällig wäre, als gelesen.
 * 1 = Platzhalter für Auftrag 1, 2 = alle Szenen von Akt 1, 3 = Meldungen zu Belohnungen und Rängen, 4 = Extra-Fälle,
 * 5 = Akt 1 geschärft (Echos, eigene Szene exam-after-foto), 6 = Garderobe: Kleidung und Farbpakete aus Geschichte und Rängen,
 * 7 = Belohnungsplan: sechs weitere Pakete stillgelegt (Akt 1 bringt höchstens neun freispielbare Dinge),
 * 8 = Akt 2 im Spiel (Nebenszenen, Belohnungen; nichts davon ist für bestehende Spielstände schon fällig, ein Briefing gilt erst
 * mit begonnenem Auftrag als fällig),
 * 9 = Akt 3 im Spiel (Nebenszenen, Belohnungen, Leggings und Faltstiefel mit neuen Quellen; Kopftuch, Grubenstiefel neu),
 * 10 = Akt 4 im Spiel (Nebenszenen, Belohnungen; Melone, Agentenlook und Nadelstreifen mit neuen Quellen; Krawatte, Fliege neu),
 * 11 = Akt 5 im Spiel (Nebenszenen, Belohnungen; Bob und Strubbelig mit neuen Quellen; Gürtel, Hosenträger, Farbpaket „Nacht“ neu),
 * 12 = Akt 6 im Spiel (Haupt-Szenen, Nebenszenen, Belohnungen; Sandalen mit neuer Quelle; Epauletten, Manschetten, Hohe Socken neu),
 * 13 = Akt 7 im Spiel (Haupt-Szenen, Nebenszenen, Belohnungen, Finale; Agentenstiefel mit neuer Quelle; Umhang, Dreispitz, Augenklappe, Farbpaket „Gold“ neu),
 * 14 = Training: Szenen nach Tippstunden-Runden, Abzeichen-Szene „Tippstunde“ und die fünf Fälle der Woche (content/story/training/).
 */
export const STORY_VERSION = 14;
