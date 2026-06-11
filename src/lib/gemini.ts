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

  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Você é um extrator de dados financeiros. Ouça o áudio e retorne um JSON com exatamente estes campos:
- "valor": número positivo (ex: 50.00)
- "tipo": EXATAMENTE "entrada" se for receita/ganho, ou EXATAMENTE "saida" (sem acento) se for gasto/despesa
- "categoria": categoria resumida em português (ex: "Alimentação", "Transporte", "Salário")
- "descricao": descrição curta do que foi dito

Retorne APENAS o JSON, sem markdown, sem explicação.`
            },
            { inline_data: { mime_type: mimeType, data: base64Audio } }
          ]
        }],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    console.error('Erro Gemini API:', err);
    throw new Error('Falha na comunicação com a IA');
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('Resposta bruta Gemini:', rawText);

  if (!rawText) throw new Error('Resposta vazia do modelo');

  const parsed = JSON.parse(rawText) as ExtractedTransaction;

  // Normaliza "saída" com acento para "saida"
  if ((parsed.tipo as string) === 'saída') parsed.tipo = 'saida';
  if ((parsed.tipo as string) === 'Entrada') parsed.tipo = 'entrada';
  if ((parsed.tipo as string) === 'Saida' || (parsed.tipo as string) === 'Saída') parsed.tipo = 'saida';

  return parsed;
}
