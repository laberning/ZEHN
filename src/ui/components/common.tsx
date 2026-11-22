// Kleine, überall genutzte Bausteine.

import type { Screen } from '../../app/navigation.ts';
import { badgeTitleFor } from '../../content/texts/badges.ts';
import { GIFT_WAITING_TEXT } from '../../content/texts/items.ts';
import { giftWaiting } from '../../app/views/common.ts';
import { findBadge, isBadgeHidden, type BadgeRule } from '../../domain/badges.ts';
import type { RoundsSummary } from '../../domain/mission.ts';
import { rankName, rankProgress } from '../../domain/rewards.ts';
import { receivedItems } from '../../domain/items.ts';
import { useActions, useGame, useProfile } from '../app/game.ts';

export function Stars({ n, max = 3 }: { n: number; max?: number }) {
  return (
    <span className="stars" aria-label={`${n} von ${max} Sternen`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < n ? 'on' : 'off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function BadgePlate({ badge, earned, big }: { badge: BadgeRule; earned: boolean; big?: boolean }) {
  const hidden = isBadgeHidden(badge, earned);
  return (
    <div className={`badge ${earned ? 'earned' : 'locked'} cat-${badge.category} ${big ? 'big' : ''}`}>
      <div className="plate">{hidden ? '?' : badge.icon}</div>
      <div className="badge-text">
        <b>{badgeTitleFor(badge, earned)}</b>
        <small>{hidden ? 'Wird verraten, wenn du es hast.' : badge.description}</small>
      </div>
    </div>
  );
}

export function XpBar({ xp }: { xp: number }) {
  const ranks = useGame((s) => s.rules.rewards.ranks);
  const p = useProfile();
  const { rank, next, fraction } = rankProgress(xp, ranks);
  return (
    <div className="xp">
      <div className="xp-label">
        <b>{rankName(rank, p)}</b>
        <span>{next ? `${xp} / ${next.minXp} EP bis ${rankName(next, p)}` : `${xp} EP – höchster Rang!`}</span>
      </div>
      <div className="bar">
        <div style={{ width: `${fraction * 100}%` }} />
      </div>
    </div>
  );
}

export function Meter({ value, label }: { value: number; label?: string }) {
  return (
    <div className="meter" title={label}>
      <div style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}

/** Großer, gut sichtbarer Zurück-Knopf (Esc macht dasselbe, wo es eingebaut ist) */
export function BackButton({ to = { name: 'hq' }, label = 'Zurück ins Hauptquartier', onClick }: { to?: Screen; label?: string; onClick?: () => void }) {
  const { go } = useActions();
  return (
    <button className="back-btn" onClick={onClick ?? (() => go(to))}>
      <span className="arrow">◀</span> {label} <kbd>Esc</kbd>
    </button>
  );
}

/** Belohnungen einer Runde, eines Einsatzes oder eines Spiels: Rang, Rekord, Abzeichen, neue Garderobe-Teile */
export function RewardSummary({ reward }: { reward: Pick<RoundsSummary, 'newBadges' | 'rankUp' | 'newRecord'> & { received?: readonly string[] } }) {
  const all = useGame((s) => s.rules.badges);
  const items = useGame((s) => s.story.items);
  const badges = reward.newBadges.map((id) => findBadge(all, id)).filter((b): b is BadgeRule => !!b);
  // nur, was wirklich überreicht wurde (ein Abzeichen allein bringt das Ding noch nicht)
  const { cloth, gadgets } = receivedItems(reward.received ?? [], items);
  // verdient, aber noch nicht überreicht: höchstens ein Geschenk je Durchgang
  const waiting = useGame((s) => !!s.current && giftWaiting(s.current, s.rules, s.story));
  const p = useProfile();
  return (
    <>
      {reward.rankUp && <p className="rankup">Beförderung! Neuer Rang: {rankName(reward.rankUp, p)}</p>}
      {reward.newRecord && <p className="rankup">Neuer persönlicher Rekord!</p>}
      {badges.length > 0 && (
        <div className="new-badges">
          <h2>Neue Abzeichen</h2>
          {badges.map((b) => (
            <BadgePlate key={b.id} badge={b} earned big />
          ))}
        </div>
      )}
      {cloth.length > 0 && <p className="rankup">Neu in der Garderobe: {cloth.map((i) => i.name).join(', ')}!</p>}
      {gadgets.length > 0 && <p className="rankup">Neu im Koffer: {gadgets.map((i) => i.name).join(', ')}!</p>}
      {waiting && <p className="muted">{GIFT_WAITING_TEXT}</p>}
    </>
  );
}
