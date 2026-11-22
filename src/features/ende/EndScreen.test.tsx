import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { COURSE } from '../../content/course.ts';
import { STORY_END_TEXTS } from '../../content/texts/ende.ts';
import { hasSeen, seenKey } from '../../domain/seen.ts';
import { masteredModule, profile } from '../../test/factories.ts';
import { renderApp } from '../../test/renderApp.tsx';

const last = COURSE.modules.at(-1)!.id;
const done = (outcome: 'passed' | 'backdoor') =>
  profile({ lessons: Object.assign({}, ...COURSE.modules.map((m) => masteredModule(COURSE, m.id))), exams: { [last]: { attempts: outcome === 'passed' ? 1 : 3, outcome } } });

describe('Spielende', () => {
  it('zeigt die Verabschiedung, den Satz außerhalb der Geschichte und die Liste; merkt sich das Öffnen', async () => {
    const app = await renderApp(undefined, { profiles: [done('passed')], select: 'p1', screen: { name: 'ende' } });
    expect(screen.getByRole('heading', { name: STORY_END_TEXTS.headline })).toBeInTheDocument();
    for (const l of STORY_END_TEXTS.story) expect(screen.getByText(l.text)).toBeInTheDocument();
    expect(screen.getByText(STORY_END_TEXTS.outside)).toBeInTheDocument();
    for (const t of STORY_END_TEXTS.todo) expect(screen.getByText(t)).toBeInTheDocument();
    expect(screen.queryByText(STORY_END_TEXTS.backdoor)).toBeNull();
    expect(hasSeen(app.store.getState().current!, seenKey.storyEnd(last))).toBe(true);
  });

  it('nach der Hintertür steht der Hinweis zum Nachholen; Enter führt ins HQ', async () => {
    const app = await renderApp(undefined, { profiles: [done('backdoor')], select: 'p1', screen: { name: 'ende' } });
    expect(screen.getByText(STORY_END_TEXTS.backdoor)).toBeInTheDocument();
    await app.press('{Enter}');
    expect(app.store.getState().screen).toEqual({ name: 'hq' });
  });

  it('ohne erreichtes Ende zurück ins HQ', async () => {
    const app = await renderApp(undefined, { profiles: [profile()], select: 'p1', screen: { name: 'ende' } });
    expect(app.store.getState().screen).toEqual({ name: 'hq' });
    expect(hasSeen(app.store.getState().current!, seenKey.storyEnd(last))).toBe(false);
  });
});
