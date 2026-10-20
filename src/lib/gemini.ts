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

/**
 * Fail closed: no Gemini credential is shipped in the browser.
 * Audio processing remains unavailable until an authenticated, rate-limited
 * server-side integration is implemented.
 */
export async function extractTransactionFromAudio(
  _base64Audio: string,
  _mimeType: string = 'audio/webm'
): Promise<ExtractedTransaction> {
  throw new Error('Registro por voz temporariamente indisponível por segurança. Use o registro manual.');
}

export function validateExtractedTransaction(value: unknown): ExtractedTransaction {
  if (!isTransaction(value)) throw new Error('Transação extraída inválida');
  return value;
}
