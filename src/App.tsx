import { useState, useCallback, useRef } from 'react';
import { db, Transaction } from './db';
import { Dashboard } from './components/Dashboard';
import { TranslatorDrawer } from './components/TranslatorDrawer';
import { ManualEntryDrawer } from './components/ManualEntryDrawer';
import { VoiceConfirmationDrawer } from './components/VoiceConfirmationDrawer';
import { BrowserWarningModal } from './components/BrowserWarningModal';
import { InsightsDrawer } from './components/InsightsDrawer';
import { Mic, MicOff, Check, Plus, Loader2 } from 'lucide-react';
import { extractTransactionFromAudio } from './lib/gemini';

type ExtractedData = {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
};

export default function App() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showVoiceConfirmation, setShowVoiceConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsManualOpen(true);
      showToast('Seu navegador não suporta gravação. Vamos digitar?');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mimeTypeRef.current = mimeType;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        console.log('mimeType real:', mediaRecorder.mimeType);
        console.log('chunks:', chunksRef.current.length, 'blob size:', chunksRef.current.reduce((a, b) => a + b.size, 0));
        
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        
        if (chunksRef.current.length === 0) {
          showToast('Nenhum áudio capturado. Tente novamente.');
          return;
        }

        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const result = await extractTransactionFromAudio(base64, mimeTypeRef.current);
            setExtractedData({
              type: result.tipo === 'entrada' ? 'income' : 'expense',
              amount: result.valor,
              description: result.descricao,
              category: result.categoria
            });
            setShowVoiceConfirmation(true);
          } catch {
            showToast('O barulho do mundo me atrapalhou um pouco. Pode repetir com calma?');
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 4000);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      setIsManualOpen(true);
      showToast('Não consegui acessar o microfone. Vamos digitar?');
    }
  }, [isRecording]);

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
        {(isRecording || isProcessing) && (
          <span className={`text-sm font-medium animate-pulse ${isProcessing ? 'text-calm' : 'text-alert'}`}>
            {isProcessing ? 'Processando com calma...' : 'Gravando áudio...'}
          </span>
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
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all focus:outline-none focus:ring-4 focus:ring-calm ${
                isRecording ? 'bg-alert animate-pulse' : isProcessing ? 'bg-calm/50 cursor-wait' : 'bg-success hover:opacity-90'
              }`}
              aria-label={isRecording ? 'Parar gravação' : 'Clique para gravar'}
            >
              {isProcessing ? (
                <Loader2 size={24} strokeWidth={2} className="text-[#333333] animate-spin" />
              ) : isRecording ? (
                <MicOff size={24} strokeWidth={2} className="text-[#333333]" />
              ) : (
                <Mic size={24} strokeWidth={2} className="text-[#333333]" />
              )}
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
