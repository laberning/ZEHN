import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { kr } from '../../content/story/builders.ts';
import type { StoryScene } from '../../domain/scenes.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import { COURSE } from '../../content/course.ts';
import { STORY } from '../../app/rules.ts';
import { keystrokeFor } from '../../domain/keyboard.ts';
import { keyStat, mastered, masteredModule, REAL_BOOK, SHIFT_COURSE, TEST_RULES, profile, storyLog, T0 } from '../../test/factories.ts';
import { currentText, renderApp } from '../../test/renderApp.tsx';

const mission = { name: 'mission' as const, lessonId: 'm1-l1' };

describe('Auftrag', () => {
  it('Tippen färbt Zeichen, Fehler animieren die gedrückte Taste, Enter führt zur nächsten Runde', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    const text = currentText(app.container);
    expect(text).toMatch(/^[fj ]+$/);
    await app.type('q');
    expect(app.container.querySelector('.kb-key.miss')).toHaveTextContent('Q');
    expect(app.sound.played).toContain('error');
    await app.type(text);
    expect(await screen.findByText(/Kalibrierung 1\/2 geschafft/)).toBeInTheDocument();
    expect(app.store.getState().current?.history).toHaveLength(1);
    await app.press('{Enter}');
    expect(screen.getByText(/Kalibrierung 2\/2/)).toBeInTheDocument();
  });

  it('Tippphase in Fensterhöhe: mit Siegeln mit Seitenleiste, im Zwischenergebnis und in der Nachbesprechung normale Seite', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    const screenEl = () => app.container.querySelector('.mission-screen');
    expect(screenEl()).toHaveClass('typing-phase', 'with-side');
    expect(app.container.querySelector('.screen-side .mission-top')).not.toBeNull();
    expect(app.container.querySelector('.screen-side .seal-bar')).not.toBeNull();
    expect(app.container.querySelector('.text-scroll')).not.toBeNull();
    await app.type(currentText(app.container));
    await screen.findByText(/Kalibrierung 1\/2 geschafft/);
    expect(screenEl()).not.toHaveClass('typing-phase');
    expect(screenEl()).not.toHaveClass('with-side');
    await app.press('{Enter}');
    expect(screenEl()).toHaveClass('typing-phase', 'with-side'); // nächste Runde: wieder Tippphase
    await app.type(currentText(app.container));
    await screen.findByText(/Kalibrierung 2\/2 geschafft|Runde geschafft|Auftrag abgeschlossen/);
  });

  it('Flow-Chip aus: kein Schild, Pflicht-Korrektur', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    expect(screen.queryByText('Flow-Chip an')).toBeNull();
    const text = currentText(app.container);
    await app.type('q');
    expect(app.container.querySelector('.ch.wrong')).toBeNull();
    expect(currentText(app.container)).toBe(text);
  });

  it('Flow-Chip an: Schild in der Kopfzeile, ein Fehler hält nicht an', async () => {
    const base = profile();
    const app = await renderApp(undefined, { profiles: [{ ...base, settings: { ...base.settings, flow: true } }], select: 'p1', screen: mission });
    expect(screen.getByText('Flow-Chip an')).toBeInTheDocument();
    await app.type('q');
    expect(app.container.querySelector('.ch.wrong')).not.toBeNull();
    await app.type(currentText(app.container).slice(1));
    expect(await screen.findByText(/geschafft/)).toBeInTheDocument();
  });

  it('Blindflug aus: Tastatur da, Knopf „Tastatur: an“', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    expect(app.container.querySelector('.desk-keyboard .keyboard')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Tastatur: an' })).toBeInTheDocument();
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    expect(screen.queryByText(/Ohne Blick auf die Tasten/)).toBeNull();
  });

  it('Blindflug an: keine Tastatur, Hinweiszeile und Siegel bleiben; Krümel sagt nach der Runde einen Satz', async () => {
    const base = profile();
    const app = await renderApp(undefined, { profiles: [{ ...base, settings: { ...base.settings, blind: true } }], select: 'p1', screen: mission });
    expect(app.container.querySelector('.desk-keyboard .keyboard')).toBeNull();
    expect(app.container.querySelector('.kb-key')).toBeNull();
    expect(app.container.querySelector('.hint')?.textContent).toMatch(/\S/);
    expect(app.container.querySelector('.seal-bar')).not.toBeNull();
    await app.type(currentText(app.container));
    expect(await screen.findByText(/Ohne Blick auf die Tasten getippt/)).toBeInTheDocument();
  });

  it('Blindflug mit Brille: Satz in Story-Worten', async () => {
    const base = profile();
    const app = await renderApp(undefined, { profiles: [{ ...base, story: storyLog(['a7-l2-brief']), settings: { ...base.settings, blind: true } }], select: 'p1', screen: mission });
    await app.type(currentText(app.container));
    expect(await screen.findByText(/Blindflug mit Brille/)).toBeInTheDocument();
  });

  it('der Umschalter wirkt sofort, solange in der Runde noch nichts getippt ist (an und aus)', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: an' }));
    expect(app.store.getState().current?.settings.blind).toBe(true);
    expect(app.container.querySelector('.desk-keyboard .keyboard')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull(); // nichts zu erklären
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: aus' }));
    expect(app.container.querySelector('.desk-keyboard .keyboard')).not.toBeNull();
    // Die ganze Runde mit Tastatur: kein Satz von Krümel
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    expect(screen.queryByText(/Ohne Blick auf die Tasten/)).toBeNull();
  });

  it('sofort umgeschaltet vor dem ersten Tippen: die ganze Runde ist blind, Krümel sagt seinen Satz', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: an' }));
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    expect(screen.getByText(/Ohne Blick auf die Tasten getippt/)).toBeInTheDocument();
  });

  it('nach dem ersten Tastendruck gilt der Umschalter ab der nächsten Runde; eine Zeile sagt es', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    const text = currentText(app.container);
    await app.type(text.slice(0, 1));
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: an' }));
    expect(app.store.getState().current?.settings.blind).toBe(true);
    expect(app.container.querySelector('.desk-keyboard .keyboard')).not.toBeNull(); // laufende Runde springt nicht
    expect(screen.getByRole('button', { name: 'Tastatur: aus' })).toBeInTheDocument(); // der Knopf zeigt den neuen Wert, ohne Zusatz
    expect(screen.getByRole('status')).toHaveTextContent('Die Tastatur verschwindet ab der nächsten Runde.');
    await app.type(text.slice(1));
    await screen.findByText(/geschafft/);
    expect(screen.queryByText(/Ohne Blick auf die Tasten/)).toBeNull(); // diese Runde war nicht blind
    await app.press('{Enter}');
    expect(app.container.querySelector('.desk-keyboard .keyboard')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    // Zurück: die Tastatur ist gerade aus, noch nichts getippt, also sofort
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: aus' }));
    expect(app.store.getState().current?.settings.blind).toBe(false);
    expect(app.container.querySelector('.desk-keyboard .keyboard')).not.toBeNull();
  });

  it('Tastatur ist aus und wird nach dem ersten Tastendruck wieder eingeschaltet: Zeile unter dem Text, Satz nach der Runde bleibt', async () => {
    const base = profile();
    const app = await renderApp(undefined, { profiles: [{ ...base, settings: { ...base.settings, blind: true } }], select: 'p1', screen: mission });
    const text = currentText(app.container);
    await app.type(text.slice(0, 1));
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: aus' }));
    expect(app.container.querySelector('.desk-keyboard .keyboard')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Die Tastatur kommt ab der nächsten Runde zurück.');
    await app.type(text.slice(1));
    expect(await screen.findByText(/Ohne Blick auf die Tasten getippt/)).toBeInTheDocument(); // die ganze Runde lief ohne Tastatur
  });

  it('zwischen zwei Runden umgeschaltet: die nächste Runde beginnt gleich ohne Tastatur, ohne Hinweiszeile', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: an' }));
    expect(screen.queryByText(/Ohne Blick auf die Tasten/)).toBeNull(); // die fertige Runde lief mit Tastatur
    await app.press('{Enter}');
    expect(app.container.querySelector('.desk-keyboard .keyboard')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('ein Fehler als erster Anschlag zählt als getippt', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.type('q');
    await app.user.click(screen.getByRole('button', { name: 'Tastatur: an' }));
    expect(app.container.querySelector('.desk-keyboard .keyboard')).not.toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('Entwickler-Abkürzung F9 tippt die Runde fehlerfrei zu Ende (nur im Dev-Modus)', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.type(currentText(app.container).slice(0, 3));
    await app.press('{F9}');
    expect(await screen.findByText(/Kalibrierung 1\/2 geschafft/)).toBeInTheDocument();
    const [entry] = app.store.getState().current!.history;
    expect(entry).toMatchObject({ accuracy: 1 });
    expect(app.store.getState().current!.stats['f']!.accuracy).toBe(1);
  });

  it('die Nachbesprechung sagt, wann die nächste Nachricht kommt – beim Tippen nicht', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    expect(screen.queryByText(/Nächste Nachricht/)).toBeNull();
    for (let i = 0; i < 2; i++) {
      await app.type(currentText(app.container));
      if (i === 0) {
        await screen.findByText(/geschafft/);
        await app.press('{Enter}');
      }
    }
    await screen.findByRole('heading', { name: /Runde geschafft|Auftrag abgeschlossen/ });
    expect(screen.getByText(/Nächste Nachricht bei \d+ %|Die Geschichte geht weiter/)).toBeInTheDocument();
  });

  it('Siegel für F und J: ein Riegel geht nach genug Anschlägen auf', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission, delay: 300 });
    expect(app.container.querySelectorAll('.seal-bar .seal')).toHaveLength(2);
    expect(app.container.querySelectorAll('.kb-key.ringed')).toHaveLength(2);
    expect(screen.getAllByText('misst noch …').length).toBeGreaterThan(0);
    expect(app.container.querySelector('.seal-bar .latch.open')).toBeNull();
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    // zweite Runde: die ersten Anschläge sind schon eingerechnet, der Training-Riegel geht bald auf
    await app.type(currentText(app.container).slice(0, 30));
    expect(app.container.querySelector('.seal-bar .latch.open')).not.toBeNull();
    expect(app.container.querySelector('.seal-bar')).toHaveTextContent(/Siegel|Anschläge|genauer|flüssiger|sitzt/);
  });

  it('Großschreibung: ein Siegel für die Umschalttaste statt 15 Großbuchstaben, Ring und Leuchten auf der Umschalttaste', async () => {
    const rules = { ...TEST_RULES, course: SHIFT_COURSE };
    const p = profile({ lessons: masteredModule(SHIFT_COURSE, 's1'), exams: { s1: { attempts: 1, outcome: 'passed' } } });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'mission', lessonId: 's2a' }, rules, delay: 300 });
    expect(app.container.querySelectorAll('.seal-bar .seal')).toHaveLength(1);
    expect(app.container.querySelector('.seal-bar .seal')).toHaveTextContent('Umschalt rechts');
    // ein Ring, und zwar auf der Umschalttaste; sie leuchtet, die linke Umschalttaste noch nicht
    expect(app.container.querySelectorAll('.kb-key.ringed')).toHaveLength(1);
    expect(app.container.querySelector('.kb-key.ringed')).toHaveClass('deco', 'learned');
    expect(app.container.querySelectorAll('.kb-key.deco.learned')).toHaveLength(1);
    // Aufwärmen, dann die erste Übungsrunde: Sie beginnt mit einem Großbuchstaben, der für die Umschalttaste zählt
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    const text = currentText(app.container);
    expect(text).toMatch(/^[A-Z]/);
    await app.type(text);
    await screen.findByText(/geschafft/);
    const { stats } = app.store.getState().current!;
    expect(stats['shift-right']!.samples).toBeGreaterThan(0);
    expect(stats['Q']).toBeUndefined();
  });

  it('Nachbesprechung zeigt das Story-Objekt mit dem besten Stand', async () => {
    const lessons = { ...mastered('m1-l1', 'm1-l2'), 'm1-l3': { exercises: 0, bestStars: 0 as const, mastered: false, best: 0.61 } };
    // die Stufen-Szenen bis 50 % sind schon gelesen – sonst zeigt erst der Chat das Objekt
    const story = storyLog(['l3-brief', 'l3-s25', 'l3-s50'], { read: ['l3-brief', 'l3-s25', 'l3-s50'] });
    const app = await renderApp(undefined, { profiles: [profile({ lessons, story })], select: 'p1', screen: { name: 'mission', lessonId: 'm1-l3' } });
    expect(screen.getByText('Die Goldrand-Karte')).toBeInTheDocument();
    for (let i = 0; i < 3; i++) {
      await app.type(currentText(app.container));
      if (i < 2) {
        await screen.findByText(/geschafft/);
        await app.press('{Enter}');
      }
    }
    await screen.findByRole('heading', { name: /Runde geschafft|Auftrag abgeschlossen/ });
    expect(app.container.querySelector('.story-object.big')).toHaveTextContent(/Die Goldrand-Karte\s*61 %/);
    expect(screen.getByText('HEUTE UM 12 HOLE ICH MIR …')).toBeInTheDocument();
  });

  it('Nachbesprechung erklärt, was noch fehlt (ohne Tempo keine Flüssigkeit)', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    await app.type(currentText(app.container));
    // der Auftrag ist noch offen: die Überschrift verspricht keinen Abschluss
    expect(await screen.findByRole('heading', { name: 'Runde geschafft' })).toBeInTheDocument();
    expect(app.container.querySelectorAll('.seals.big .seal')).toHaveLength(2);
    expect(screen.getByText(/2 Übungsrunden gespielt sind: 2 \/ 2/)).toBeInTheDocument();
    await app.user.click(screen.getByRole('button', { name: /Noch eine Runde/ })); // die Nebenszene wartet im Funk
    expect(screen.getByText(/Kalibrierung 1\/2/)).toBeInTheDocument();
  });

  it('Nachbesprechung: Krümel nennt eine abgerutschte alte Taste mit Finger', async () => {
    const all = ['training', 'precision', 'tempo'] as const;
    const stats = { f: keyStat({ samples: 50, accuracy: 0.81 }), j: keyStat({ samples: 50, accuracy: 0.81 }) };
    const p = profile({ lessons: mastered('a1'), stats, latches: { f: [...all], j: [...all] } });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'mission', lessonId: 'a2' }, rules: TEST_RULES });
    expect(screen.queryByText(/abgerutscht/)).toBeNull();
    // jede alte Taste einmal falsch antippen, dann richtig
    const typeWithMisses = async (text: string) => {
      for (const c of text) await app.type(/[fj]/.test(c) ? `q${c}` : c);
    };
    await typeWithMisses(currentText(app.container)); // Aufwärmen
    for (let round = 0; round < 6 && !app.container.querySelector('.lesson-check'); round++) {
      await app.press('{Enter}');
      await typeWithMisses(currentText(app.container) ?? ''); // leer, solange noch ein Panel steht
    }
    expect(app.container.querySelector('.lesson-check')).not.toBeNull();
    expect(screen.getByText(/ist abgerutscht: .*Zeigefinger, bleib auf der Grundreihe\. Nächste Runde langsam und genau/)).toBeInTheDocument();
  });

  it('flüssig und fehlerfrei: Auftrag geschafft → Story → HQ', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission, delay: 300 });
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    await app.type(currentText(app.container));
    expect(await screen.findByRole('button', { name: /Die Geschichte geht weiter/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Auftrag abgeschlossen' })).toBeInTheDocument();
    expect(screen.getByText('Tastsinn')).toBeInTheDocument();
    expect(screen.getByText(/Neu in der Garderobe: .*Krempelhose/)).toBeInTheDocument();
    await app.press('{Enter}');
    await app.finishChat(); // neue Szenen im Funk
    await app.press('{Enter}');
    await app.finishDialog(2); // Krümels Ankündigung der Krempelhose: „Später“
    expect(screen.getByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
    expect(screen.getByText(/^Neu \d$/)).toBeInTheDocument();
  }, 15_000); // viele Bildschirme und Szenen: unter Last mit Coverage über 5 s

  it('Wiederholung eines geschafften Auftrags: die Überschrift bleibt „Auftrag abgeschlossen“', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: mastered('m1-l1') })], select: 'p1', screen: mission });
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    await app.type(currentText(app.container));
    expect(await screen.findByRole('heading', { name: 'Auftrag abgeschlossen' })).toBeInTheDocument();
  });

  it('Aufwärmen ab Auftrag 2; Umlaute werden getippt; englisches Layout wird erkannt', async () => {
    const app = await renderApp(undefined, {
      profiles: [profile({ lessons: mastered('m1-l1', 'm1-l2', 'm1-l3') })],
      select: 'p1',
      screen: { name: 'mission', lessonId: 'm1-l4' },
    });
    expect(screen.getByText('› Aufwärmen')).toBeInTheDocument();
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    const text = currentText(app.container);
    const at = text.indexOf('ö');
    expect(at).toBeGreaterThanOrEqual(0);
    await app.type(text.slice(0, at));
    expect(screen.queryByText(/kein deutsches Tastaturlayout/)).toBeNull();
    await app.type(';'); // englisches Layout: ; liegt dort, wo im deutschen das Ö ist
    expect(screen.getByRole('alert')).toHaveTextContent(/kein deutsches Tastaturlayout/);
    await app.type(text.slice(at));
    expect(await screen.findByText(/geschafft/)).toBeInTheDocument();
  });

  it('Esc nach geschafftem Auftrag überspringt die Story nicht', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission, delay: 300 });
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    await app.type(currentText(app.container));
    await screen.findByRole('button', { name: /Die Geschichte geht weiter/ });
    await app.press('{Escape}');
    // Esc führt in die Story, nicht am Chat vorbei
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: expect.arrayContaining(['l1-done']), then: { name: 'hq' } });
    await app.press('{Escape}'); // auch im Chat führt Esc weiter (Ungelesenes bleibt ungelesen)
    expect(app.store.getState().screen.name).toBe('hq');
    expect(app.store.getState().current?.story.read).toEqual([]);
  });

  it('Feststelltaste an: Hinweis, Buchstaben zählen nicht als Fehler', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.user.keyboard('{CapsLock}');
    await app.type('F');
    expect(screen.getByRole('alert')).toHaveTextContent(/Feststelltaste ist an/);
    expect(app.container.querySelector('.ch.cursor')).not.toBeNull();
    expect(app.sound.played).not.toContain('error');
    await app.user.keyboard('{CapsLock}');
    await app.type(currentText(app.container)[0]!);
    expect(screen.queryByText(/Feststelltaste ist an/)).toBeNull();
    expect(app.sound.played).toContain('key');
  });

  it('Rundenhinweis: zwei Fehler auf K → Krümel nennt den rechten Mittelfinger im Zwischen-Panel', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: mastered('m1-l1') })], select: 'p1', screen: { name: 'mission', lessonId: 'm1-l2' } });
    let misses = 0;
    const text = Array.from(currentText(app.container), (ch) => (ch === 'k' && misses++ < 2 ? 'qk' : ch)).join('');
    await app.type(text);
    expect(await screen.findByText(/Die Taste K ging zweimal daneben: rechter Mittelfinger, bleib auf der Grundreihe\./)).toBeInTheDocument();
  });

  it('Rundenhinweis: zwei Griffe zu hoch auf K → der Satz nennt die Fehlerart', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ lessons: mastered('m1-l1') })], select: 'p1', screen: { name: 'mission', lessonId: 'm1-l2' } });
    let misses = 0;
    const text = Array.from(currentText(app.container), (ch) => (ch === 'k' && misses++ < 2 ? 'ik' : ch)).join('');
    await app.type(text);
    expect(await screen.findByText(/Die Taste K ging zweimal daneben, meist eine Reihe zu hoch: rechter Mittelfinger, bleib auf der Grundreihe\./)).toBeInTheDocument();
  });

  it('Rundenhinweis: Großbuchstaben mit der falschen Umschalt-Hand → der Satz nennt die Umschalttaste, die Buchstaben zählen als richtig', async () => {
    const rules = { ...TEST_RULES, course: SHIFT_COURSE };
    const p = profile({ lessons: masteredModule(SHIFT_COURSE, 's1'), exams: { s1: { attempts: 1, outcome: 'passed' } } });
    const app = await renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'mission', lessonId: 's2a' }, rules, delay: 300 });
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    const text = currentText(app.container);
    // jeden Großbuchstaben mit der Umschalttaste der falschen Hand: Buchstaben der linken Hand verlangen rechts, hier links
    const keys = Array.from(text, (ch) => {
      if (!/^[A-Z]$/.test(ch)) return ch === '[' || ch === '{' ? ch + ch : ch;
      const need = keystrokeFor(ch)!.shift;
      const wrong = need === 'left' ? 'ShiftRight' : 'ShiftLeft';
      return `[${wrong}>]${ch}[/${wrong}]`;
    }).join('');
    expect(text.match(/[A-Z]/g)!.length).toBeGreaterThanOrEqual(2);
    await app.user.keyboard(keys);
    expect(await screen.findByText(/die Umschalttaste hielt die falsche Hand\./)).toBeInTheDocument();
    expect(screen.queryByText(/ging .* daneben/)).toBeNull();
  });

  it('Rundenhinweis: eine fehlerfreie Runde bekommt keinen', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.type(currentText(app.container));
    await screen.findByText(/Kalibrierung 1\/2 geschafft/);
    expect(screen.queryByText(/ging .* daneben|Ausrutscher/)).toBeNull();
  });

  it('Ziffernblock: Hinweis unter dem Text, Position bleibt, der nächste gültige Anschlag löscht ihn', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    const text = currentText(app.container);
    fireEvent.keyDown(window, { key: '4', code: 'Numpad4' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Der Ziffernblock zählt nicht. Die Zahlen liegen oben über den Buchstaben: Finger hoch und zurück.');
    expect(currentText(app.container)).toBe(text);
    expect(app.container.querySelector('.ch.wrong')).toBeNull();
    fireEvent.keyDown(window, { key: '+', code: 'NumpadAdd' }); // zählt auch nicht, der Hinweis bleibt
    expect(screen.getByRole('alert')).toHaveTextContent('Der Ziffernblock zählt nicht.');
    await app.type(text[0]!);
    expect(screen.queryByText(/Ziffernblock zählt nicht/)).toBeNull();
  });

  it('Esc bricht ab und führt ins HQ', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission });
    await app.press('{Escape}');
    expect(screen.getByText(/Akt 1 · Grundreihe/)).toBeInTheDocument();
  });
});

describe('Nach der Nachbesprechung', () => {
  const sc = (id: string, trigger: StoryScene['trigger'], chat: StoryScene['chat'] = 'kruemel'): StoryScene => ({ id, chat, trigger, lines: [kr(`${id} Text`)] });
  const stage = (at: 0.25 | 0.5 | 0.75) => sc(`s${at * 100}`, { on: 'stage', lessonId: 'm1-l1', at });
  const story = (...scenes: StoryScene[]): StoryContent => ({ version: 1, objects: [], items: [], cases: [], ...REAL_BOOK, scenes });
  /** zwei Runden ohne Tempo-Messung: der Auftrag wird nicht geschafft */
  const run = async (app: Awaited<ReturnType<typeof renderApp>>) => {
    await app.type(currentText(app.container));
    await screen.findByText(/geschafft/);
    await app.press('{Enter}');
    await app.type(currentText(app.container));
    await screen.findByRole('heading', { name: /Runde geschafft|Auftrag abgeschlossen/ });
  };
  // langsam eingeübt: Tempo-Riegel zu, aber der Fortschritt steigt auf etwa 71 %
  const slow = { f: keyStat({ samples: 40, avgMs: 2100 }), j: keyStat({ samples: 40, avgMs: 2100 }) };

  it('neue Stufe: „Die Geschichte geht weiter“ öffnet den Funk, danach „Noch eine Runde“', async () => {
    const app = await renderApp(undefined, { profiles: [profile({ stats: slow })], select: 'p1', screen: mission, story: story(stage(0.25), stage(0.5), stage(0.75)) });
    await run(app);
    expect(screen.queryByText(/hat dir geschrieben/)).toBeNull();
    await app.press('{Enter}');
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: ['s25', 's50'], again: { name: 'mission', lessonId: 'm1-l1' } });
    await app.finishChat();
    expect(screen.getByRole('button', { name: /Noch eine Runde/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zurück ins Hauptquartier/ })).toBeInTheDocument();
    await app.press('{Enter}');
    expect(app.store.getState().screen).toMatchObject({ name: 'mission', lessonId: 'm1-l1' });
  });

  it('nur eine Nebenszene: Hinweis mit Absender, Enter liest, danach „Noch eine Runde“ oder HQ', async () => {
    const side = sc('side1', { on: 'side', strand: 'tag', order: 1, fromLesson: 'm1-l1' });
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission, story: story(side) });
    await run(app);
    expect(screen.getByText(/Krümel hat dir geschrieben/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Noch eine Runde/ })).toBeInTheDocument();
    await app.press('{Enter}'); // Enter liest
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: ['side1'] });
    await app.finishChat();
    expect(within(screen.getByRole('log')).getByText('side1 Text')).toBeInTheDocument();
    await app.press('{Escape}'); // Esc: ins HQ (die Szene ist schon gelesen)
    expect(app.store.getState().screen.name).toBe('hq');
    expect(app.store.getState().current?.story.read).toEqual(['side1']);
  });

  it('nichts Neues: wie bisher „Noch eine Runde“', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: mission, story: story() });
    await run(app);
    expect(screen.queryByText(/geschrieben/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Geschichte geht weiter/ })).toBeNull();
    await app.press('{Enter}');
    expect(app.store.getState().screen).toMatchObject({ name: 'mission', lessonId: 'm1-l1' });
  });

  it('Spezialtraining vor dem Einsatz: „Noch eine Runde“ im Funk führt zurück zum Einsatz', async () => {
    const last = COURSE.modules[0]!.lessons.at(-1)!.id;
    const app = await renderApp(undefined, {
      profiles: [profile({ lessons: masteredModule(COURSE, 'm1') })],
      select: 'p1',
      screen: { name: 'mission', lessonId: last, training: { kind: 'exam', keys: ['f', 'j'] } },
      story: story(sc('st', { on: 'stage', lessonId: last, at: 0.25 })),
    });
    await app.type(currentText(app.container));
    await screen.findByRole('heading', { name: 'Training beendet' });
    await app.press('{Enter}'); // die neue Szene öffnet den Funk
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: ['st'], again: { name: 'exam', moduleId: 'm1' } });
  });

  describe('Bennos Tippstunde', () => {
    const lessons = Object.assign({}, ...COURSE.modules.map((m) => masteredModule(COURSE, m.id)));
    const last = COURSE.modules.at(-1)!.lessons.at(-1)!.id;
    const exams = Object.fromEntries(COURSE.modules.map((m) => [m.id, { attempts: 1, outcome: 'passed' as const }]));
    const history = [
      { t: T0, lessonId: 'm1-l1', kind: 'exercise' as const, apm: 20, accuracy: 0.8, chars: 40 },
      { t: T0 + 1, lessonId: 'm1-l2', kind: 'exercise' as const, apm: 24, accuracy: 0.9, chars: 40 },
    ];
    const training = { kind: 'tippstunde' as const, keys: ['f', 'j', 'd'], frame: 'Bennos Tippstunde' };
    const start = (p = profile({ lessons, exams, history, story: storyLog([], { v: 99 }) })) => renderApp(undefined, { profiles: [p], select: 'p1', screen: { name: 'mission', lessonId: last, training }, story: { ...STORY, scenes: [] } });

    it('eine Runde mit Sätzen aus der Geschichte; danach heute neben Akt 1, „Noch eine Runde“ und „Zum HQ“', async () => {
      const app = await start();
      expect(screen.getByText('› Bennos Tippstunde')).toBeInTheDocument();
      expect(app.container.querySelector('.seal-bar')).toBeNull();
      await app.type(currentText(app.container));
      await screen.findByRole('heading', { name: 'Tippstunde beendet' });
      expect(screen.getByText(/^Heute: \d+ % genau · \d+ Anschläge pro Minute$/)).toBeInTheDocument();
      expect(screen.getByText('Akt 1: 85 % genau · 22 Anschläge pro Minute')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Noch eine Runde/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Zum HQ/ })).toBeInTheDocument();
      expect(app.store.getState().current?.history.at(-1)?.kind).toBe('tippstunde');
      await app.press('{Enter}');
      expect(app.store.getState().screen).toMatchObject({ name: 'mission', lessonId: last, training: { kind: 'tippstunde' } });
    });

    it('Tippphase ohne Seitenleiste: es gibt keine Siegel, nur der Kopf wäre eine leere Spalte', async () => {
      const app = await start();
      const root = app.container.querySelector('.mission-screen');
      expect(root).toHaveClass('typing-phase');
      expect(root).not.toHaveClass('with-side');
    });

    it('Esc führt ins HQ', async () => {
      const app = await start();
      await app.type(currentText(app.container));
      await screen.findByRole('heading', { name: 'Tippstunde beendet' });
      await app.press('{Escape}');
      expect(app.store.getState().screen).toEqual({ name: 'hq' });
    });

    it('der Text enthält ganze Sätze aus der Geschichte', async () => {
      const sentence = 'das ist ein satz aus der geschichte.';
      const story = { ...STORY, scenes: [{ id: 'x', chat: 'kruemel' as const, trigger: { on: 'briefing' as const, lessonId: 'm1-l1' }, lines: [{ speaker: 'kruemel' as const, text: sentence }] }] };
      const app = await renderApp(undefined, { profiles: [profile({ lessons, exams, history: [{ ...history[0]!, apm: 300 }] })], select: 'p1', screen: { name: 'mission', lessonId: last, training }, story });
      expect(currentText(app.container)).toContain(sentence);
    });
  });

  it('Briefing im Chat: Auftrag starten öffnet erst den Funk, beim zweiten Mal direkt die Mission', async () => {
    const brief = sc('brief2', { on: 'briefing', lessonId: 'm1-l2' }, 'intern');
    const app = await renderApp(undefined, { profiles: [profile({ lessons: mastered('m1-l1') })], select: 'p1', story: story(brief) });
    await app.press('{Enter}'); // HQ: Auftrag starten
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: ['brief2'], then: { name: 'mission', lessonId: 'm1-l2' } });
    await app.finishChat();
    expect(screen.getByRole('button', { name: /Auftrag starten/ })).toBeInTheDocument();
    await app.press('{Enter}');
    expect(app.store.getState().screen.name).toBe('mission');
    await app.store.getState().beginLesson('m1-l2');
    expect(app.store.getState().screen).toEqual({ name: 'mission', lessonId: 'm1-l2' });
  });

  it('Extra-Fall: eine Trainingsrunde im Gewand des Falls, danach das Outro mit der Lösung als Karte', async () => {
    const training = { kind: 'case' as const, keys: ['s', 'l', 'j'], frame: 'Seifenblasen fangen', caseId: 'seifenblasen-brunnen' };
    const app = await renderApp(undefined, {
      profiles: [profile({ badges: { spielhalle: 1 }, lessons: mastered('m1-l1', 'm1-l2') })],
      select: 'p1',
      screen: { name: 'mission', lessonId: 'm1-l3', training },
      delay: 100,
    });
    expect(screen.getByText('› Seifenblasen fangen')).toBeInTheDocument();
    expect(app.container.querySelectorAll('.seal-bar .seal')).toHaveLength(2); // S und L (Siegel auch im Fall)
    // statt des Story-Objekts: das Bild des Falls und das Gadget, mit dem man ihn löst
    expect(screen.getByRole('img', { name: /Brunnen am Markt/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Buchstabenkescher' })).toBeInTheDocument();
    await app.type(currentText(app.container));
    await app.wait(50);
    await screen.findByRole('log'); // Funk mit dem Outro
    expect(app.store.getState().screen).toMatchObject({ name: 'funk', play: expect.arrayContaining(['case-seifenblasen-outro']) });
    await app.finishChat();
    expect(screen.getByText(/In den Blasen steht/)).toBeInTheDocument();
    expect(screen.getByText('TIPPNIX – BALD AUCH IN IHRER STADT')).toBeInTheDocument();
    expect(app.store.getState().current?.cases['seifenblasen-brunnen']).toBeDefined();
    expect(app.store.getState().current?.history.at(-1)?.kind).toBe('training');
  });
});
