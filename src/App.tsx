import { useState, useCallback } from 'react';
import { db, Transaction } from './db';

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
      setStatusMessage('Processando com calma...');

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error('API Key não configurada');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `Você é um extrator de dados financeiros para pessoas com TDAH e Autismo. Seja extremamente preciso. Pegue a frase do usuário e retorne APENAS um objeto JSON no formato: { type: 'income'|'expense', amount: number, description: string, category: string }. Não adicione explicações, crases de markdown ou qualquer outro texto.\n\nFrase: "${transcript}"` }]
            }]
          })
        });

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedJson = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedJson) as ExtractedData;

        setExtractedData(parsed);
        setShowConfirmation(true);
        setStatusMessage('');
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
      setStatusMessage('Salvo com sucesso!');
      setShowConfirmation(false);
      setExtractedData(null);
      setTimeout(() => setStatusMessage(''), 3000);
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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-text font-sans" aria-label="Tela principal do Planejaí">
      <h1 className="text-3xl font-bold mb-8" aria-label="Bem-vindo ao Planejaí">Planejaí</h1>

      {statusMessage && (
        <p className="text-lg mb-6 text-center min-h-[1.75rem]" role="status" aria-live="polite">{statusMessage}</p>
      )}

      {!showConfirmation && (
        <button
          onClick={startListening}
          disabled={isListening || isLoading}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all focus:outline-none focus:ring-4 focus:ring-calm ${
            isListening ? 'bg-alert animate-pulse' : 'bg-calm hover:bg-success'
          }`}
          aria-label={isListening ? 'Ouvindo sua voz' : 'Clique para falar'}
        >
          {isListening ? '🎙️' : '🎤'}
        </button>
      )}

      {showConfirmation && extractedData && (
        <section className="w-full max-w-md p-6 rounded-2xl border-2 border-calm/40 bg-bg" aria-label="Confirmação de dados extraídos">
          <h2 className="text-xl font-semibold mb-4 text-center">Eu entendi direito?</h2>
          <div className="space-y-3 mb-6 text-lg">
            <p><strong>Valor:</strong> R$ {extractedData.amount.toFixed(2)}</p>
            <p><strong>Descrição:</strong> {extractedData.description}</p>
            <p><strong>Categoria:</strong> {extractedData.category}</p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleSave}
              className="w-full py-4 rounded-xl bg-success text-text font-semibold text-lg hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm"
              aria-label="Sim, salvar os dados"
            >
              Sim, salvar
            </button>
            <button
              onClick={handleRetry}
              className="w-full py-4 rounded-xl bg-alert text-text font-semibold text-lg hover:opacity-90 transition focus:outline-none focus:ring-4 focus:ring-calm"
              aria-label="Não, tentar de novo"
            >
              Não, tentar de novo
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
