import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowUpRight, ArrowDownRight, Wallet, Clock, BarChart3, ChevronRight } from 'lucide-react';
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

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

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

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(now);

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-10 space-y-7" aria-label="Painel financeiro">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-calm/80 font-semibold">Suas finanças, sem complicação</p>
          <h1 className="text-3xl font-bold text-text mt-1">Planejaí<span className="text-success">.</span></h1>
        </div>
        <button type="button" onClick={onOpenInsights} className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#414141] border border-calm/20 text-text text-sm font-semibold hover:border-calm/60 transition focus-visible:ring-2 focus-visible:ring-calm" aria-label="Abrir meus gráficos">
          <BarChart3 size={19} aria-hidden="true" /> Gráficos
        </button>
      </header>

      <section aria-label="Resumo do mês" className="space-y-3">
        <div className="rounded-3xl bg-calm p-6 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-sm font-semibold" style={{ color: COLORS.blue }}>Saldo do mês</p>
            <Wallet size={23} style={{ color: COLORS.blue }} aria-hidden="true" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight break-words" style={{ color: COLORS.blue }}>{formatCurrency(balance)}</p>
          <p className="text-sm mt-3 capitalize" style={{ color: COLORS.blue }}>{monthLabel}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-2xl bg-success p-4" aria-label="Dinheiro que entrou este mês">
            <div className="flex items-center justify-between gap-1 mb-3">
              <p className="text-sm font-semibold" style={{ color: COLORS.green }}>Entradas</p>
              <ArrowUpRight size={19} style={{ color: COLORS.green }} aria-hidden="true" />
            </div>
            <p className="text-lg sm:text-xl font-bold break-words" style={{ color: COLORS.green }}>{formatCurrency(income)}</p>
          </div>
          <div className="min-w-0 rounded-2xl bg-alert p-4" aria-label="Dinheiro que saiu este mês">
            <div className="flex items-center justify-between gap-1 mb-3">
              <p className="text-sm font-semibold" style={{ color: COLORS.orange }}>Saídas</p>
              <ArrowDownRight size={19} style={{ color: COLORS.orange }} aria-hidden="true" />
            </div>
            <p className="text-lg sm:text-xl font-bold break-words" style={{ color: COLORS.orange }}>{formatCurrency(expense)}</p>
          </div>
        </div>
      </section>

      <section aria-label="Últimas movimentações">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-semibold text-text">Últimas movimentações</h2>
          <span className="text-xs text-text/60">Toque para editar</span>
        </div>
        {recent.length > 0 ? (
          <ul className="space-y-2">
            {recent.map(t => (
              <li key={t.id}>
                <button type="button" onClick={() => onEdit(t)} className="w-full p-4 rounded-2xl bg-[#3A3A3A] border border-calm/20 flex items-center justify-between gap-3 text-left hover:bg-[#444444] hover:border-calm/50 transition focus-visible:ring-2 focus-visible:ring-calm" aria-label={`Editar transação: ${t.description}, valor ${formatCurrency(t.amount)}`}>
                  <span className="min-w-0 flex items-center gap-3">
                    <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-success/15 text-success' : 'bg-alert/15 text-alert'}`}>
                      {t.type === 'income' ? <ArrowUpRight size={20} aria-hidden="true" /> : <ArrowDownRight size={20} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-text font-medium truncate">{t.description}</span>
                      <span className="block text-xs text-text/60">{new Date(t.timestamp).toLocaleDateString('pt-BR')}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-success' : 'text-alert'}`}>{t.type === 'income' ? '+' : '−'} {formatCurrency(t.amount)}</span>
                    <ChevronRight size={15} className="text-text/50" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 rounded-3xl bg-[#3A3A3A] border border-calm/20 flex flex-col items-center justify-center text-center">
            <Clock size={30} className="text-calm mb-3" aria-hidden="true" />
            <p className="font-semibold text-text">Seu histórico começa aqui</p>
            <p className="text-sm text-text/70 mt-2">Adicione uma entrada ou saída para acompanhar suas finanças.</p>
          </div>
        )}
      </section>
    </div>
  );
}
