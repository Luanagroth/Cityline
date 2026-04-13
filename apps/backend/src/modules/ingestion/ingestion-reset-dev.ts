import { prisma } from '../../shared/database/prisma.js';

interface DeleteSummary {
  favorites: number;
  stopTimePredictions: number;
  routePaths: number;
  schedules: number;
  lineStops: number;
  routeDirections: number;
  fares: number;
  transportLines: number;
  stops: number;
}

interface ResetTransactionClient {
  favorite: { deleteMany(args: object): Promise<{ count: number }> };
  stopTimePrediction?: { deleteMany(args: object): Promise<{ count: number }> };
  routePath: { deleteMany(args: object): Promise<{ count: number }> };
  schedule: { deleteMany(args: object): Promise<{ count: number }> };
  lineStop: { deleteMany(args: object): Promise<{ count: number }> };
  routeDirection: { deleteMany(args: object): Promise<{ count: number }> };
  fare: { deleteMany(args: object): Promise<{ count: number }> };
  transportLine: { deleteMany(args: object): Promise<{ count: number }> };
  stop: { deleteMany(args: object): Promise<{ count: number }> };
}

const main = async () => {
  const summary = await prisma.$transaction(async (transaction) => {
    const client = transaction as unknown as ResetTransactionClient;
    const favorites = await client.favorite.deleteMany({});
    const stopTimePredictions = client.stopTimePrediction
      ? await client.stopTimePrediction.deleteMany({})
      : { count: 0 };
    const routePaths = await client.routePath.deleteMany({});
    const schedules = await client.schedule.deleteMany({});
    const lineStops = await client.lineStop.deleteMany({});
    const routeDirections = await client.routeDirection.deleteMany({});
    const fares = await client.fare.deleteMany({});
    const transportLines = await client.transportLine.deleteMany({});
    const stops = await client.stop.deleteMany({});

    return {
      favorites: favorites.count,
      stopTimePredictions: stopTimePredictions.count,
      routePaths: routePaths.count,
      schedules: schedules.count,
      lineStops: lineStops.count,
      routeDirections: routeDirections.count,
      fares: fares.count,
      transportLines: transportLines.count,
      stops: stops.count,
    } satisfies DeleteSummary;
  });

  console.info('[ingestion] Reset do dominio de transporte concluido.');
  console.info(`[ingestion] Favorites removidos: ${summary.favorites}`);
  console.info(`[ingestion] Stop time predictions removidas: ${summary.stopTimePredictions}`);
  console.info(`[ingestion] Route paths removidos: ${summary.routePaths}`);
  console.info(`[ingestion] Schedules removidos: ${summary.schedules}`);
  console.info(`[ingestion] Line stops removidos: ${summary.lineStops}`);
  console.info(`[ingestion] Route directions removidas: ${summary.routeDirections}`);
  console.info(`[ingestion] Fares removidas: ${summary.fares}`);
  console.info(`[ingestion] Transport lines removidas: ${summary.transportLines}`);
  console.info(`[ingestion] Stops removidos: ${summary.stops}`);
  console.info('[ingestion] Users e saved locations foram preservados.');
};

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    console.error(`[ingestion] ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
