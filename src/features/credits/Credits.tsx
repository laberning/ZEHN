// Credits: wer hat was gemacht, unter welcher Lizenz.

import { creditSummary, CREDITS_INTRO, LICENSE_URLS, OTHER_CREDITS } from '../../content/credits.ts';
import lpc from '../../content/lpc.generated.json';
import { useActions, useGame } from '../../ui/app/game.ts';
import { BackButton } from '../../ui/components/common.tsx';
import { useKey } from '../../ui/hooks/useKey.ts';

function License({ name }: { name: string }) {
  const url = LICENSE_URLS[name];
  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      {name}
    </a>
  ) : (
    <span>{name}</span>
  );
}

const LPC_SUMMARY = creditSummary(lpc.credits);

export function Credits() {
  const current = useGame((s) => s.current);
  const { go } = useActions();
  const back = current ? ({ name: 'hq' } as const) : ({ name: 'profiles' } as const);
  useKey('Escape', () => go(back));
  return (
    <div className="screen credits">
      <BackButton to={back} label={current ? 'Zurück ins Hauptquartier' : 'Zurück'} />
      <h1>Credits</h1>

      <section>
        <h2>Idee und Geschichte</h2>
        <p>{CREDITS_INTRO}</p>
      </section>

      <section>
        <h2>Figuren: Liberated Pixel Cup (LPC)</h2>
        <p>
          Die Figuren sind aus Teilen des{' '}
          <a href="https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator" target="_blank" rel="noreferrer">
            Universal LPC Spritesheet Character Generator
          </a>{' '}
          zusammengesetzt und umgefärbt. Vielen Dank an alle Künstlerinnen und Künstler! Die zusammengesetzten Figuren stehen unter denselben Lizenzen wie die verwendeten Teile. Die vollständige Liste
          gibt es auch als{' '}
          <a href={`${import.meta.env.BASE_URL}assets/CREDITS.csv`} download>
            CREDITS.csv
          </a>
          .
        </p>
        {/* Die vielen Einzelteile stecken in einer Box zum Aufklappen (details: per Tastatur und Screenreader bedienbar) */}
        <details className="credit-group">
          <summary>
            <span className="credit-group-title">Alle Grafikteile der Figuren</span>
            <span className="muted">
              {LPC_SUMMARY.parts} Teile von {LPC_SUMMARY.authors} Künstlerinnen und Künstlern · Lizenzen: {LPC_SUMMARY.licenses.join(', ')}
            </span>
          </summary>
          <div className="credit-list">
            {lpc.credits.map((c) => (
              <div key={`${c.file}|${c.authors.join()}`} className="credit">
                <b>{c.usedBy.join(', ')}</b>
                <span className="muted">{c.file}</span>
                <span>{c.authors.join(', ')}</span>
                <span className="licenses">
                  Lizenz:{' '}
                  {c.licenses.map((l, i) => (
                    <span key={l}>
                      {i > 0 && ' / '}
                      <License name={l} />
                    </span>
                  ))}
                </span>
                <span className="sources">
                  {c.urls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer">
                      Quelle {i + 1}
                    </a>
                  ))}
                </span>
                {c.notes && <small className="muted">{c.notes}</small>}
              </div>
            ))}
          </div>
        </details>
      </section>

      <section>
        <h2>Weitere Grafiken, Schriften und Software</h2>
        <ul className="other-credits">
          {OTHER_CREDITS.map((o) => (
            <li key={o.what}>
              <a href={o.url} target="_blank" rel="noreferrer">
                {o.what}
              </a>{' '}
              – {o.who} ·{' '}
              {LICENSE_URLS[o.license] ? (
                <a href={LICENSE_URLS[o.license]} target="_blank" rel="noreferrer">
                  {o.license}
                </a>
              ) : (
                o.license
              )}
              {o.changes && <small className="muted"> ({o.changes})</small>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
