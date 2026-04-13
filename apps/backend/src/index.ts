import { app } from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`CityLine backend disponivel em http://localhost:${env.PORT}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${env.PORT} ja esta em uso. Feche o processo anterior do backend ou altere PORT no ambiente.`);
    process.exit(1);
  }

  console.error('Nao foi possivel iniciar o backend.', error);
  process.exit(1);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
