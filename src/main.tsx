// Composition Root: hier – und nur hier – werden die echten Adapter mit dem Store verbunden.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/silkscreen/latin-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './ui/styles/index.css';
import { createGameStore } from './app/store.ts';
import { browserEnv } from './platform/browserEnv.ts';
import { dexieRepository } from './platform/dexieRepository.ts';
import { webAudioSound } from './platform/webAudioSound.ts';
import { App } from './shell/App.tsx';
import { GameProvider } from './ui/app/GameProvider.tsx';

const store = createGameStore({ repo: dexieRepository(), sound: webAudioSound, env: browserEnv });

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <GameProvider store={store}>
      <App />
    </GameProvider>
  </StrictMode>,
);
