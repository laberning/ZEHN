// Story-Bildschirm: zeigt eine Szene und geht danach zum vorgemerkten Bildschirm.

import type { Screen } from '../../app/navigation.ts';
import { storyLines, type StoryRef } from '../../domain/book.ts';
import { ownedItems } from '../../domain/items.ts';
import { useActions, useGame, useProfile, useStoryTime, useStoryVars } from '../../ui/app/game.ts';
import { Dialog } from '../../ui/components/Dialog.tsx';

export function StoryScreen({ story, then }: { story: StoryRef; then: Screen }) {
  const p = useProfile();
  const { go } = useActions();
  const content = useGame((s) => s.story);
  const owned = ownedItems(p, content);
  const time = useStoryTime();
  const vars = useStoryVars(undefined, time);
  return <Dialog lines={storyLines(content, story)} vars={vars} avatar={p.avatar} context={{ owned, picks: p.story.picks, time }} onDone={() => go(then)} />;
}
