import { beforeAll, afterAll } from 'vitest';
import { initDb } from '../src/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

const TEST_DATA_DIR = path.join(os.tmpdir(), 'linky-test');

beforeAll(async () => {
  await initDb();
});

afterAll(() => {
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
});
