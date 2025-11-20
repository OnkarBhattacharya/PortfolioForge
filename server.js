// server.js
import './src/telemetry/init'; // Initialize telemetry before Next.js starts

import { createServer } from 'http';
import next from 'next';

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
});
