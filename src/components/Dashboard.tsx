import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowUp, ArrowDown, Star, Clock, BarChart } from 'lucide-react';
import { db, Transaction } from '../db';

const COLORS = {
  green: '#0F2A1A',
  orange: '#2D1600',
  blue: '#00212C',
};

interface DashboardProps {
  onEdit: (transaction: Transaction) => void;
  onOpenInsights: () => void;
}

export function Dashboard({ onEdit, onOpenInsights }: DashboardProps) {
  const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().toArray());

  const isLoading = transactions === undefined;

  const now = new Date();
  const monthly = transactions?.filter(t => {
    const d = new Date(t.timestamp);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const income = monthly?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const expense = monthly?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
  const balance = income - expense;

  const recent = transactions?.slice(0, 3) || [];

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 pb-40 space-y-6" aria-label="Carregando painel">
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-success/30 animate-skeleton" />
          ))}
        </div>
        <div className="h-40 rounded-3xl bg-calm/20 animate-skeleton" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-40 space-y-6" aria-label="Painel financeiro">
      <div className="relative flex items-center justify-center mt-4 mb-6">
        <h1 className="text-2xl font-bold text-center text-white mt-4 mb-6">Planejaí</h1>
        <button
          onClick={onOpenInsights}
          className="absolute right-0 p-2 rounded-full hover:bg-calm/20 transition focus:outline-none focus:ring-2 focus:ring-calm"
          aria-label="Abrir meus gráficos"
        >
          <BarChart size={24} strokeWidth={1.5} className="text-text" />
        </button>
      </div>

      <section className="grid gap-5" aria-label="Resumo do mês">
        {/* Card Verde - Entradas */}
        <div className="p-6 rounded-3xl bg-success flex items-center justify-between shadow-sm" aria-label="Dinheiro que entrou este mês">
          <div>
            <p className="text-base font-medium mb-1" style={{ color: COLORS.green }}>O que entrou este mês</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.green }}>{formatCurrency(income)}</p>
          </div>
          <ArrowUp size={32} strokeWidth={2} style={{ color: COLORS.green }} aria-hidden="true" />
        </div>

        {/* Card Laranja - Saídas */}
        <div className="p-6 rounded-3xl bg-alert flex items-center justify-between shadow-sm" aria-label="Dinheiro que saiu este mês">
          <div>
            <p className="text-base font-medium mb-1" style={{ color: COLORS.orange }}>O que saiu este mês</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.orange }}>{formatCurrency(expense)}</p>
          </div>
          <ArrowDown size={32} strokeWidth={2} style={{ color: COLORS.orange }} aria-hidden="true" />
        </div>

        {/* Card Azul - Sobrou */}
        <div className="p-6 rounded-3xl bg-calm flex items-center justify-between shadow-sm" aria-label="Saldo restante para você">
          <div>
            <p className="text-base font-medium mb-1" style={{ color: COLORS.blue }}>O que sobrou para você</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.blue }}>{formatCurrency(balance)}</p>
          </div>
          <Star size={36} strokeWidth={1.5} fill={COLORS.blue} style={{ color: COLORS.blue }} aria-hidden="true" />
        </div>
      </section>

      <section aria-label="Últimas movimentações">
        <h2 className="text-lg font-semibold text-text mb-4 px-1">Últimas movimentações</h2>
        {recent.length > 0 ? (
          <ul className="space-y-3">
            {recent.map((t) => (
              <li
                key={t.id}
                onClick={() => onEdit(t)}
                className="p-4 rounded-2xl bg-[#3A3A3A] border border-calm/20 flex items-center justify-between hover:bg-[#404040] hover:border-calm/40 transition cursor-pointer focus-within:ring-2 focus-within:ring-calm"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => e.key === 'Enter' && onEdit(t)}
                aria-label={`Editar transação: ${t.description}, valor ${formatCurrency(t.amount)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${t.type === 'income' ? 'bg-success' : 'bg-alert'}`} aria-hidden="true" />
                  <span className="text-text font-medium">{t.description}</span>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-success' : 'text-alert'}`}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 rounded-3xl bg-[#3A3A3A] border border-calm/10 flex flex-col items-center justify-center text-center">
            <Clock size={28} strokeWidth={1.5} className="text-calm/60 mb-3" aria-hidden="true" />
            <p className="text-text/60">Nenhuma movimentação ainda.<br/>Toque no microfone para começar!</p>
          </div>
        )}
      </section>
    </div>
  );
}
