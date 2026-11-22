import { cleanup, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { StoryObject as StoryObjectData } from '../../domain/storyObject.ts';
import { profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { OBJECTS } from '../../test/content.ts';
import { StoryObject } from './StoryObject.tsx';

const ausweis: StoryObjectData = {
  lessonId: 'x',
  title: 'Ausweis',
  kind: 'idcard',
  stages: [
    { at: 0, card: [] },
    { at: 0.5, card: ['kopf', 'foto'] },
    { at: 1, card: ['kopf', 'foto', 'name', 'stempel'] },
  ],
};
const vars = { agent: 'Agentin', codename: 'Funkstille-92' };
const show = (percent: number) => renderApp(<StoryObject object={ausweis} percent={percent} vars={vars} />, { profiles: [profile({ id: 'p1' })], select: 'p1' });

describe('Story-Objekt Agentenausweis', () => {
  it('0 %: der Drucker wärmt sich auf, noch kein Foto', async () => {
    await show(0);
    expect(screen.getByText('Drucker wärmt sich auf …')).toBeInTheDocument();
    expect(screen.queryByTestId('lpc-sprite')).not.toBeInTheDocument();
  });
  it('bei 50 %: Kopf und Foto, noch kein Name', async () => {
    await show(0.5);
    expect(screen.getByText('ZEHN · Agentenausweis')).toBeInTheDocument();
    expect(screen.getByTestId('lpc-sprite')).toHaveTextContent('Avatar');
    expect(screen.queryByText('Agentin Funkstille-92')).not.toBeInTheDocument();
  });
  it('fertig: Name und Stempel mit Adas Brezel', async () => {
    await show(1);
    expect(screen.getByText('Agentin Funkstille-92')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Brezel' })).toBeInTheDocument();
  });
});

describe('Story-Objekt Goldrand-Karte', () => {
  const karte: StoryObjectData = {
    lessonId: 'y',
    title: 'Rückseite',
    kind: 'lines',
    look: 'goldcard',
    stages: [
      { at: 0, lines: ['B▒▒ v▒▒'], marks: ['krone'] },
      { at: 1, lines: ['Baron'], marks: ['krone'], watermark: true },
    ],
  };
  it('unlesbare Buchstaben sind Tintenkleckse, Krone und Wasserzeichen sind Bilder', async () => {
    const app = await renderApp(<StoryObject object={karte} percent={0} />);
    expect(app.container.querySelectorAll('.ink-blot')).toHaveLength(4);
    expect(app.container.textContent).not.toContain('▒');
    expect(screen.getByRole('img', { name: 'Krone' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Brezel' })).not.toBeInTheDocument();
  });
});

describe('Story-Objekt mit Kleingedrucktem', () => {
  const plakat: StoryObjectData = { lessonId: 'z', title: 'Plakat', kind: 'lines', stages: [{ at: 0, lines: ['GROSSE', 'Unterzeichnet', 'Ausgenommen: ich.'], finePrint: 1 }] };
  it('nur die letzten Zeilen (finePrint) tragen die Klasse für den Kleindruck', async () => {
    const app = await renderApp(<StoryObject object={plakat} percent={0} />);
    const lines = [...app.container.querySelectorAll('.so-lines p')];
    expect(lines.map((p) => p.classList.contains('so-fine'))).toEqual([false, false, true]);
    expect(lines.at(-1)!.textContent).toBe('Ausgenommen: ich.');
  });
});

describe('Story-Objekte von Akt 2', () => {
  const objects = OBJECTS.filter((o) => o.lessonId.startsWith('m2-'));
  it('jede Stufe jedes Bild-Objekts zeigt ein Bild mit Titel', async () => {
    for (const o of objects.filter((x) => x.kind === 'picture')) {
      for (const st of o.stages) {
        const app = await renderApp(<StoryObject object={o} percent={st.at} />);
        expect(app.container.querySelector('svg[role="img"]')?.getAttribute('aria-label'), `${o.lessonId} ${st.at}`).toBeTruthy();
        app.unmount();
      }
    }
  });
  it('die Wettertafel zeigt zuerst HEI ER, am Ende HEITER BIS WOLKIG · ZWEI GRAD', async () => {
    const tafel = objects.find((o) => o.lessonId === 'm2-l3')!;
    const app = await renderApp(<StoryObject object={tafel} percent={0} />);
    expect(app.container.textContent).toContain('HEI ER BIS WOLKIG');
    app.unmount();
    const fertig = await renderApp(<StoryObject object={tafel} percent={1} />);
    expect(fertig.container.textContent).toContain('HEITER BIS WOLKIG · ZWEI GRAD');
  });
  // Die Schrift der Stufenbilder ist Pixelschrift in der Zeichen-Karte; lesbar ist sie für Screenreader über den Titel
  const label = (c: HTMLElement) => c.querySelector('svg[role="img"]')!.getAttribute('aria-label');
  it('das Peilgerät nennt erst bei 100 % den alten Sendeturm; die Route ist bei 0 % noch nicht gezeichnet', async () => {
    const peil = objects.find((o) => o.lessonId === 'm2-l1')!;
    const halb = await renderApp(<StoryObject object={peil} percent={0.75} />);
    expect(label(halb.container)).toBe('Peilgerät: 3 von 3 Türmen gehört');
    halb.unmount();
    const ganz = await renderApp(<StoryObject object={peil} percent={1} />);
    expect(label(ganz.container)).toBe('Peilgerät: der alte Sendeturm flüstert');
    ganz.unmount();
    const route = objects.find((o) => o.lessonId === 'm2-l5')!;
    const leer = await renderApp(<StoryObject object={route} percent={0} />);
    expect(label(leer.container)).toBe('Die Route des Pizzaroboters, noch nicht ganz gezeichnet');
    leer.unmount();
  });
  it('die O-Schilder behalten das Ortsschild KUR RT, auch ganz am Ende', async () => {
    const o = objects.find((x) => x.lessonId === 'm2-l4')!;
    const app = await renderApp(<StoryObject object={o} percent={1} />);
    expect(label(app.container)).toBe('Die O-Schilder: BROT, POST, HOTEL, nur das Ortsschild bleibt KUR RT');
  });
});

describe('Story-Objekt Ortruds Schlüsselkarte', () => {
  const objekt = OBJECTS.find((o) => o.lessonId === 'm3-l2')!;
  const show = (percent: number) => renderApp(<StoryObject object={objekt} percent={percent} />, { profiles: [profile({ id: 'p1' })], select: 'p1' });

  it('0 %: leer, Code gelöscht, noch kein Foto, das Logo nur blass', async () => {
    const app = await show(0);
    expect(app.container.querySelector('.so-logo.so-faint')).toHaveTextContent('O.');
    expect(screen.getByText('Karte leer. Code gelöscht.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Foto fehlt' })).toBeInTheDocument();
    expect(screen.queryByText('ORTRUD P.')).not.toBeInTheDocument();
  });

  it('25 %: Ortruds Foto; 50 %: „O.“-Logo und Name; noch kein Code', async () => {
    const before = await show(0.25);
    expect(screen.getByRole('img', { name: 'Foto: Ortrud' })).toBeInTheDocument();
    expect(before.container.querySelector('.so-logo.so-faint')).not.toBeNull();
    cleanup();
    const after = await show(0.5);
    expect(after.container.querySelector('.so-logo:not(.so-faint)')).toHaveTextContent('O.');
    expect(screen.getByText('ORTRUD P.')).toBeInTheDocument();
    expect(screen.queryByText('ZUTRITT: S.')).not.toBeInTheDocument();
  });

  it('Ortruds Foto ist ihr Porträt (16×16), klein und groß ganzzahlig vergrößert', async () => {
    for (const big of [false, true]) {
      await renderApp(<StoryObject object={objekt} percent={0.25} big={big} />, { profiles: [profile({ id: 'p1' })], select: 'p1' });
      const foto = screen.getByRole('img', { name: 'Foto: Ortrud' });
      expect(foto.getAttribute('viewBox')).toBe('0 0 16 16');
      expect(Number(foto.getAttribute('width')) % 16, `big=${big}`).toBe(0);
      cleanup();
    }
  });

  it('75 %: Code-Streifen halb geschrieben mit „ZUTRITT: S.“; fertig: Streifen komplett und Stempel „CODE BEREIT“', async () => {
    await show(0.75);
    expect(screen.getByText('ZUTRITT: S.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Code-Streifen halb geschrieben' })).toBeInTheDocument();
    expect(screen.queryByText('CODE BEREIT')).not.toBeInTheDocument();
    cleanup();
    await show(1);
    expect(screen.getByRole('img', { name: 'Code-Streifen komplett' })).toBeInTheDocument();
    expect(screen.getByText('CODE BEREIT')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Brezel' })).not.toBeInTheDocument();
  });
});
