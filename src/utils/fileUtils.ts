import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

export const ensureDataDir = async () => {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
};

export const readJSONFile = async <T>(filename: string): Promise<T[]> => {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as T[];
    } catch (error) {
        return [];
    }
};

export const writeJSONFile = async <T>(filename: string, data: T[]): Promise<void> => {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};