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

export async function getMonthlySummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const transactions = await db.transactions.where('createdAt').aboveOrEqual(startOfMonth).toArray();
  
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expense, balance: income - expense };
}

export async function getRecentTransactions(limit = 3) {
  return await db.transactions.orderBy('createdAt').reverse().limit(limit).toArray();
}
