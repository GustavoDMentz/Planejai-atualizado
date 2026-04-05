import { useState, useCallback } from 'react';
import { db, Transaction } from './db';
import { Dashboard } from './components/Dashboard';
import { TranslatorDrawer } from './components/TranslatorDrawer';
import { ManualEntryDrawer } from './components/ManualEntryDrawer';
import { VoiceConfirmationDrawer } from './components/VoiceConfirmationDrawer';
import { BrowserWarningModal } from './components/BrowserWarningModal';
import { InsightsDrawer } from './components/InsightsDrawer';
import { Mic, MicOff, Check, Plus } from 'lucide-react';

type ExtractedData = {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
};

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showVoiceConfirmation, setShowVoiceConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowBrowserWarning(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: any) => {
      const current = event.results[event.results.length - 1];
      const transcript = current[0].transcript;

      if (current.isFinal) {
        setIsListening(false);
        setIsLoading(true);
        
        const cleanedTranscript = transcript.toLowerCase().replace(/\.$/, '').trim();

        try {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (!apiKey) throw new Error('API Key não configurada');

          const systemPrompt = `Você é o assistente financeiro do Planejaí. Extraia dados de frases informais. Se o usuário disser 'Recebi 2k do job de ontem', você deve retornar { "type": "income", "amount": 2000, "description": "Job de ontem", "category": "Serviços" }. Se ele disser 'Paguei o agiota 50 conto', retorne { "type": "expense", "amount": 50, "description": "Pagamento de dívida", "category": "Outros" }. Retorne APENAS JSON puro.`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\nFrase do usuário: "${cleanedTranscript}"` }]
              }]
            })
          });

          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanedJson = rawText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanedJson) as ExtractedData;

          setExtractedData(parsed);
          setShowVoiceConfirmation(true);
        } catch {
          showToast('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
        } finally {
          setIsLoading(false);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        showToast('Permissão de microfone negada. Verifique as configurações.');
      } else {
        showToast('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const handleVoiceConfirm = async () => {
    if (!extractedData) return;
    try {
      await db.transactions.add({
        ...extractedData,
        timestamp: new Date(),
      } as Transaction);
      setShowVoiceConfirmation(false);
      setExtractedData(null);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
    } catch {
      showToast('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
    }
  };

  const handleVoiceEdit = () => {
    if (!extractedData) return;
    setShowVoiceConfirmation(false);
    setEditingTransaction({
      ...extractedData,
      timestamp: new Date(),
    } as Transaction);
    setIsManualOpen(true);
  };

  const handleDrawerSuccess = () => {
    setEditingTransaction(null);
    setIsManualOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
  };

  const isDrawerOpen = isManualOpen || !!editingTransaction;

  return (
    <main className="min-h-screen bg-bg text-text font-sans flex flex-col" aria-label="Tela principal do Planejaí">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-contentShow">
          <div className="p-4 rounded-2xl bg-alert/20 border border-alert/40 backdrop-blur-md shadow-lg text-center">
            <p className="text-sm font-medium text-text">{toastMessage}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Dashboard onEdit={handleEdit} onOpenInsights={() => setIsInsightsOpen(true)} />
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-40">
        {isListening && (
          <span className="text-sm font-medium text-alert animate-pulse">Estou ouvindo...</span>
        )}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsManualOpen(true)}
            className="w-14 h-14 rounded-full bg-calm flex items-center justify-center shadow-lg hover:bg-calm/80 transition focus:outline-none focus:ring-4 focus:ring-calm"
            aria-label="Adicionar transação manualmente"
          >
            <Plus size={24} strokeWidth={2} className="text-[#333333]" />
          </button>
          {!showVoiceConfirmation && (
            <button
              onClick={startListening}
              disabled={isListening || isLoading}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-calm ${
                isListening ? 'bg-alert animate-pulse' : 'bg-success hover:opacity-90'
              }`}
              aria-label={isListening ? 'Ouvindo sua voz' : 'Clique para falar'}
            >
              {isListening ? <MicOff size={24} strokeWidth={2} className="text-[#333333]" /> : <Mic size={24} strokeWidth={2} className="text-[#333333]" />}
            </button>
          )}
        </div>
      </div>

      <TranslatorDrawer open={isTranslatorOpen} onOpenChange={setIsTranslatorOpen} />
      <ManualEntryDrawer 
        open={isDrawerOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsManualOpen(false);
            setEditingTransaction(null);
          }
        }} 
        onSuccess={handleDrawerSuccess} 
        transaction={editingTransaction} 
      />

      <VoiceConfirmationDrawer
        open={showVoiceConfirmation}
        onOpenChange={(open) => !open && setShowVoiceConfirmation(false)}
        data={extractedData}
        onConfirm={handleVoiceConfirm}
        onEdit={handleVoiceEdit}
      />

      <BrowserWarningModal 
        open={showBrowserWarning} 
        onClose={() => setShowBrowserWarning(false)} 
        onOpenManual={() => setIsManualOpen(true)} 
      />

      <InsightsDrawer 
        open={isInsightsOpen} 
        onOpenChange={setIsInsightsOpen} 
        onOpenTranslator={() => setIsTranslatorOpen(true)} 
      />

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
