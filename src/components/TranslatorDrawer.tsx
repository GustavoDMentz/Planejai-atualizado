import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, GripVertical } from 'lucide-react';

const dictionary = [
  { term: 'Fluxo de Caixa', translation: 'O dinheiro que entra e sai da sua empresa todo dia. É saber se sobrou troco no fim do dia.' },
  { term: 'Pró-labore', translation: 'O seu salário! É o dinheiro que você tira da empresa para pagar suas contas pessoais.' },
  { term: 'Capital de Giro', translation: 'A sua reserva de emergência. O dinheiro guardado para a empresa não passar sufoco.' },
  { term: 'DRE', translation: 'O resumo do seu mês. Mostra se você teve lucro ou prejuízo de um jeito direto.' },
  { term: 'Margem de Lucro', translation: 'A porcentagem que realmente sobra para você depois de pagar todos os custos de um produto.' },
];

interface TranslatorDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TranslatorDrawer({ open: controlledOpen, onOpenChange }: TranslatorDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const startY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const filtered = dictionary.filter(d =>
    d.term.toLowerCase().includes(search.toLowerCase()) ||
    d.translation.toLowerCase().includes(search.toLowerCase())
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    if (endY - startY.current > 60) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, setIsOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button
          className="mx-auto my-5 bg-calm/20 text-text px-5 py-3 rounded-full font-medium text-base shadow-lg flex items-center justify-center gap-2 hover:bg-calm/30 transition focus:outline-none focus:ring-2 focus:ring-calm"
          aria-label="Abrir tradutor de palavras contábeis"
        >
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
          Tradutor de Palavras
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" />
        <Dialog.Content
          ref={contentRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#333333] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto focus:outline-none shadow-2xl transform transition-transform border-t border-calm/20"
          aria-label="Dicionário de termos contábeis"
        >
          <div className="flex justify-center mb-4">
            <GripVertical size={20} className="text-text/30" aria-hidden="true" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-text">Tradutor de Palavras</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-calm/20 transition focus:outline-none focus:ring-2 focus:ring-calm" aria-label="Fechar tradutor">
                <X size={20} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text/50" size={18} strokeWidth={1.5} aria-hidden="true" />
            <input
              type="text"
              placeholder="Digite uma palavra difícil..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-calm/30 bg-[#3A3A3A] text-text placeholder:text-text/40 focus:outline-none focus:border-calm focus:ring-2 focus:ring-calm/30"
              aria-label="Buscar termo contábil"
            />
          </div>

          <div className="space-y-4 pb-8">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-calm/10 border border-calm/20">
                  <h3 className="font-semibold text-text mb-1">{item.term}</h3>
                  <p className="text-text/80 leading-relaxed">{item.translation}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-text/60 py-4">Nenhum termo encontrado. Tente outro!</p>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
