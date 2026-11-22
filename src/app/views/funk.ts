// Ansicht des Agentenfunks: Chatliste mit ungelesenen Szenen und Vorschau.

import type { Profile } from '../../domain/profile.ts';
import { unread } from '../../domain/story.ts';
import type { StoryContent } from '../../domain/storyContent.ts';
import type { TimeInfo } from '../../domain/daytime.ts';
import { chatList, chatPreview, type ChatMessage } from '../../domain/chat.ts';
import type { ChatId } from '../../domain/dialog.ts';

export interface FunkChat {
  id: ChatId;
  /** ungelesene Szenen */
  unread: number;
  /** Neues zuerst, sonst die letzte Nachricht */
  preview: ChatMessage | null;
}

/** Chatliste des Agentenfunks */
export function funkChats(p: Profile, story: Pick<StoryContent, 'scenes'>, time?: TimeInfo): FunkChat[] {
  return chatList(p, story, time).map((id) => ({ id, unread: unread(p, story, id).length, preview: chatPreview(p, story, id, time) }));
}
