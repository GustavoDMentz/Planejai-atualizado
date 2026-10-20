# Integração de voz — PR experimental

O botão de voz fica **desabilitado por padrão**. Não ativar em produção pública até configurar proteção efetiva contra abuso (rate limiting persistente no edge/WAF, orçamento/cotas e observabilidade). Uma função serverless isolada não oferece limite confiável por IP usando memória local.

## Variáveis na Vercel

- `GEMINI_API_KEY`: segredo somente no servidor; **nunca** `VITE_GEMINI_API_KEY`.
- `GEMINI_MODEL`: modelo habilitado para áudio e disponível na cota gratuita do projeto; padrão provisório `gemini-2.5-flash-lite`, sujeito à disponibilidade da conta.
- `VOICE_ENABLED=true`: libera a função **somente após** a proteção de abuso estar configurada.
- `VITE_VOICE_ENABLED=true`: exibe o botão de voz na compilação do frontend; requer novo build.

Na primeira implantação, mantenha ambos os flags desativados. Se a cota acabar, o registro manual continua funcionando.

## Testes necessários antes de liberar

1. Verificar suporte ao modelo e cota no Google AI Studio, sem habilitar faturamento pago.
2. Configurar proteção antiabuso efetiva na Vercel (rate limiting no edge ou serviço equivalente) e verificar requisições repetidas.
3. Testar no deploy de preview, em celular real, áudios WebM/MP4/OGG, permissão negada e timeout.
4. Testar valores ambíguos, áudio vazio, áudio acima de 160 KB, respostas inválidas e HTTP 429.
5. Conferir que a confirmação é obrigatória e que nada é gravado antes dela.
6. Conferir que o segredo não aparece em arquivos do bundle, logs nem respostas.
7. Revisar consentimento e privacidade: áudio é enviado ao serviço externo para interpretação.

Não há autenticação no MVP; o endpoint é público quando ativado. A proteção por cota do provedor não substitui controles de abuso do aplicativo.
