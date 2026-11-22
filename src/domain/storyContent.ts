// Der Typ des Inhaltsbündels der Story (liegt im Store, siehe app/rules.ts). Nur Typ-Importe, damit
// story.ts, items.ts und cases.ts ihn teilen können, ohne sich im Kreis zu importieren.

import type { BookContent } from './book.ts';
import type { ExtraCase } from './cases.ts';
import type { Item } from './items.ts';
import type { StoryScene } from './scenes.ts';
import type { StoryObject } from './storyObject.ts';

/** Alles, was die Story an Inhalten braucht – liegt als Bündel im Store (siehe app/rules.ts) */
export interface StoryContent extends BookContent {
  /** Inhaltsversion: steigt, wenn neue Szenen dazukommen, die bei bestehenden Spielständen nicht auftauchen sollen */
  version: number;
  scenes: readonly StoryScene[];
  objects: readonly StoryObject[];
  /** Gadgets und Kleidung mit ihrer Quelle */
  items: readonly Item[];
  /** Extra-Fälle */
  cases: readonly ExtraCase[];
}
