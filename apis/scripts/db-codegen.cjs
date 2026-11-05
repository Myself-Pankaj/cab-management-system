const { spawnSync } = require('child_process');
const {
  loadEnvFile,
  assertDbEnv,
  mapDbEnvToPgEnv,
} = require('./load-env.cjs');

loadEnvFile();
assertDbEnv();
mapDbEnvToPgEnv();

const result = spawnSync(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['exec', 'pgtyped', '-c', 'pgtyped.config.json'],
  {
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32',
  },
);

process.exit(result.status ?? 1);
