# Registro por voz — prova de conceito BYOK

O Planejaí é uma demonstração, não um serviço financeiro em produção. O usuário informa sua própria chave do Google AI Studio uma vez; ela é lembrada no localStorage deste navegador, sem criptografia, com opções para substituir e apagar. Scripts executados na origem do aplicativo podem ler a chave. A chave não faz parte dos backups de transações e não é persistida no servidor.

Fluxo: microfone (máximo 5 segundos / 160 kB) → POST HTTPS /api/voice (áudio e chave própria) → Gemini 3.5 Flash-Lite → JSON validado → confirmação humana → IndexedDB. O Gemini nunca escreve diretamente no banco. Sem chave, o registro manual continua disponível.

## Configuração

- Build público: `VITE_VOICE_ENABLED=true` na Vercel Production e Preview.
- Função: `VOICE_ENABLED=true` na Vercel Production e Preview, somente depois de configurar proteção operacional (firewall/rate limits) e revisar o deploy.
- `GEMINI_MODEL` opcional; padrão `gemini-3.5-flash-lite`.
- Remover `GEMINI_API_KEY` e `VOICE_TEST_TOKEN` das variáveis de ambiente após validar a migração. A função BYOK não as utiliza.
- Nunca inserir uma chave em variáveis `VITE_*`, URLs ou repositório.

## Limitações e segurança

- O armazenamento local da chave não é um cofre. Recomendar chave exclusiva, sem faturamento ou com cotas estritas.
- A função não autentica usuários. A verificação de Origin é defesa complementar e **não** é rate limiting; antes de exposição pública, configurar limites na Vercel para impedir abuso da infraestrutura. BYOK limita o gasto da chave do projeto, mas não impede chamadas automatizadas.
- Áudio e chave transitam pela Vercel e são encaminhados ao Google. Não são registrados pelo código da função, mas políticas de tratamento dos provedores continuam aplicáveis.
- O endpoint rejeita métodos diferentes de POST, origens incompatíveis, chaves malformadas e áudio acima do limite; timeout de 12 segundos.
- Transações financeiras ficam apenas no IndexedDB local; backup JSON não criptografado. Limpar dados do navegador pode apagar histórico e chave.
- Se a chave for comprometida, revogar no Google AI Studio e substituí-la.

## Checklist antes do encerramento

1. `npm run build` e `npm audit` sem falhas relevantes.
2. No celular HTTPS: inserir chave, recarregar, confirmar que persiste, substituir e apagar.
3. Testar entrada, saída, valor ambíguo, permissão de microfone negada, erro do Google e fallback manual.
4. Testar confirmação/edição antes de gravar, backup e restauração.
5. Configurar proteção de tráfego na Vercel; publicar somente após revisão. Documentar que é demonstração experimental.
