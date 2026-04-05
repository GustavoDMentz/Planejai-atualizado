import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  createdAt: Date;
}

export class PlanejaiDB extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('planejai-db');
    this.version(1).stores({
      transactions: '++id, type, amount, description, category, createdAt',
    });
  }
}

export const db = new PlanejaiDB();
