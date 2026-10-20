import { useRef, useState } from 'react';
import { db, type Transaction } from '../db';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_RECORDS = 20000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBackup(raw: unknown): Transaction[] {
  if (!isRecord(raw) || raw.version !== 1 || !Array.isArray(raw.transactions) || raw.transactions.length > MAX_RECORDS) {
    throw new Error('Formato de backup inválido ou grande demais.');
  }
  const seen = new Set<number>();
  return raw.transactions.map((item: unknown) => {
    if (!isRecord(item) || (item.type !== 'income' && item.type !== 'expense') ||
      typeof item.amount !== 'number' || !Number.isFinite(item.amount) || item.amount <= 0 || item.amount > 1_000_000_000 ||
      typeof item.description !== 'string' || !item.description.trim() || item.description.length > 500 ||
      typeof item.category !== 'string' || !item.category.trim() || item.category.length > 100 ||
      typeof item.timestamp !== 'string') {
      throw new Error('O backup contém uma transação inválida.');
    }
    const date = new Date(item.timestamp);
    if (!Number.isFinite(date.getTime())) throw new Error('Data inválida no backup.');
    if (item.id !== undefined && (!Number.isSafeInteger(item.id) || (item.id as number) <= 0 || seen.has(item.id as number))) {
      throw new Error('Identificador duplicado ou inválido no backup.');
    }
    if (item.id !== undefined) seen.add(item.id as number);
    return { ...(item.id === undefined ? {} : { id: item.id as number }), type: item.type, amount: item.amount, description: item.description.trim(), category: item.category.trim(), timestamp: date };
  });
}

export function BackupControls() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function exportBackup() {
    setBusy(true);
    try {
      const transactions = await db.transactions.toArray();
      const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), transactions });
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'planejai-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Backup gerado. Guarde o arquivo em local seguro.');
    } catch {
      setMessage('Não foi possível exportar os dados.');
    } finally {
      setBusy(false);
    }
  }

  async function importBackup(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > MAX_FILE_BYTES) throw new Error('Arquivo maior que 5 MB.');
      const records = parseBackup(JSON.parse(await file.text()));
      const existing = await db.transactions.count();
      if (!window.confirm(`Restaurar ${records.length} transações? Isso SUBSTITUIRÁ as ${existing} transações atuais. Exporte um backup antes de continuar.`)) return;
      await db.transaction('rw', db.transactions, async () => {
        await db.transactions.clear();
        await db.transactions.bulkAdd(records);
      });
      setMessage(`Restauração concluída: ${records.length} transações.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao restaurar backup.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
      setBusy(false);
    }
  }

  return (
    <section aria-label="Backup de dados" className="w-full max-w-md mx-auto px-4 pb-4">
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={exportBackup} className="flex-1 rounded-xl border border-calm/40 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-calm disabled:opacity-50">Exportar backup</button>
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="flex-1 rounded-xl border border-calm/40 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-calm disabled:opacity-50">Restaurar backup</button>
      </div>
      <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" aria-label="Selecionar backup JSON" onChange={event => { void importBackup(event.target.files?.[0]); }} />
      {message && <p role="status" className="mt-3 rounded-lg border border-calm/40 bg-[#3A3A3A] px-3 py-3 text-base font-medium text-text">{message}</p>}
    </section>
  );
}
