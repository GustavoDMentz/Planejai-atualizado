import { useState, useCallback, useRef } from 'react';
import { db, Transaction } from './db';
import { Dashboard } from './components/Dashboard';
import { BackupControls } from './components/BackupControls';
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
    if (!import.meta.env.DEV) {
      setIsManualOpen(true);
      showToast('Registro por voz desabilitado até a integração segura com a API.');
      return;
    }
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
            showToast('Registro por voz indisponível por segurança. Use a entrada manual.');
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

      <div className="flex-1 overflow-y-auto pb-24">
        <Dashboard onEdit={handleEdit} onOpenInsights={() => setIsInsightsOpen(true)} />
        <TranslatorDrawer open={isTranslatorOpen} onOpenChange={setIsTranslatorOpen} />
        <BackupControls />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 bg-gradient-to-t from-bg via-bg/95 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <button type="button" onClick={() => setIsManualOpen(true)} className="w-full min-h-14 rounded-2xl bg-success text-[#0F2A1A] font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-black/25 hover:brightness-105 transition focus-visible:ring-4 focus-visible:ring-calm" aria-label="Registrar entrada ou saída">
            <Plus size={22} strokeWidth={2.5} aria-hidden="true" /> Adicionar movimentação
          </button>
          {import.meta.env.DEV && (
            <button type="button" onClick={toggleRecording} disabled={isProcessing} className="mt-2 mx-auto flex items-center justify-center gap-2 text-xs text-text/60 underline underline-offset-4" aria-label="Testar microfone em desenvolvimento">
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              {isProcessing ? 'Processando áudio' : isRecording ? 'Parar teste de voz' : 'Teste de voz (desenvolvimento)'}
            </button>
          )}
        </div>
      </div>

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
