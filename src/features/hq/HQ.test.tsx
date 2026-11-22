import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { STORY } from '../../app/rules.ts';
import { findLesson } from '../../domain/course.ts';
import { dayKey } from '../../domain/days.ts';
import { logScenes, sceneFor } from '../../domain/scenes.ts';
import { DAY, mastered, masteredModule, profile, rewarded, storyLog, T0 } from '../../test/factories.ts';
import { REPO_URL } from '../../content/texts/shell.ts';
import { TRAINING_CARD } from '../../content/texts/ende.ts';
import { KRUEMEL_TIPS } from '../../content/texts/mission.ts';
import { renderApp } from '../../test/renderApp.tsx';

describe('Hauptquartier: Spielende', () => {
  const last = COURSE.modules.at(-1)!.id;

  it('vor dem letzten Einsatz gibt es die Karte der Tippstunde nicht', async () => {
    await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    expect(screen.queryByText(TRAINING_CARD.title)).toBeNull();
  });

  const finished = () => {
    const lessons = Object.assign({}, ...COURSE.modules.map((m) => masteredModule(COURSE, m.id)));
    return profile({ lessons, exams: { [last]: { attempts: 1, outcome: 'passed' } } });
  };

  it('nach dem Finale: Karte „Bennos Tippstunde“ mit Hinweis, ein Klick startet die Tippstunde mit allen Tasten', async () => {
    const app = await renderApp(undefined, { profiles: [finished()], select: 'p1' });
    expect(screen.queryByText(/Fortsetzung|vorerst|bald/)).toBeNull();
    expect(screen.getByText(TRAINING_CARD.hint)).toBeInTheDocument();
    await app.user.click(screen.getByRole('button', { name: new RegExp(TRAINING_CARD.title) }));
    const { screen: now } = app.store.getState();
    expect(now).toMatchObject({ name: 'mission', training: { kind: 'tippstunde', frame: TRAINING_CARD.frame } });
    expect(screen.getByText(new RegExp(TRAINING_CARD.frame))).toBeInTheDocument();
  });

  it('nach dem Finale: der Link unter der Karte öffnet das Ende', async () => {
    const app = await renderApp(undefined, { profiles: [finished()], select: 'p1' });
    await app.user.click(screen.getByRole('button', { name: TRAINING_CARD.link }));
    expect(app.store.getState().screen).toEqual({ name: 'ende' });
  });

  it('nach dem Finale: Enter startet die Tippstunde', async () => {
    const exams = Object.fromEntries(COURSE.modules.map((m) => [m.id, { attempts: 1, outcome: 'passed' as const }]));
    const app = await renderApp(undefined, { profiles: [{ ...finished(), exams }], select: 'p1' });
    await app.press('{Enter}');
    expect(app.store.getState().screen).toMatchObject({ name: 'mission', training: { kind: 'tippstunde' } });
  });
});

describe('Hauptquartier: übrige Nebenszenen', () => {
  it('eine kleine Zeile unter der Missionskarte des abgeschlossenen Akts, ohne Zahl; weg, wenn nichts übrig ist', async () => {
    const lessons = masteredModule(COURSE, 'm1');
    const p = profile({ lessons, exams: { m1: { attempts: 1, outcome: 'passed' } } });
    await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.getByText('Krümel hat noch Funksprüche aus Akt 1. Wiederhol einen Auftrag!')).toBeInTheDocument();
  });

  it('ohne gespielten Einsatz keine Zeile', async () => {
    await renderApp(undefined, { profiles: [profile({ lessons: masteredModule(COURSE, 'm1') })], select: 'p1' });
    expect(screen.queryByText(/Krümel hat noch Funksprüche/)).toBeNull();
  });

  it('keine Zeile, wenn alle Nebenszenen des Akts gesehen sind', async () => {
    const sides = STORY.scenes.filter((s) => s.trigger.on === 'side' && findLesson(COURSE, s.trigger.fromLesson).module.id === 'm1').map((s) => s.id);
    const p = logScenes(profile({ lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 1, outcome: 'passed' } } }), sides, 0);
    await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.queryByText(/Krümel hat noch Funksprüche/)).toBeNull();
  });
});

describe('Hauptquartier', () => {
  it('zeigt Aufträge, gesperrte Aufträge und die geschlossene Spielhalle', async () => {
    await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    expect(screen.getByRole('button', { name: /Kalibrierung/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Grundausbildung/ })).toBeDisabled();
    expect(screen.getByText(/Öffnet sich, sobald du deinen ersten Auftrag geschafft hast/)).toBeInTheDocument();
  });

  it('Spielhallen-Karte zeigt die beste Medaille je Spiel', async () => {
    const p = profile({ ...rewarded('spielhalle'), lessons: mastered('m1-l1'), arcade: { regen: { best: 120, plays: 3, bestLevel: 6, medal: 'silber' }, tresor: { best: 20, plays: 1, bestLevel: 0, medal: null } } });
    await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.getByRole('button', { name: /Buchstabenregen/ })).toHaveTextContent('Bestwert: 120 · ★ Silber');
    expect(screen.getByRole('button', { name: /Tresorknacker/ })).toHaveTextContent(/^Tresorknacker.*Bestwert: 20$/);
  });

  it('Paket von Kringel: „Funk: neu“, die Meldung im Krümel-Chat, „Zur Garderobe“, danach kein „Neu“ mehr', async () => {
    const base = profile({ badges: { tastsinn: 1 } });
    const p = { ...base, story: { ...base.story, log: [{ id: 'badge-tastsinn', t: 1 }] } };
    const app = await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.getByRole('button', { name: /Funk.*1 neu/ })).toBeInTheDocument();
    expect(screen.getByText('Neu 1')).toBeInTheDocument();
    await app.user.click(screen.getByRole('button', { name: /^Funk/ }));
    await app.user.click(screen.getByRole('button', { name: /Krümel.*1 neu/ }));
    await app.finishChat(1); // „Zur Garderobe“
    expect(screen.getByText(/Krempelhose/)).toBeInTheDocument();
    expect(screen.getByText(/Backstubenlook/)).toBeInTheDocument();
    await app.press('{Enter}');
    expect(screen.getByRole('heading', { name: /Garderobe/ })).toBeInTheDocument();
    expect(screen.getByText('Neu: Krempelhose')).toBeInTheDocument();
    // der Reiter mit dem neuen Teil trägt einen Punkt (für Screenreader: „Hose, neu“)
    await app.user.click(screen.getByRole('tab', { name: /^Hose\s*, neu$/ }));
    await app.user.click(screen.getByRole('button', { name: 'Krempelhose, neu' }));
    await app.press('{Enter}'); // Anziehen und zurück
    expect(app.store.getState().current?.avatar.pants).toBe('cuffed');
    expect(screen.queryByText('Neu 1')).toBeNull();
    expect(screen.queryByRole('button', { name: /Funk.*neu/ })).toBeNull();
  });

  it('neue Nachricht im Funk: Pling und Benachrichtigung mit Absender und Anfang; ein Klick öffnet den Chat', async () => {
    const base = profile({ badges: { tastsinn: 1 } });
    const p = { ...base, story: { ...base.story, log: [{ id: 'badge-tastsinn', t: 1 }] } };
    const app = await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(app.sound.played).toContain('message');
    const toast = screen.getByRole('button', { name: /Neue Nachricht · Krümel/ });
    expect(toast).toHaveTextContent(/Krümel:/);
    await app.user.click(toast);
    expect(app.store.getState().screen).toEqual({ name: 'funk', chat: 'kruemel' });
    // „Später lesen“ zurück ins HQ: die Benachrichtigung steht noch da, aber es pingt nicht noch einmal
    const before = app.sound.played.filter((s) => s === 'message').length;
    app.store.getState().go({ name: 'hq' });
    expect(await screen.findByRole('button', { name: /Neue Nachricht · Krümel/ })).toBeInTheDocument();
    expect(app.sound.played.filter((s) => s === 'message').length).toBe(before);
  });

  it('ohne Ungelesenes keine Benachrichtigung und kein Pling', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    expect(screen.queryByRole('button', { name: /Neue Nachricht/ })).toBeNull();
    expect(app.sound.played).not.toContain('message');
  });

  it('Agentenkoffer: Gadgets mit Beschreibung, fehlende als Umriss mit Hinweis auf die Herkunft', async () => {
    const p = profile(rewarded('spielhalle'));
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'wardrobe' } });
    await app.user.click(screen.getByRole('tab', { name: 'Koffer' }));
    expect(screen.getByText('Buchstabenkescher')).toBeInTheDocument();
    expect(screen.getByText(/Fängt Buchstaben/)).toBeInTheDocument();
    expect(screen.getByText('Kommt mit dem Abzeichen „Tresorknacker“')).toBeInTheDocument();
    expect(screen.getByText('Kommt zu Beginn von Auftrag 3')).toBeInTheDocument(); // Dechiffrierscheibe
    expect(screen.getByText('Kommt in Auftrag 5')).toBeInTheDocument(); // Beweisfach
    expect(screen.getAllByText('Gibt es in einem Extra-Fall')).toHaveLength(4); // Auftrag 3 ist noch nicht erreicht (inkl. Tunnel-Megafon aus Akt 3)
    expect(screen.queryByText('Stethoskop')).toBeNull();
  });

  it('Agentenkoffer: ab begonnenem Auftrag 3 nennt ein fehlendes Fall-Gadget seinen Fall', async () => {
    const p = profile({ ...rewarded('spielhalle'), lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'wardrobe' } });
    await app.user.click(screen.getByRole('tab', { name: 'Koffer' }));
    expect(screen.getByText('Belohnung im Extra-Fall „Kringels Briefkasten“')).toBeInTheDocument();
    expect(screen.getAllByText('Gibt es in einem Extra-Fall')).toHaveLength(2); // Junas Liste und die verschluckte Durchsage sind noch nicht dran
  });

  it('HQ: gesperrter Extra-Fall ist kein Knopf und zeigt den Weg zum Gadget', async () => {
    const p = profile({ ...rewarded('spielhalle'), lessons: mastered('m1-l1', 'm1-l2'), seen: ['briefing:m1-l3'] });
    await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.queryByRole('button', { name: /Kringels Briefkasten/ })).toBeNull();
    expect(screen.getByText(/Hol dafür das Abzeichen „Tresorknacker“/)).toBeInTheDocument();
    expect(screen.getByText('gesperrt')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seifenblasen-Brunnen/ })).toBeInTheDocument();
  });

  it('Enter startet den Einsatz, wenn alle Aufträge geschafft sind', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: masteredModule(COURSE, 'm1') })], select: 'p1' });
    await app.press('{Enter}');
    await screen.findByRole('dialog');
    expect(await app.dialogText()).toContain('Firewall');
  });

  it('nach dem Einsatz (auch durch die Hintertür) bietet das HQ die Fallakte an, mit „Neu“ bis zum ersten Öffnen', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 3, outcome: 'backdoor' } } })], select: 'p1' });
    expect(screen.queryByRole('button', { name: /Wie geht es weiter/ })).toBeNull();
    const button = screen.getByRole('button', { name: /Fallakte Akt 1/ });
    expect(button).toHaveTextContent('Neu');
    await app.user.click(button);
    expect(app.store.getState().screen).toEqual({ name: 'fallakte', moduleId: 'm1' });
    app.store.getState().go({ name: 'hq' });
    expect(await screen.findByRole('button', { name: 'Fallakte Akt 1' })).not.toHaveTextContent('Neu');
  });

  it('zerkratzte Fallakten: der Knopf heißt „Fallakte Akt 1 · zerkratzt“ statt „Neu“, danach wieder „Neu“', async () => {
    const story = { ...STORY, fallaktenDamage: [{ from: 'schaden', until: 'heil' }] };
    const base = { lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 1, outcome: 'passed' as const } } };
    const scratched = await renderApp(undefined, { profiles: [profile({ ...base, story: storyLog(['schaden'], { v: STORY.version }) })], select: 'p1', story });
    const button = screen.getByRole('button', { name: /Fallakte Akt 1/ });
    expect(button).toHaveTextContent('Fallakte Akt 1 · zerkratzt');
    expect(button).not.toHaveTextContent('Neu');
    scratched.unmount();
    await renderApp(undefined, { profiles: [profile({ ...base, story: storyLog(['schaden', 'heil'], { v: STORY.version }) })], select: 'p1', story });
    expect(screen.getByRole('button', { name: /Fallakte Akt 1/ })).toHaveTextContent('Neu');
    expect(screen.getByRole('button', { name: /Fallakte Akt 1/ })).not.toHaveTextContent('zerkratzt');
  });

  it('Akt 2 erscheint nach Akt 1: gesperrt bis zum Einsatz (dort steht der Einsatz an), danach ist Auftrag 1 dran und die Fallakte Akt 1 bleibt', async () => {
    const before = await renderApp(undefined, { profiles: [profile({ lessons: masteredModule(COURSE, 'm1') })], select: 'p1' });
    expect(screen.getByRole('heading', { name: /Akt 2 · Obere Reihe/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Funkpeilung/ })).toBeDisabled();
    before.unmount();

    const p = profile({ lessons: masteredModule(COURSE, 'm1'), exams: { m1: { attempts: 1, outcome: 'passed' } } });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.getByRole('button', { name: /Funkpeilung/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Fallakte Akt 1/ })).toBeInTheDocument();
    await app.user.click(screen.getByRole('button', { name: /Funkpeilung/ }));
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: ['a2-start'], then: { lessonId: 'm2-l1' } }); // erst die Anfangsszene von Akt 2
  });

  it('Akt 3 erscheint nach dem Einsatz von Akt 2; nach dem Einsatz von Akt 3 gibt es drei Fallakten', async () => {
    const twoActs = { ...masteredModule(COURSE, 'm1'), ...masteredModule(COURSE, 'm2') };
    const exams2 = { m1: { attempts: 1, outcome: 'passed' as const }, m2: { attempts: 1, outcome: 'passed' as const } };
    const before = await renderApp(undefined, { profiles: [profile({ lessons: twoActs, exams: exams2 })], select: 'p1' });
    expect(screen.getByRole('heading', { name: /Akt 3 · Untere Reihe/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nachtzug/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Fallakte Akt 3/ })).toBeNull();
    before.unmount();

    const lessons = { ...twoActs, ...masteredModule(COURSE, 'm3') };
    await renderApp(undefined, { profiles: [profile({ lessons, exams: { ...exams2, m3: { attempts: 1, outcome: 'passed' } } })], select: 'p1' });
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).toBeInTheDocument();
  });

  it('Akt 4 erscheint nach dem Einsatz von Akt 3; nach dem Einsatz von Akt 4 gibt es vier Fallakten', async () => {
    const threeActs = { ...masteredModule(COURSE, 'm1'), ...masteredModule(COURSE, 'm2'), ...masteredModule(COURSE, 'm3') };
    const passed = { attempts: 1, outcome: 'passed' as const };
    const exams3 = { m1: passed, m2: passed, m3: passed };
    const before = await renderApp(undefined, { profiles: [profile({ lessons: threeActs, exams: exams3 })], select: 'p1' });
    expect(screen.getByRole('heading', { name: /Akt 4 · Großschreibung/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kleinmachung/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Fallakte Akt 4/ })).toBeNull();
    // die Fallakten der Akte 1 bis 3 bleiben erreichbar
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).toBeInTheDocument();
    before.unmount();

    const lessons = { ...threeActs, ...masteredModule(COURSE, 'm4') };
    await renderApp(undefined, { profiles: [profile({ lessons, exams: { ...exams3, m4: passed } })], select: 'p1' });
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3', 'Akt 4']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).toBeInTheDocument();
  });

  it('Akt 5 erscheint nach dem Einsatz von Akt 4; nach dem Einsatz von Akt 5 gibt es fünf Fallakten; zerkratzt sind die ersten vier mit echtem Inhalt', async () => {
    const fourActs = { ...masteredModule(COURSE, 'm1'), ...masteredModule(COURSE, 'm2'), ...masteredModule(COURSE, 'm3'), ...masteredModule(COURSE, 'm4') };
    const passed = { attempts: 1, outcome: 'passed' as const };
    const exams4 = { m1: passed, m2: passed, m3: passed, m4: passed };
    const before = await renderApp(undefined, { profiles: [profile({ lessons: fourActs, exams: exams4 })], select: 'p1' });
    expect(screen.getByRole('heading', { name: /Akt 5 · Satzzeichen/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Festplakat/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Fallakte Akt 5/ })).toBeNull();
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3', 'Akt 4']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).not.toHaveTextContent('zerkratzt');
    before.unmount();

    // zwischen `a5-l2-brief` und `a5-l2-done` (echter Inhalt): die Fallakten der Akte 1 bis 4 sind zerkratzt, die von Akt 5 gibt es noch nicht
    const scratched = await renderApp(undefined, { profiles: [profile({ lessons: fourActs, exams: exams4, story: storyLog(['a5-l2-brief'], { v: STORY.version }) })], select: 'p1' });
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3', 'Akt 4']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).toHaveTextContent('zerkratzt');
    expect(screen.queryByRole('button', { name: /Fallakte Akt 5/ })).toBeNull();
    scratched.unmount();

    // danach (Szene `a5-l2-done` gesehen) sind alle fünf Fallakten da und heil
    const lessons = { ...fourActs, ...masteredModule(COURSE, 'm5') };
    await renderApp(undefined, { profiles: [profile({ lessons, exams: { ...exams4, m5: passed }, story: storyLog(['a5-l2-brief', 'a5-l2-done'], { v: STORY.version }) })], select: 'p1' });
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3', 'Akt 4', 'Akt 5']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).not.toHaveTextContent('zerkratzt');
  });

  it('Akt 6 erscheint nach dem Einsatz von Akt 5; nach dem Einsatz von Akt 6 gibt es sechs Fallakten, Akt 7 ist da, bis zu seinem Einsatz gibt es kein Ende', async () => {
    const fiveActs = Object.assign({}, ...['m1', 'm2', 'm3', 'm4', 'm5'].map((m) => masteredModule(COURSE, m)));
    const passed = { attempts: 1, outcome: 'passed' as const };
    const exams5 = { m1: passed, m2: passed, m3: passed, m4: passed, m5: passed };
    const before = await renderApp(undefined, { profiles: [profile({ lessons: fiveActs, exams: exams5 })], select: 'p1' });
    expect(screen.getByRole('heading', { name: /Akt 6 · Zahlen/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Koordinaten/ })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Fallakte Akt 6/ })).toBeNull();
    expect(screen.queryByText(/Fortsetzung|vorerst/)).toBeNull();
    before.unmount();

    const lessons = { ...fiveActs, ...masteredModule(COURSE, 'm6') };
    const sixActs = { ...exams5, m6: passed };
    const after = await renderApp(undefined, { profiles: [profile({ lessons, exams: sixActs })], select: 'p1' });
    for (const act of ['Akt 1', 'Akt 2', 'Akt 3', 'Akt 4', 'Akt 5', 'Akt 6']) expect(screen.getByRole('button', { name: new RegExp(`Fallakte ${act}`) }), act).toBeInTheDocument();
    // Akt 7 ist da (Sonderzeichen, das Finale); das Ende kommt erst nach seinem Einsatz
    expect(screen.getByRole('heading', { name: /Akt 7 · Sonderzeichen/ })).toBeInTheDocument();
    expect(screen.queryByText(/Fortsetzung|Tippstunde/)).toBeNull();
    after.unmount();

    // nach dem Einsatz von Akt 7: sieben Fallakten, die Abschlussakte inklusive, und die Karte „Bennos Tippstunde“
    const all = { ...lessons, ...masteredModule(COURSE, 'm7') };
    await renderApp(undefined, { profiles: [profile({ lessons: all, exams: { ...sixActs, m7: passed } })], select: 'p1' });
    expect(screen.getAllByRole('button', { name: /^Fallakte Akt / })).toHaveLength(7);
    expect(screen.getByRole('button', { name: /Fallakte Akt 7/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(TRAINING_CARD.title) })).toBeInTheDocument();
  });

  it('vor dem Einsatz gibt es noch keine Fallakte', async () => {
    await renderApp(undefined, { profiles: [profile({ lessons: masteredModule(COURSE, 'm1') })], select: 'p1' });
    expect(screen.queryByRole('button', { name: /Fallakte/ })).toBeNull();
  });

  it('Sound an/aus und Profil wechseln', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    await app.user.click(screen.getByRole('button', { name: 'Sound: an' }));
    expect(screen.getByRole('button', { name: 'Sound: aus' })).toBeInTheDocument();
    expect(app.sound.enabled).toBe(false);
    await app.user.click(screen.getByRole('button', { name: 'Profil wechseln' }));
    expect(screen.getByText('Wer meldet sich zum Dienst?')).toBeInTheDocument();
  });

  it('„Hilfe & Feedback“ neben „Credits“: Link in einem neuen Tab zum Repository', async () => {
    await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    const link = screen.getByRole('link', { name: /Hilfe & Feedback/ });
    expect(link).toHaveAttribute('href', REPO_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    expect(screen.getByRole('button', { name: 'Credits' })).toBeInTheDocument();
  });

  it('Flow-Chip an/aus: Beschriftung wechselt, Einstellung wird gespeichert', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    const button = screen.getByRole('button', { name: 'Flow-Chip: aus' });
    expect(button).toHaveAttribute('title', 'Fehler leuchten nur rot, du tippst weiter');
    await app.user.click(button);
    expect(screen.getByRole('button', { name: 'Flow-Chip: an' })).toBeInTheDocument();
    expect(app.store.getState().current?.settings.flow).toBe(true);
    await app.user.click(screen.getByRole('button', { name: 'Flow-Chip: an' }));
    expect(screen.getByRole('button', { name: 'Flow-Chip: aus' })).toBeInTheDocument();
  });

  it('Blindflug: ohne Brille „Tastatur“, mit Brille in Story-Worten; Einstellung wird gespeichert', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: an' }));
    expect(screen.getByRole('button', { name: 'Tastatur: aus' })).toBeInTheDocument();
    expect(app.store.getState().current?.settings.blind).toBe(true);
  });

  it('Blindflug mit Brille im Koffer heißt „Blindflug“', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ story: storyLog(['a7-l2-brief']) })], select: 'p1' });
    await app.user.click(screen.getByRole('button', { name: 'Blindflug: aus' }));
    expect(screen.getByRole('button', { name: 'Blindflug: an' })).toBeInTheDocument();
  });

  describe('Willkommen zurück', () => {
    const away = (days: number) => profile({ days: { count: 3, lastDay: dayKey(T0 - days * DAY) } });

    it('nach einer Woche Pause ersetzt die Begrüßung Krümels Tipp und nennt den Stand; Enter startet den Auftrag', async () => {
      const app = await renderApp(undefined, { profiles: [away(8)], select: 'p1' });
      expect(screen.getByText('Piep! Da bist du ja wieder.')).toBeInTheDocument();
      expect(screen.getByText(/Zum Warmwerden eine Runde\?/)).toBeInTheDocument();
      expect(screen.getByText(/%/, { selector: '.welcome p' })).toBeInTheDocument();
      expect(screen.queryByText(/^Tipp:/)).toBeNull();
      await app.press('{Enter}');
      expect(app.store.getState().screen.name).not.toBe('hq');
      expect(app.store.getState().welcome).toBe(false);
    });

    it('„Später“ zeigt wieder Krümels Tipp', async () => {
      const app = await renderApp(undefined, { profiles: [away(8)], select: 'p1' });
      await app.user.click(screen.getByRole('button', { name: /Später/ }));
      expect(screen.queryByText('Piep! Da bist du ja wieder.')).toBeNull();
      expect(screen.getByText(/^Tipp:/)).toBeInTheDocument();
    });

    it('der Knopf startet den Auftrag', async () => {
      const app = await renderApp(undefined, { profiles: [away(8)], select: 'p1' });
      await app.user.click(screen.getByRole('button', { name: /Los geht/ }));
      expect(app.store.getState().screen.name).not.toBe('hq');
    });

    it('bei kürzerer Pause bleibt es beim Tipp', async () => {
      await renderApp(undefined, { profiles: [away(3)], select: 'p1' });
      expect(screen.queryByText('Piep! Da bist du ja wieder.')).toBeNull();
      expect(screen.getByText(/^Tipp:/)).toBeInTheDocument();
    });
  });
});

describe('Hauptquartier: Finger-Regel und Tipps', () => {
  it('Finger-Regel der neuen Tasten: vor dem Briefing noch nicht', async () => {
    await renderApp(undefined, { profiles: [profile({ lessons: mastered('m1-l1') })], select: 'p1' });
    expect(screen.queryByText('D – linker Mittelfinger · K – rechter Mittelfinger')).toBeNull();
  });

  it('gesehenes Briefing: die Regel steht auf der Karte', async () => {
    const brief = sceneFor(STORY, 'briefing', (t) => t.lessonId === 'm1-l2')!;
    const p = logScenes(profile({ lessons: mastered('m1-l1') }), [brief.id], 0);
    await renderApp(undefined, { profiles: [p], select: 'p1' });
    expect(screen.getByText('D – linker Mittelfinger · K – rechter Mittelfinger')).toBeInTheDocument();
  });

  it('Krümels Tipp passt zum Modul: in Modul 4 ein Umschalt-Tipp, vorher ein allgemeiner', async () => {
    const lessons = Object.assign({}, masteredModule(COURSE, 'm1'), masteredModule(COURSE, 'm2'), masteredModule(COURSE, 'm3'));
    const exams = { m1: { attempts: 1, outcome: 'passed' as const }, m2: { attempts: 1, outcome: 'passed' as const }, m3: { attempts: 1, outcome: 'passed' as const } };
    const { unmount } = await renderApp(undefined, { profiles: [profile({ lessons, exams })], select: 'p1' });
    expect(KRUEMEL_TIPS.shift.some((t) => screen.queryByText(t))).toBe(true);
    unmount();
    await renderApp(undefined, { profiles: [profile()], select: 'p1' });
    expect(KRUEMEL_TIPS.allgemein.some((t) => screen.queryByText(t))).toBe(true);
  });

  it('steht der Einsatz von Modul 3 noch an, kommt noch kein Umschalt-Tipp', async () => {
    const lessons = Object.assign({}, masteredModule(COURSE, 'm1'), masteredModule(COURSE, 'm2'), masteredModule(COURSE, 'm3'));
    const exams = { m1: { attempts: 1, outcome: 'passed' as const }, m2: { attempts: 1, outcome: 'passed' as const } };
    await renderApp(undefined, { profiles: [profile({ lessons, exams })], select: 'p1' });
    expect(KRUEMEL_TIPS.shift.some((t) => screen.queryByText(t))).toBe(false);
    expect(KRUEMEL_TIPS.allgemein.some((t) => screen.queryByText(t))).toBe(true);
  });
});
