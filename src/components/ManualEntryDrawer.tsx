import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { X, Check, Trash2, AlertTriangle } from 'lucide-react';
import { db, Transaction } from '../db';

interface ManualEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction?: Transaction | null;
}

export function ManualEntryDrawer({ open, onOpenChange, onSuccess, transaction }: ManualEntryDrawerProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!transaction;

  useEffect(() => {
    if (open) {
      if (transaction) {
        setAmount(transaction.amount.toString().replace('.', ','));
        setDescription(transaction.description);
        setType(transaction.type);
      } else {
        setAmount('');
        setDescription('');
        setType('expense');
      }
      setShowDeleteConfirm(false);
    }
  }, [open, transaction]);

  const handleSave = async () => {
    if (!amount) return;
    setIsSaving(true);
    try {
      const normalized = amount.trim().replace(/\s/g, '');
      if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(normalized)) {
        throw new Error('Valor inválido');
      }
      const parsedAmount = Number(normalized.replace(/\./g, '').replace(',', '.'));
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1_000_000_000) {
        throw new Error('Valor fora dos limites permitidos');
      }
      const data = {
        type,
        amount: parsedAmount,
        description: description.trim() || 'Sem nome',
        category: isEditing && transaction ? transaction.category : 'Manual',
        timestamp: isEditing && transaction ? transaction.timestamp : new Date(),
      };

      if (isEditing && transaction?.id) {
        await db.transactions.update(transaction.id, data);
      } else {
        await db.transactions.add(data as Transaction);
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !transaction?.id) return;
    try {
      await db.transactions.delete(transaction.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[#333333] rounded-t-3xl p-6 max-h-[60vh] focus:outline-none shadow-2xl border-t border-calm/20">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-bold text-text">
              {isEditing ? 'Editar Movimentação' : 'Registrar Manualmente'}
            </Dialog.Title>
            <Dialog.Close className="p-2 rounded-full hover:bg-calm/20 transition focus:outline-none focus:ring-2 focus:ring-calm" aria-label="Fechar">
              <X size={20} strokeWidth={1.5} className="text-text" />
            </Dialog.Close>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Valor (R$)</label>
              <input
                type="text"
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

            {isEditing && !showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-xl bg-[#3A3A3A] border border-alert/40 text-alert font-medium flex items-center justify-center gap-2 hover:bg-alert/10 transition focus:outline-none focus:ring-2 focus:ring-alert"
                aria-label="Excluir esta movimentação"
              >
                <Trash2 size={18} strokeWidth={2} /> Excluir Movimentação
              </button>
            ) : isEditing && showDeleteConfirm ? (
              <div className="p-4 rounded-xl bg-alert/10 border border-alert/30 space-y-3">
                <div className="flex items-center gap-2 text-alert">
                  <AlertTriangle size={18} />
                  <span className="font-medium">Tem certeza que deseja excluir?</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-lg bg-alert text-[#2D1600] font-bold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-alert"
                    aria-label="Confirmar exclusão"
                  >
                    Sim, excluir
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 rounded-lg bg-[#3A3A3A] text-text font-medium hover:bg-[#404040] transition focus:outline-none focus:ring-2 focus:ring-calm"
                    aria-label="Cancelar exclusão"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleSave}
              disabled={isSaving || !amount}
              className="w-full py-4 rounded-xl bg-success text-[#0F2A1A] font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isEditing ? 'Salvar alterações' : 'Salvar transação'}
            >
              <Check size={20} strokeWidth={2} /> {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Salvar'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
