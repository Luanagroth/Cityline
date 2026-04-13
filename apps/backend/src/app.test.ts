import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('CityLine backend API', () => {
  it('retorna linhas com payload padronizado', async () => {
    const response = await request(app).get('/api/lines');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.meta.source).toBe('database');
    expect(response.body.meta.fallback).toBe(false);
  });

  it('permite busca textual por nome da linha', async () => {
    const response = await request(app).get('/api/search').query({ q: 'Praia' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.some((line: { name: string }) => line.name.includes('Praia'))).toBe(true);
  });

  it('retorna detalhes de rota e horários a partir do banco', async () => {
    const lineResponse = await request(app).get('/api/lines/line-100');

    expect(lineResponse.status).toBe(200);
    expect(lineResponse.body.success).toBe(true);
    expect(lineResponse.body.data.stops.length).toBeGreaterThan(0);
    expect(lineResponse.body.data.path.length).toBeGreaterThan(0);
    expect(lineResponse.body.data.schedules.weekday.length).toBeGreaterThan(0);
    expect(lineResponse.body.data.fareLabel).toContain('R$');

    const schedulesResponse = await request(app).get('/api/schedules').query({ lineId: 'line-100', dayType: 'weekday' });

    expect(schedulesResponse.status).toBe(200);
    expect(schedulesResponse.body.success).toBe(true);
    expect(schedulesResponse.body.meta.source).toBe('database');
    expect(Array.isArray(schedulesResponse.body.data.items)).toBe(true);
    expect(schedulesResponse.body.data.items.length).toBeGreaterThan(0);
  });

  it('mantém o endpoint de mapa compatível com path e paradas', async () => {
    const response = await request(app).get('/api/map/lines').query({ mode: 'ferry' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.meta.source).toBe('database');
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].path.length).toBeGreaterThan(0);
    expect(response.body.data[0].stops.length).toBeGreaterThan(0);
  });

  it('expõe sentidos reais da linha sem quebrar a leitura atual', async () => {
    const directionsResponse = await request(app).get('/api/lines/line-100/directions');

    expect(directionsResponse.status).toBe(200);
    expect(directionsResponse.body.success).toBe(true);
    expect(directionsResponse.body.meta.source).toBe('database');
    expect(directionsResponse.body.data).toHaveLength(2);
    expect(directionsResponse.body.data[0].type).toBe('outbound');
    expect(directionsResponse.body.data[1].type).toBe('inbound');

    const stopsResponse = await request(app).get('/api/lines/line-100/directions/line-100-outbound/stops');

    expect(stopsResponse.status).toBe(200);
    expect(stopsResponse.body.data.items.length).toBeGreaterThan(0);
    expect(stopsResponse.body.data.direction.id).toBe('line-100-outbound');
  });

  it('retorna horarios e path por sentido com proximas partidas', async () => {
    const schedulesResponse = await request(app)
      .get('/api/lines/line-100/directions/line-100-outbound/schedules')
      .query({ dayType: 'weekday', at: '2026-03-30T06:19:00', limit: 2 });

    expect(schedulesResponse.status).toBe(200);
    expect(schedulesResponse.body.success).toBe(true);
    expect(schedulesResponse.body.data.items.length).toBeGreaterThan(0);
    expect(schedulesResponse.body.data.nextDepartures).toHaveLength(2);
    expect(schedulesResponse.body.data.nextDepartures[0].label).toBe('saida agora');

    const pathResponse = await request(app).get('/api/lines/line-100/directions/line-100-inbound/path');

    expect(pathResponse.status).toBe(200);
    expect(pathResponse.body.success).toBe(true);
    expect(pathResponse.body.data.path.length).toBeGreaterThan(0);
    expect(pathResponse.body.data.direction.type).toBe('inbound');
  });

  it('cria sessão e retorna o perfil autenticado', async () => {
    const email = `cityline+${Date.now()}@example.com`;

    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Luana Teste',
      email,
      password: '123456',
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.token).toBeTypeOf('string');

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data.email).toBe(email);
  });

  it('persiste favoritos por usuário autenticado sem bloquear o modo público', async () => {
    const email = `favorites+${Date.now()}@example.com`;
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Favoritos Teste',
      email,
      password: '123456',
    });

    const linesResponse = await request(app).get('/api/lines');
    const lineId = linesResponse.body.data[0]?.id;

    expect(lineId).toBeTruthy();

    const createResponse = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`)
      .send({ lineId });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.lineId).toBe(lineId);

    const favoritesResponse = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${registerResponse.body.data.token}`);

    expect(favoritesResponse.status).toBe(200);
    expect(favoritesResponse.body.success).toBe(true);
    expect(favoritesResponse.body.data.some((item: { lineId: string }) => item.lineId === lineId)).toBe(true);
  });
});
