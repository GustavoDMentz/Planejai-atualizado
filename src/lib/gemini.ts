export interface ExtractedTransaction {
  valor: number;
  categoria: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
}

export async function extractTransactionFromAudio(
  base64Audio: string,
  mimeType: string = 'audio/webm'
): Promise<ExtractedTransaction> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('API Key não configurada');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Você é um extrator de dados JSON. Receba o áudio e retorne APENAS um objeto JSON no formato: {\"valor\": number, \"categoria\": string, \"tipo\": \"entrada\" | \"saida\", \"descricao\": string}. Não adicione explicações ou Markdown fora do JSON." },
          { inline_data: { mime_type: mimeType, data: base64Audio } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    throw new Error('Falha na comunicação com a IA');
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Resposta bruta Gemini:', rawText);
  return JSON.parse(rawText) as ExtractedTransaction;
}
