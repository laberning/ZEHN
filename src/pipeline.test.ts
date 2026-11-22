// Pipeline-Regeln prüfen: Workflow, Node-Version, Veröffentlichung (siehe docs/technik/pipeline.md, ADR-0007),
// dazu die Issue-Vorlagen, die zu docs/spiel/rueckmeldung.md passen.
// Workflow und Vorlagen werden als Text gelesen und mit einfachen Mustern geprüft; es gibt keine YAML-Abhängigkeit.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACTS } from './content/story/acts';
import { REPO_URL } from './content/texts/shell';

const ROOT = resolve(import.meta.dirname, '..');
const read = (path: string): string => readFileSync(resolve(ROOT, path), 'utf8');

const workflow = read('.github/workflows/ci.yml');

/** Der Text eines Jobs: von „  name:“ bis zum nächsten Job auf der gleichen Ebene */
function job(name: string): string {
  const start = workflow.search(new RegExp(`^  ${name}:\\s*$`, 'm'));
  expect(start, `Job ${name} fehlt`).toBeGreaterThanOrEqual(0);
  const rest = workflow.slice(start + 1);
  const next = rest.search(/^ {2}[a-z0-9_-]+:\s*$/m);
  return next < 0 ? rest : rest.slice(0, next);
}

const JOBS = ['check', 'e2e', 'build', 'deploy'];

describe('Node-Version', () => {
  const nvmrc = read('.nvmrc').trim();
  const engines = (JSON.parse(read('package.json')) as { engines: { node: string } }).engines.node;

  it('.nvmrc nennt eine Hauptversion', () => {
    expect(nvmrc).toMatch(/^\d+$/);
  });

  it('engines.node verlangt dieselbe Hauptversion', () => {
    expect(engines).toBe(`>=${nvmrc}`);
  });
});

describe('Workflow ci.yml', () => {
  it('läuft bei Push und Pull Request auf main und auf Knopfdruck', () => {
    expect(workflow).toMatch(/^on:\s*\n\s+push:\s*\n\s+branches: \[main\]\s*\n\s+pull_request:\s*\n\s+branches: \[main\]\s*\n\s+workflow_dispatch:/m);
  });

  it('hat oben nur Leserechte', () => {
    expect(workflow).toMatch(/^permissions:\s*\n\s+contents: read\s*$/m);
    expect(workflow.match(/^permissions:/gm)).toHaveLength(1);
  });

  it('hat genau die vier Jobs', () => {
    const jobsSection = workflow.slice(workflow.search(/^jobs:\s*$/m));
    const names = [...jobsSection.matchAll(/^ {2}([a-z0-9_-]+):\s*$/gm)].map((m) => m[1]);
    expect(names).toEqual(JOBS);
  });

  it('nutzt überall den festen Runner ubuntu-26.04', () => {
    expect(workflow).not.toMatch(/ubuntu-latest/);
    for (const name of JOBS) expect(job(name)).toMatch(/runs-on: ubuntu-26\.04\s*$/m);
  });

  it('holt Node aus .nvmrc und nutzt keine feste Version', () => {
    for (const name of ['check', 'e2e', 'build']) {
      const text = job(name);
      expect(text).toContain('actions/setup-node@v');
      expect(text).toContain('node-version-file: .nvmrc');
      expect(text).toContain('npm ci');
    }
    expect(workflow).not.toMatch(/node-version:/);
  });

  it('nutzt Actions nur mit Hauptversion', () => {
    const uses = [...workflow.matchAll(/uses: (\S+)/g)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    for (const u of uses) expect(u).toMatch(/^actions\/[a-z-]+@v\d+$/);
  });

  it('führt die drei npm-Befehle aus', () => {
    expect(job('check')).toMatch(/run: npm run check\s*$/m);
    expect(job('build')).toMatch(/run: npm run build\s*$/m);
    expect(job('e2e')).toMatch(/run: npm run e2e\s*$/m);
    expect(job('e2e')).toContain('npx playwright install --with-deps chromium');
  });

  it('lässt in der Pipeline kein vergessenes test.only zu', () => {
    expect(read('playwright.config.ts')).toMatch(/forbidOnly: !!process\.env\.CI/);
  });

  it('lädt den Playwright-Bericht nur bei einem Fehler hoch', () => {
    const text = job('e2e');
    expect(text).toMatch(/if: failure\(\)/);
    expect(text).toContain('actions/upload-artifact@v');
    expect(text).toContain('playwright-report/');
    expect(text).toContain('test-results/');
  });

  it('lädt dist/ für Pages hoch', () => {
    const text = job('build');
    expect(text).toContain('actions/upload-pages-artifact@v');
    expect(text).toMatch(/path: dist\s*$/m);
  });

  describe('Veröffentlichen', () => {
    const text = job('deploy');

    it('wartet auf alle Prüf-Jobs', () => {
      expect(text).toMatch(/needs: \[check, e2e, build\]/);
    });

    it('läuft nur auf main und nie bei Pull Requests', () => {
      expect(text).toMatch(/^ {4}if: github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'\s*$/m);
    });

    it('hat die Pages-Rechte nur hier und stellt Deploys in eine Schlange', () => {
      expect(text).toMatch(/pages: write/);
      expect(text).toMatch(/id-token: write/);
      expect(workflow.match(/pages: write/g)).toHaveLength(1);
      expect(workflow.match(/id-token: write/g)).toHaveLength(1);
      expect(text).toMatch(/group: pages/);
      expect(text).toMatch(/cancel-in-progress: false/);
    });

    it('nutzt die Umgebung github-pages und deploy-pages', () => {
      expect(text).toContain('name: github-pages');
      expect(text).toContain('url: ${{ steps.deployment.outputs.page_url }}');
      expect(text).toContain('actions/deploy-pages@v');
    });
  });
});

// Issue-Vorlagen

const DIR = '.github/ISSUE_TEMPLATE';

const FORMS = {
  'fehler.yml': { name: 'Etwas funktioniert nicht', title: 'Fehler: ' },
  'rueckmeldung.yml': { name: 'Rückmeldung zum Spiel', title: 'Rückmeldung: ' },
};

const feedbackDoc = read('docs/spiel/rueckmeldung.md');

describe.each(Object.entries(FORMS))('Vorlage %s', (file, form) => {
  const text = read(`${DIR}/${file}`);

  it('hat Name, Beschreibung, Titel und Felder', () => {
    expect(text).toMatch(new RegExp(`^name: ${form.name}$`, 'm'));
    expect(text).toMatch(/^description: \S/m);
    expect(text).toMatch(new RegExp(`^title: "${form.title}"$`, 'm'));
    expect(text).toMatch(/^body:$/m);
  });

  it('bittet wie die Rückmeldungsseite um keine Spielstände und persönlichen Daten', () => {
    expect(feedbackDoc).toContain('keine Spielstände und keine persönlichen Daten');
    expect(text).toContain('keine Spielstände und keine persönlichen Daten');
  });

  it('hat eindeutige Feld-IDs und mindestens ein Pflichtfeld', () => {
    const ids = [...text.matchAll(/^ {4}id: (\S+)$/gm)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    expect(text).toMatch(/required: true/);
  });

  it('wird auf der Rückmeldungsseite genannt', () => {
    expect(feedbackDoc).toContain(`„${form.name}“`);
  });
});

describe('Fehler-Vorlage', () => {
  it('fragt nach dem, was die Rückmeldungsseite für einen Fehler nennt', () => {
    const text = read(`${DIR}/fehler.yml`);
    for (const label of ['Was hast du gemacht?', 'Was ist passiert?', 'Was hast du stattdessen erwartet?', 'Browser und Gerät']) {
      expect(text).toContain(`label: ${label}`);
    }
  });
});

describe('Rückmeldungs-Vorlage', () => {
  it('bietet die Anlässe der Rückmeldungsseite zur Auswahl', () => {
    const text = read(`${DIR}/rueckmeldung.yml`);
    for (const option of ['Ich bin bis zum Ende gekommen', 'Eine Stelle ist unklar oder langweilig', 'Etwas hat mir besonders gefallen']) {
      expect(text).toContain(`- ${option}`);
    }
  });

  it('nennt jeden Akt mit seinem Titel', () => {
    const text = read(`${DIR}/rueckmeldung.yml`);
    const acts = [...text.matchAll(/^ {8}- (Akt \d+ – .+)$/gm)].map((m) => m[1] ?? '');
    expect(acts).toHaveLength(ACTS.length);
    ACTS.forEach((act, i) => {
      expect(acts[i]?.startsWith(`Akt ${i + 1} – ${act.module.title}`), acts[i]).toBe(true);
    });
  });
});

describe('Auswahlseite config.yml', () => {
  const text = read(`${DIR}/config.yml`);

  it('verlinkt nur Spieler-Dokumente dieses Repositorys, die es gibt', () => {
    const urls = [...text.matchAll(/url: (\S+)/g)].map((m) => m[1] ?? '');
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith(`${REPO_URL}/blob/main/docs/spiel/`)).toBe(true);
      expect(existsSync(resolve(ROOT, url.slice(`${REPO_URL}/blob/main/`.length))), url).toBe(true);
    }
  });
});
