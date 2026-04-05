import { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { db, Transaction } from './db';
import { Dashboard } from './components/Dashboard';
import { TranslatorDrawer } from './components/TranslatorDrawer';
import { Mic, MicOff, Check, X } from 'lucide-react';

type ExtractedData = {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
};

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage('Seu navegador não suporta reconhecimento de voz. Tente o Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Estou ouvindo...');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsLoading(true);
      setStatusMessage('');

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('API Key não configurada');

        const systemPrompt = `Você é o assistente financeiro do Planejaí. Extraia dados de frases informais. Se o usuário disser 'Recebi 2k do job de ontem', você deve retornar { "type": "income", "amount": 2000, "description": "Job de ontem", "category": "Serviços" }. Se ele disser 'Paguei o agiota 50 conto', retorne { "type": "expense", "amount": 50, "description": "Pagamento de dívida", "category": "Outros" }. Retorne APENAS JSON puro.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nFrase do usuário: "${transcript}"` }]
            }]
          })
        });

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJson = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedJson) as ExtractedData;

        setExtractedData(parsed);
        setShowConfirmation(true);
      } catch {
        setStatusMessage('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatusMessage('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
    };

    recognition.start();
  }, []);

  const handleSave = async () => {
    if (!extractedData) return;
    try {
      await db.transactions.add({
        ...extractedData,
        createdAt: new Date(),
      } as Transaction);
      setShowConfirmation(false);
      setExtractedData(null);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStatusMessage('');
      }, 2500);
    } catch {
      setStatusMessage('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
    }
  };

  const handleRetry = () => {
    setShowConfirmation(false);
    setExtractedData(null);
    setStatusMessage('');
  };

  return (
    <main className="min-h-screen bg-bg text-text font-sans flex flex-col" aria-label="Tela principal do Planejaí">
      <header className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-text">Planejaí</h1>
        {statusMessage && !isLoading && (
          <p className="mt-2 text-sm text-text/70 min-h-[1.25rem]" role="status" aria-live="polite">{statusMessage}</p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <Dashboard />
      </div>

      {!showConfirmation && (
        <button
          onClick={startListening}
          disabled={isListening || isLoading}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-calm z-40 ${
            isListening ? 'bg-alert animate-pulse' : 'bg-success hover:opacity-90'
          }`}
          aria-label={isListening ? 'Ouvindo sua voz' : 'Clique para falar'}
        >
          {isListening ? <MicOff size={24} strokeWidth={2} className="text-[#333333]" /> : <Mic size={24} strokeWidth={2} className="text-[#333333]" />}
        </button>
      )}

      <TranslatorDrawer />

      <Dialog.Root open={showConfirmation} onOpenChange={(open) => !open && handleRetry()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-overlayShow" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-3xl bg-[#333333] border-2 border-calm/30 shadow-2xl focus:outline-none animate-contentShow">
            <Dialog.Title className="text-xl font-semibold mb-4 text-center text-text">Eu entendi direito?</Dialog.Title>
            {extractedData && (
              <div className="space-y-3 mb-6 text-lg text-text">
                <p><strong>Valor:</strong> R$ {extractedData.amount.toFixed(2).replace('.', ',')}</p>
                <p><strong>Descrição:</strong> {extractedData.description}</p>
                <p><strong>Categoria:</strong> {extractedData.category}</p>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-xl bg-success text-[#333333] font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm"
                aria-label="Sim, salvar os dados"
              >
                <Check size={20} strokeWidth={2} /> Sim, salvar
              </button>
              <Dialog.Close asChild>
                <button
                  onClick={handleRetry}
                  className="w-full py-4 rounded-xl bg-alert text-[#333333] font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm"
                  aria-label="Não, tentar de novo"
                >
                  <X size={20} strokeWidth={2} /> Não, tentar de novo
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" aria-live="polite">
          <div className="animate-check-pop bg-success/90 p-6 rounded-full shadow-2xl">
            <Check size={48} strokeWidth={2.5} className="text-[#333333]" />
          </div>
        </div>
      )}
    </main>
  );
}
