// Funk: Chatnamen, Gesichter, Trennzeilen, Hinweis unter Antworten.

import type { ChatId, Speaker } from '../../domain/dialog.ts';
import { SPEAKER_NAMES } from './speakers.ts';

/** Name eines Chats in der Chatliste */
export const CHAT_TITLES: Record<ChatId, string> = {
  intern: 'ZEHN intern',
  kruemel: 'Krümel',
  fluestern: 'Qwertz-Flüstern',
  juna: 'Juna',
};

/** Zweite Zeile im Kopf eines Chats, solange niemand tippt */
export const CHAT_SUBTITLES: Record<ChatId, string> = {
  intern: 'Das Team · streng geheim',
  kruemel: 'Privatchat',
  fluestern: 'Gerüchte aus Bad Qwertz',
  juna: 'Privatchat',
};

/** Wer im Kopf eines Chats und in der Chatliste als Bild erscheint */
export const CHAT_FACES: Record<ChatId, Speaker> = { intern: 'ada', kruemel: 'kruemel', fluestern: 'juna', juna: 'juna' };

/** Trennzeile, wenn beim Abspielen ein Beitrag in einen anderen Chat gehört */
export const CHAT_DIVIDERS: Record<ChatId, string> = {
  intern: 'ZEHN intern',
  kruemel: 'Krümel (privat)',
  fluestern: 'Qwertz-Flüstern',
  juna: 'Juna (privat)',
};

/** Unter den Antworten im Bilderbuch und im Funk */
export const CHOICE_HINT = 'Zahl drücken – oder mit ↑ ↓ wählen und Enter';

/** Hinweis in der Nachbesprechung, wenn es nur eine Nebenszene gibt: wer hat geschrieben? */
export function sideHint(chat: ChatId, sender: Speaker): string {
  if (chat === 'kruemel' || chat === 'juna') return `${SPEAKER_NAMES[chat]} hat dir geschrieben`;
  if (chat === 'fluestern') return `Neues im ${CHAT_TITLES.fluestern}`;
  return `${SPEAKER_NAMES[sender === 'ada' ? 'ada' : 'kruemel']} hat in ${CHAT_TITLES.intern} geschrieben`;
}
