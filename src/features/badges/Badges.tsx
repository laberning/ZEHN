import { BADGE_CATEGORIES } from '../../content/texts/badges.ts';
import { useActions, useGame, useProfile } from '../../ui/app/game.ts';
import { BackButton, BadgePlate } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';

export function Badges() {
  const p = useProfile();
  const badges = useGame((s) => s.rules.badges);
  const { go } = useActions();
  useKey('Escape', () => go({ name: 'hq' }));
  return (
    <div className="screen">
      <BackButton />
      <h1>
        Abzeichen <small className="muted">{Object.keys(p.badges).length} / {badges.length}</small>
      </h1>
      {BADGE_CATEGORIES.map((c) => (
        <section key={c.id}>
          <h2>{c.title}</h2>
          <div className="badge-grid">
            {badges.filter((b) => b.category === c.id).map((b) => (
              <BadgePlate key={b.id} badge={b} earned={!!p.badges[b.id]} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
