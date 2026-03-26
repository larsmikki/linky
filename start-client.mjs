import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(join(__dirname, 'client'));
const vitePath = join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
await import(pathToFileURL(vitePath).href);
