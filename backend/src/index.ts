import { createApp } from './app';
import { config } from './config';
import { runMigrations, waitForDb } from './db/pool';

async function main() {
  await waitForDb();
  await runMigrations();

  const app = createApp();
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`API listening on http://0.0.0.0:${config.port}`);
    console.log(`PUBLIC_BASE_URL=${config.publicBaseUrl}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
