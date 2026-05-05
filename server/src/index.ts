import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './db';
import routes from './routes';

async function main() {
  await initDb();

  const app = express();
  const PORT = process.env.PORT || 3021;

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [`http://localhost:${PORT}`, 'http://localhost:3020'];
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.use('/api', routes);

  // Serve static frontend in production
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Linky server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
