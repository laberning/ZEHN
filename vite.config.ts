/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tests rechnen Tage und Datum in Ortszeit (dayKey, formatDate) – feste Zeitzone, damit sie überall gleich laufen.
// Hier gesetzt, bevor Vitest die Test-Prozesse startet (die erben die Umgebung).
if (process.env.VITEST) process.env.TZ = 'Europe/Berlin';

export default defineConfig({
  plugins: [react()],
  // Relative Pfade, damit der Build später auch unter GitHub Pages (Unterordner) läuft.
  base: './',
  build: {
    rolldownOptions: {
      output: {
        // Bibliotheken (React, Dexie, Zustand) in einen eigenen Chunk: Nach einem Update lädt der Browser nur den Spielteil neu.
        codeSplitting: { groups: [{ name: 'vendor', test: /node_modules/ }] },
      },
    },
  },
  test: {
    // vi.stubGlobal (z. B. confirm) nach jedem Test zurücksetzen
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
          // Stylesheets als Text lesen (`?raw`, Größen der Bild-Orte in ui/pixel/pictureKinds.test.ts); sonst liefert Vitest sie leer
          css: { include: [/src\/ui\/styles\/.+\.css/] },
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test/setup-dom.tsx'],
          // Lange Bildschirm-Tests brauchen auf einer ruhigen Maschine bis 2 s; laufen mehrere Checks gleichzeitig,
          // reißen sie die üblichen 5 s. Großzügig, damit Last allein keinen Test scheitern lässt.
          testTimeout: 20_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/**/*.generated.json'],
      thresholds: {
        'src/domain/**': { lines: 90, branches: 80 },
        'src/app/**': { lines: 85 },
      },
    },
  },
});
