import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface BrowserWarningModalProps {
  open: boolean;
  onClose: () => void;
  onOpenManual: () => void;
}

export function BrowserWarningModal({ open, onClose, onOpenManual }: BrowserWarningModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm p-6 rounded-3xl bg-[#1A1C1E] border border-zinc-800 shadow-2xl focus:outline-none">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-xl font-bold text-text">Ajuste de Rota 🚀</Dialog.Title>
            <Dialog.Close className="p-1 rounded-full hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-calm" aria-label="Fechar aviso">
              <X size={20} className="text-text/70" />
            </Dialog.Close>
          </div>
          
          <Dialog.Description className="text-text/80 mb-6 leading-relaxed">
            O reconhecimento de voz brilha mais no Chrome ou Edge. Como você prefere seguir agora?
          </Dialog.Description>
          
          <div className="flex gap-3">
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-zinc-700 text-text font-medium hover:bg-zinc-600 transition focus:outline-none focus:ring-2 focus:ring-calm"
              >
                Entendi
              </button>
            </Dialog.Close>
            <button
              onClick={() => {
                onClose();
                onOpenManual();
              }}
              className="flex-1 py-3 rounded-xl bg-success text-[#0F2A1A] font-bold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-calm"
            >
              Usar Manual (+)
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
