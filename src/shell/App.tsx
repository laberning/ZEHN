// App-Schale: setzt die Features zusammen – Hintergrund-Szene und der Bildschirm, den die Navigation vorgibt.

import { useEffect, type ComponentType } from 'react';
import { PUBLIC_SCREENS, type ScreenName } from '../app/navigation.ts';
import { LOAD_ERROR_TEXTS, LOADING_TEXT, SAVE_FAILED_TEXT } from '../content/texts/shell.ts';
import type { SceneName } from '../domain/dialog.ts';
import type { ArcadeGame } from '../domain/profile.ts';
import { Akte } from '../features/akte/Akte.tsx';
import { Regen } from '../features/arcade/Regen.tsx';
import { Tresor } from '../features/arcade/Tresor.tsx';
import { Badges } from '../features/badges/Badges.tsx';
import { Credits } from '../features/credits/Credits.tsx';
import { EndScreen } from '../features/ende/EndScreen.tsx';
import { Exam } from '../features/exam/Exam.tsx';
import { Fallakte } from '../features/fallakte/Fallakte.tsx';
import { FunkScreen } from '../features/funk/FunkScreen.tsx';
import { HQ } from '../features/hq/HQ.tsx';
import { Mission } from '../features/mission/Mission.tsx';
import { Create } from '../features/profiles/Create.tsx';
import { Profiles } from '../features/profiles/Profiles.tsx';
import { StoryScreen } from '../features/story/StoryScreen.tsx';
import { Wardrobe } from '../features/wardrobe/Wardrobe.tsx';
import { Scene } from '../ui/components/Scene.tsx';
import { usePixelScale } from '../ui/hooks/usePixelScale.ts';
import { useActions, useGame } from '../ui/app/game.ts';

/** Hintergrund je Bildschirm (Story-Szenen bringen ihren eigenen mit) */
const SCENES: Partial<Record<ScreenName, SceneName>> = {
  profiles: 'backstube',
  create: 'keller',
  funk: 'keller',
  hq: 'keller',
  mission: 'schreibtisch',
  exam: 'firewall',
  akte: 'schreibtisch',
  fallakte: 'schreibtisch',
  badges: 'keller',
  wardrobe: 'keller',
  credits: 'keller',
  ende: 'backstube',
  arcade: 'firewall',
};

/** Jedes Spielhallen-Spiel braucht einen Bildschirm (TypeScript prüft die Vollständigkeit) */
const ARCADE: Record<ArcadeGame, ComponentType> = { regen: Regen, tresor: Tresor };

export function App() {
  const screen = useGame((s) => s.screen);
  const screenId = useGame((s) => s.screenId);
  const hasProfile = useGame((s) => !!s.current);
  const saveFailed = useGame((s) => s.saveFailed);
  const { init } = useActions();
  usePixelScale();
  const loading = screen.name === 'loading';

  // Spielstände laden – nur einmal am Anfang (Tests können den Store schon vorbereitet übergeben)
  useEffect(() => {
    if (loading) void init();
  }, [loading, init]);

  if (!PUBLIC_SCREENS.includes(screen.name) && !hasProfile) return <Profiles />;
  const scene = SCENES[screen.name];
  return (
    <>
      {scene && <Scene name={scene} />}
      {saveFailed && (
        <p className="warn save-warn" role="alert">
          {SAVE_FAILED_TEXT}
        </p>
      )}
      <main key={screenId}>{content()}</main>
    </>
  );

  function content() {
    switch (screen.name) {
      case 'loading':
        return <div className="screen center muted">{LOADING_TEXT}</div>;
      case 'error':
        return (
          <div className="screen center">
            <h1>{LOAD_ERROR_TEXTS.title}</h1>
            <p className="warn" role="alert">
              {LOAD_ERROR_TEXTS.text}
            </p>
          </div>
        );
      case 'profiles':
        return <Profiles />;
      case 'create':
        return <Create />;
      case 'story':
        return <StoryScreen story={screen.story} then={screen.then} />;
      case 'funk':
        return <FunkScreen play={screen.play} chat={screen.chat} then={screen.then} label={screen.label} again={screen.again} />;
      case 'hq':
        return <HQ />;
      case 'mission':
        return <Mission lessonId={screen.lessonId} training={screen.training} />;
      case 'exam':
        return <Exam moduleId={screen.moduleId} />;
      case 'akte':
        return <Akte />;
      case 'fallakte':
        return <Fallakte moduleId={screen.moduleId} />;
      case 'badges':
        return <Badges />;
      case 'wardrobe':
        return <Wardrobe tab={screen.tab} />;
      case 'credits':
        return <Credits />;
      case 'ende':
        return <EndScreen />;
      case 'arcade': {
        const Game = ARCADE[screen.game];
        return <Game />;
      }
    }
  }
}
