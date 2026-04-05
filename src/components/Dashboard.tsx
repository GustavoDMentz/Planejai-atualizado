import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Star } from 'lucide-react';
import { getMonthlySummary, getRecentTransactions, Transaction } from '../db';

export function Dashboard() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [sum, rec] = await Promise.all([getMonthlySummary(), getRecentTransactions(3)]);
      setSummary(sum);
      setRecent(rec);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <p className="text-center text-text/60 mt-12" aria-live="polite">Carregando com calma...</p>;

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-32 space-y-8" aria-label="Painel financeiro">
      <section className="grid gap-4" aria-label="Resumo do mês">
        <div className="p-5 rounded-2xl bg-success flex items-center justify-between shadow-sm" aria-label="Dinheiro que entrou este mês">
          <div>
            <p className="text-sm font-medium text-text/70 mb-1">O que entrou este mês</p>
            <p className="text-2xl font-bold text-text">{formatCurrency(summary.income)}</p>
          </div>
          <ArrowUp size={28} strokeWidth={1.5} className="text-text/60" aria-hidden="true" />
        </div>
        
        <div className="p-5 rounded-2xl bg-alert flex items-center justify-between shadow-sm" aria-label="Dinheiro que saiu este mês">
          <div>
            <p className="text-sm font-medium text-text/70 mb-1">O que saiu este mês</p>
            <p className="text-2xl font-bold text-text">{formatCurrency(summary.expense)}</p>
          </div>
          <ArrowDown size={28} strokeWidth={1.5} className="text-text/60" aria-hidden="true" />
        </div>
        
        <div className="p-5 rounded-2xl bg-calm flex items-center justify-between shadow-sm" aria-label="Saldo restante para você">
          <div>
            <p className="text-sm font-medium text-text/70 mb-1">O que sobrou para você</p>
            <p className="text-2xl font-bold text-text">{formatCurrency(summary.balance)}</p>
          </div>
          <Star size={28} strokeWidth={1.5} className="text-text/60" aria-hidden="true" />
        </div>
      </section>

      <section aria-label="Últimas movimentações">
        <h2 className="text-lg font-semibold text-text mb-3 px-1">Últimas movimentações</h2>
        {recent.length > 0 ? (
          <ul className="space-y-3">
            {recent.map((t) => (
              <li 
                key={t.id} 
                className="p-4 rounded-xl bg-bg border border-calm/30 flex items-center justify-between hover:bg-calm/10 transition cursor-pointer focus-within:ring-2 focus-within:ring-calm" 
                tabIndex={0} 
                role="button" 
                aria-label={`Transação: ${t.description}, valor ${formatCurrency(t.amount)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-success' : 'bg-alert'}`} aria-hidden="true" />
                  <span className="text-text font-medium">{t.description}</span>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-text' : 'text-text/80'}`}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text/50 text-center py-6">Nenhuma movimentação ainda. Toque no microfone para começar!</p>
        )}
      </section>
    </div>
  );
}
