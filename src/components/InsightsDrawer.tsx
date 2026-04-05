import { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, BarChart3, TrendingUp, BookOpen } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface InsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenTranslator: () => void;
}

export function InsightsDrawer({ open, onOpenChange, onOpenTranslator }: InsightsDrawerProps) {
  const transactions = useLiveQuery(() => db.transactions.toArray());

  const chartData = useMemo(() => {
    if (!transactions) return [];

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    return days.map(day => {
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.timestamp).toISOString().split('T')[0];
        return tDate === day;
      });
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return { day: day.slice(5), income, expense };
    });
  }, [transactions]);

  const lineData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const sorted = [...transactions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let balance = 0;
    return sorted.map(t => {
      balance += t.type === 'income' ? t.amount : -t.amount;
      return { date: new Date(t.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), balance };
    });
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 text-white p-3 rounded-lg text-sm shadow-lg border border-white/10">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: R$ {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[#333333] rounded-t-3xl p-6 h-[80vh] overflow-y-auto focus:outline-none shadow-2xl border-t border-calm/20">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-text">Meus Gráficos</Dialog.Title>
            <Dialog.Close className="p-2 rounded-full hover:bg-calm/20 transition focus:outline-none focus:ring-2 focus:ring-calm" aria-label="Fechar gráficos">
              <X size={20} className="text-text" />
            </Dialog.Close>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                <BarChart3 size={20} className="text-calm" /> Entradas vs Saídas (7 dias)
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" stroke="#FEFDF5" fontSize={12} tickLine={false} axisLine={{ stroke: '#FEFDF533' }} />
                    <YAxis stroke="#FEFDF5" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FEFDF510' }} />
                    <Bar dataKey="income" name="Entradas" fill="#AEEFD0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Saídas" fill="#FFB347" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                <TrendingUp size={20} className="text-calm" /> Saldo Acumulado
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <XAxis dataKey="date" stroke="#FEFDF5" fontSize={12} tickLine={false} axisLine={{ stroke: '#FEFDF533' }} />
                    <YAxis stroke="#FEFDF5" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="balance" name="Saldo" stroke="#AED9E0" strokeWidth={3} dot={{ fill: '#AED9E0', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-calm/20">
            <button
              onClick={onOpenTranslator}
              className="w-full py-3 rounded-xl bg-calm/10 border border-calm/30 text-text font-medium flex items-center justify-center gap-2 hover:bg-calm/20 transition focus:outline-none focus:ring-2 focus:ring-calm"
              aria-label="O que esses gráficos dizem?"
            >
              <BookOpen size={18} /> O que esses gráficos dizem?
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
