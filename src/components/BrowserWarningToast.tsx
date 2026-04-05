import { X } from 'lucide-react';

interface BrowserWarningToastProps {
  open: boolean;
  onClose: () => void;
}

export function BrowserWarningToast({ open, onClose }: BrowserWarningToastProps) {
  if (!open) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="p-4 rounded-2xl bg-alert/20 border border-alert/40 backdrop-blur-md shadow-lg flex items-start gap-3 transition-all duration-300">
        <p className="text-sm font-medium text-text flex-1 leading-relaxed">
          Ops! O reconhecimento de voz precisa do Chrome ou Edge para funcionar melhor. Que tal tentar por lá ou usar a entrada manual (+)? 🚀
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-alert/30 transition focus:outline-none focus:ring-2 focus:ring-alert shrink-0"
          aria-label="Fechar aviso"
        >
          <X size={16} className="text-text" />
        </button>
      </div>
    </div>
  );
}
