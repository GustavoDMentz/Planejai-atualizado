import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  timestamp: Date;
}

export class PlanejaiDB extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('planejai-db');
    this.version(1).stores({
      transactions: '++id, type, amount, description, category, timestamp',
    });
  }
}

export const db = new PlanejaiDB();
