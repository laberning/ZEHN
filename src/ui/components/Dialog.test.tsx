import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { defaultAvatar } from '../../content/wardrobe.ts';
import type { Line } from '../../domain/dialog.ts';
import { renderApp } from '../../test/renderApp.tsx';
import { Dialog } from './Dialog.tsx';

const lines: Line[] = [
  {
    speaker: 'ada',
    text: 'Bist du bereit?',
    choices: [
      { id: 'ja', label: 'Ja', text: 'Ja, klar!' },
      { id: 'nein', label: 'Nein', text: 'Nein, danke.' },
    ],
  },
  { speaker: 'kruemel', text: 'Los gehts.' },
];

const open = (onDone = vi.fn()) => renderApp(<Dialog lines={lines} vars={{}} avatar={defaultAvatar('w')} onDone={onDone} />);

describe('Bilderbuch-Dialog', () => {
  it('ein Klick auf die eingeblendete Tastatur blättert nicht weiter', async () => {
    const withKeys: Line[] = [{ speaker: 'ada', text: 'F und J.', keys: ['KeyF', 'KeyJ'] }, { speaker: 'ada', text: 'Weiter so.' }];
    const app = await renderApp(<Dialog lines={withKeys} vars={{}} avatar={defaultAvatar('w')} onDone={vi.fn()} />);
    await app.wait(500); // Zeile ganz geschrieben, Tastatur sichtbar
    fireEvent.click(app.container.querySelector('.dialog-keys')!);
    expect(screen.getByText('F und J.')).toBeInTheDocument();
    fireEvent.click(app.container.querySelector('.dialog-box')!);
    await app.wait(500);
    expect(screen.getByText('Weiter so.')).toBeInTheDocument();
  });
  it('setzt den Pixelmaßstab für die Bühne am Dialog selbst', async () => {
    const app = await open();
    expect((app.container.querySelector('.vn') as HTMLElement).style.getPropertyValue('--px')).toMatch(/^\d+(\.\d+)?px$/);
  });
  it('die Box behält ihre Struktur beim Wechsel von Text zu Antworten; Bedienung bleibt', async () => {
    const app = await open();
    const box = app.container.querySelector('.dialog-box')!;
    expect(box.querySelector('.dialog-foot')).not.toBeNull();
    await app.press('{Enter}'); // Antworten erscheinen
    expect(app.container.querySelector('.dialog-box')).toBe(box); // dieselbe Box, nicht neu gebaut
    expect(box.querySelector('.dialog-foot')).toBeNull();
    expect(box.querySelectorAll('.choice')).toHaveLength(2);
    await app.wait(500);
    await app.user.keyboard('2');
    expect(await app.dialogText()).toContain('Nein, danke.');
    expect(app.container.querySelector('.dialog-box')).toBe(box);
  });
  it('zeigt „Weiter“ nur einmal – als Knopf mit Enter-Zeichen', async () => {
    await open();
    expect(screen.getAllByText(/weiter/i)).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Weiter ⏎' })).toBeInTheDocument();
  });
  it('erscheinen Antworten, wählt ein schnelles zweites Enter keine ungesehene Antwort', async () => {
    const app = await open();
    await app.press('{Enter}'); // Text sofort ganz zeigen – die Antworten erscheinen
    await app.user.keyboard('{Enter}'); // sofort hinterher: zu schnell
    expect(screen.getByRole('button', { name: /Nein/ })).toBeInTheDocument();
    expect(screen.queryByText('Ja, klar!')).toBeNull();
    await app.press('{Enter}'); // mit Pause: wählt die markierte
    expect(await app.dialogText()).toContain('Ja, klar!');
  });

  it('Zifferntasten: nicht gleich nach dem Erscheinen, nicht gehalten; Pfeile scrollen die Seite nicht', async () => {
    const app = await open();
    await app.press('{Enter}');
    await app.user.keyboard('2'); // zu schnell
    expect(screen.getByRole('button', { name: /Nein/ })).toBeInTheDocument();
    await app.wait(500);
    const held = new KeyboardEvent('keydown', { key: '2', repeat: true, bubbles: true });
    window.dispatchEvent(held);
    await app.wait(0);
    expect(screen.getByRole('button', { name: /Nein/ })).toBeInTheDocument();
    expect(fireEvent.keyDown(window, { key: 'ArrowDown' })).toBe(false); // preventDefault
    expect(screen.getByRole('button', { name: /Nein/ })).toHaveClass('picked');
    await app.user.keyboard('2');
    expect(await app.dialogText()).toContain('Nein, danke.');
  });

  it('Juna und Benno stehen als Figuren auf der Bühne, wenn sie sprechen', async () => {
    const duo: Line[] = [
      { speaker: 'juna', text: 'ICH BIN IM BILDERBUCH.' },
      { speaker: 'benno', text: 'Ohne Hut.' },
    ];
    const app = await renderApp(<Dialog lines={duo} vars={{}} avatar={defaultAvatar('w')} onDone={vi.fn()} />);
    expect(app.container.querySelector('.actor-juna')).toHaveTextContent('Juna');
    expect(app.container.querySelector('.actor-juna')).toHaveClass('active');
    expect(app.container.querySelector('.actor-benno')).toBeNull(); // Benno spricht erst in der zweiten Zeile
    await app.wait(500); // Zeile ganz geschrieben
    await app.press('{Enter}'); // weiter
    expect(app.container.querySelector('.actor-benno')).toHaveTextContent('Benno');
    expect(app.container.querySelector('.actor-benno')).toHaveClass('active');
    expect(app.container.querySelector('.actor-juna')).toHaveClass('dim');
    expect(app.container.querySelector('.dialog-box')).toHaveClass('speaker-benno');
  });
});
