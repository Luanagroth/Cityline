import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FavoriteRecord } from '@cityline/shared';

export class FavoritesRepository {
  private readonly dataFile = path.resolve(process.cwd(), 'data', 'favorites.json');

  private async ensureStore() {
    await mkdir(path.dirname(this.dataFile), { recursive: true });

    try {
      await readFile(this.dataFile, 'utf8');
    } catch {
      await writeFile(this.dataFile, '[]', 'utf8');
    }
  }

  async list() {
    await this.ensureStore();
    const content = await readFile(this.dataFile, 'utf8');
    return JSON.parse(content) as FavoriteRecord[];
  }

  async saveAll(items: FavoriteRecord[]) {
    await this.ensureStore();
    await writeFile(this.dataFile, JSON.stringify(items, null, 2), 'utf8');
    return items;
  }
}
