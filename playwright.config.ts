import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PW_PORT || 5174);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error(`PW_PORT ist kein gültiger Port: ${process.env.PW_PORT}`);

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  // In der Pipeline (CI gesetzt) lässt ein vergessenes test.only den Lauf scheitern, statt Tests still auszulassen.
  forbidOnly: !!process.env.CI,
  // PW_HOST=<IP> testet über die Netzwerk-Adresse (keine "sichere Umgebung" wie localhost).
  // PW_PORT=<Port> weicht aus, wenn 5174 belegt ist (unter WSL teilt Windows den Portraum und vergibt
  // auch niedrige Ports als Quellports ausgehender Verbindungen).
  use: { baseURL: `http://${process.env.PW_HOST ?? 'localhost'}:${PORT}`, viewport: { width: 1280, height: 900 } },
  webServer: { command: `npx vite --port ${PORT} --strictPort --host`, port: PORT, reuseExistingServer: true },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
