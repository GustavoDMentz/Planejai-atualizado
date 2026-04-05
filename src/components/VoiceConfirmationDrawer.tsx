import { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, X, Volume2 } from 'lucide-react';

interface VoiceConfirmationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: { type: 'income' | 'expense'; amount: number; description: string; category: string } | null;
  onConfirm: () => void;
  onEdit: () => void;
}

export function VoiceConfirmationDrawer({ open, onOpenChange, data, onConfirm, onEdit }: VoiceConfirmationDrawerProps) {
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (open && data && !hasSpoken.current && window.speechSynthesis) {
      const typeText = data.type === 'income' ? 'entrada' : 'saída';
      const text = `Entendi que você teve uma ${typeText} de ${data.amount} reais com ${data.description}. Está correto?`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      hasSpoken.current = true;
    } else if (!open) {
      hasSpoken.current = false;
      window.speechSynthesis?.cancel();
    }
  }, [open, data]);

  if (!data) return null;

  const formatCurrency = (val: number) => `R$ ${val.toFixed(2).replace('.', ',')}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[#333333] rounded-t-3xl p-6 max-h-[70vh] focus:outline-none shadow-2xl border-t border-calm/20">
          <div className="flex items-center gap-2 mb-4 text-calm">
            <Volume2 size={20} aria-hidden="true" />
            <Dialog.Title className="text-lg font-semibold text-text">Confirmação de Voz</Dialog.Title>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#3A3A3A] border border-calm/20">
              <p className="text-sm text-text/60 mb-1">Valor</p>
              <p className="text-2xl font-bold text-text">{formatCurrency(data.amount)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#3A3A3A] border border-calm/20">
              <p className="text-sm text-text/60 mb-1">Descrição</p>
              <p className="text-lg font-medium text-text">{data.description}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#3A3A3A] border border-calm/20">
              <p className="text-sm text-text/60 mb-1">Categoria</p>
              <p className="text-lg font-medium text-text">{data.category}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 rounded-xl bg-success text-[#0F2A1A] font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm"
              aria-label="Sim, salvar os dados"
            >
              <Check size={20} strokeWidth={2} /> Sim, salvar
            </button>
            <button
              onClick={onEdit}
              className="w-full py-4 rounded-xl bg-alert text-[#2D1600] font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm"
              aria-label="Não, corrigir os dados"
            >
              <X size={20} strokeWidth={2} /> Não, corrigir
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
