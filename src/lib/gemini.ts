export interface ExtractedTransaction {
  valor: number;
  categoria: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
}

function isTransaction(value: unknown): value is ExtractedTransaction {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.valor === 'number' && Number.isFinite(v.valor) &&
    v.valor > 0 && v.valor <= 1_000_000_000 &&
    Math.round(v.valor * 100) / 100 === v.valor &&
    (v.tipo === 'entrada' || v.tipo === 'saida') &&
    typeof v.categoria === 'string' && v.categoria.trim().length > 0 && v.categoria.length <= 80 &&
    typeof v.descricao === 'string' && v.descricao.trim().length > 0 && v.descricao.length <= 240;
}

/** Sends short audio to a server endpoint; never stores a Gemini key in the browser. */
export async function extractTransactionFromAudio(
  base64Audio: string,
  mimeType: string = 'audio/webm',
  testToken: string
): Promise<ExtractedTransaction> {
  const response = await fetch('/api/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-voice-test-token': testToken },
    body: JSON.stringify({ audio: base64Audio, mimeType }),
  });
  if (!response.ok) throw new Error('Serviço de voz indisponível.');
  return validateExtractedTransaction(await response.json());
}

export function validateExtractedTransaction(value: unknown): ExtractedTransaction {
  if (!isTransaction(value)) throw new Error('Transação extraída inválida');
  return value;
}
