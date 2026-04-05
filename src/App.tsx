import { useState, useCallback, useRef } from 'react';
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
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendToGemini = async (base64Audio: string) => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key não configurada');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Transcreva este áudio e extraia a transação financeira no formato JSON: { type: 'income'|'expense', amount: number, description: string, category: string }. Retorne APENAS JSON puro." },
              { inline_data: { mime_type: "audio/webm", data: base64Audio } }
            ]
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
  };

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setShowBrowserWarning(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        
        if (chunksRef.current.length === 0) {
          showToast('Nenhum áudio capturado. Tente novamente.');
          return;
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        await sendToGemini(base64);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      showToast('Não consegui acessar o microfone. Verifique as permissões.');
    }
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
        {isRecording && (
          <span className="text-sm font-medium text-alert animate-pulse">Gravando áudio...</span>
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
              onClick={startRecording}
              disabled={isRecording || isLoading}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-calm ${
                isRecording ? 'bg-alert animate-pulse' : 'bg-success hover:opacity-90'
              }`}
              aria-label={isRecording ? 'Gravando sua voz' : 'Clique para gravar'}
            >
              {isRecording ? <MicOff size={24} strokeWidth={2} className="text-[#333333]" /> : <Mic size={24} strokeWidth={2} className="text-[#333333]" />}
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
