import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { X, Check } from 'lucide-react';
import { db, Transaction } from '../db';

interface ManualEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManualEntryDrawer({ open, onOpenChange, onSuccess }: ManualEntryDrawerProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!amount) return;
    setIsSaving(true);
    try {
      await db.transactions.add({
        type,
        amount: parseFloat(amount.replace(',', '.')),
        description: description.trim() || 'Sem nome',
        category: 'Manual',
        timestamp: new Date(),
      } as Transaction);
      setAmount('');
      setDescription('');
      setType('expense');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[#333333] rounded-t-3xl p-6 max-h-[60vh] focus:outline-none shadow-2xl border-t border-calm/20">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-text">Registrar Manualmente</Dialog.Title>
            <Dialog.Close className="p-2 rounded-full hover:bg-calm/20 transition focus:outline-none focus:ring-2 focus:ring-calm" aria-label="Fechar">
              <X size={20} strokeWidth={1.5} className="text-text" />
            </Dialog.Close>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Valor (R$)</label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full p-4 text-2xl font-bold rounded-xl border-2 border-calm/30 bg-[#3A3A3A] text-text placeholder:text-text/30 focus:outline-none focus:border-calm focus:ring-2 focus:ring-calm/30"
                aria-label="Valor da transação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">O que é?</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Conta de luz"
                className="w-full p-4 text-lg rounded-xl border-2 border-calm/30 bg-[#3A3A3A] text-text placeholder:text-text/30 focus:outline-none focus:border-calm focus:ring-2 focus:ring-calm/30"
                aria-label="Descrição da transação"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Tipo</label>
              <ToggleGroup.Root
                type="single"
                value={type}
                onValueChange={(val) => val && setType(val as 'income' | 'expense')}
                className="flex w-full rounded-xl overflow-hidden border-2 border-calm/30"
                aria-label="Tipo de transação"
              >
                <ToggleGroup.Item
                  value="income"
                  className="flex-1 py-3 font-semibold text-text bg-[#3A3A3A] data-[state=on]:bg-success data-[state=on]:text-[#0F2A1A] transition focus:outline-none focus:ring-2 focus:ring-calm"
                  aria-label="Entrada"
                >
                  Entrada
                </ToggleGroup.Item>
                <ToggleGroup.Item
                  value="expense"
                  className="flex-1 py-3 font-semibold text-text bg-[#3A3A3A] data-[state=on]:bg-alert data-[state=on]:text-[#2D1600] transition focus:outline-none focus:ring-2 focus:ring-calm"
                  aria-label="Saída"
                >
                  Saída
                </ToggleGroup.Item>
              </ToggleGroup.Root>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !amount}
              className="w-full py-4 rounded-xl bg-success text-[#0F2A1A] font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Salvar transação"
            >
              <Check size={20} strokeWidth={2} /> {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
