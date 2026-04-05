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

export function TranslatorDrawer() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const startY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

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
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-calm text-text px-5 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2 hover:bg-success transition focus:outline-none focus:ring-4 focus:ring-calm/50 z-40"
          aria-label="Abrir tradutor de palavras contábeis"
        >
          <Search size={18} strokeWidth={1.5} aria-hidden="true" />
          Tradutor de Palavras Chaves
        </button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content 
          ref={contentRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed bottom-0 left-0 right-0 z-50 bg-bg rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto focus:outline-none shadow-2xl transform transition-transform"
          aria-label="Dicionário de termos contábeis"
        >
          <div className="flex justify-center mb-4">
            <GripVertical size={20} className="text-text/30" aria-hidden="true" />
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-text">Tradutor de Palavras</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 rounded-full hover:bg-calm/30 transition focus:outline-none focus:ring-2 focus:ring-calm" aria-label="Fechar tradutor">
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
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-calm/40 bg-bg text-text placeholder:text-text/40 focus:outline-none focus:border-calm focus:ring-2 focus:ring-calm/30"
              aria-label="Buscar termo contábil"
            />
          </div>
          
          <div className="space-y-4 pb-8">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-calm/20 border border-calm/30">
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
