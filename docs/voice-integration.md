# Integração de voz — PR experimental

O botão de voz fica **desabilitado por padrão**. Não ativar em produção pública até configurar proteção efetiva contra abuso (rate limiting persistente no edge/WAF, orçamento/cotas e observabilidade). Uma função serverless isolada não oferece limite confiável por IP usando memória local.

## Variáveis na Vercel

- `GEMINI_API_KEY`: segredo somente no servidor; **nunca** `VITE_GEMINI_API_KEY`.
- `GEMINI_MODEL`: modelo habilitado para áudio e disponível na cota gratuita do projeto; padrão `gemini-3.5-flash-lite`, sujeito à disponibilidade da conta.
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

## Teste restrito no Preview

O endpoint exige também `VOICE_TEST_TOKEN` (segredo de pelo menos 32 caracteres). O frontend solicita esse token no primeiro clique do microfone, mantendo-o apenas em memória até a página ser recarregada. O servidor confere o cabeçalho `x-voice-test-token` antes de chamar o Gemini. Não coloque esse token em variáveis `VITE_*` nem em arquivos versionados. O token compartilhado é apenas uma barreira para teste privado, não rate limiting nem autenticação por usuário. Caso seja divulgado, rotacione imediatamente.

Para Preview restrito: `GEMINI_API_KEY`, `VOICE_TEST_TOKEN` e `VOICE_ENABLED=true` no ambiente Preview, e `VITE_VOICE_ENABLED=true` durante o build. Faça um novo deploy após configurar. Não configure essas flags em Production. O token de teste pode ser gerado localmente com `openssl rand -hex 32` e colado somente no painel da Vercel e no prompt do navegador de teste. Confirme previamente o modelo/cota gratuita no AI Studio. Antes de produção pública, implementar rate limiting persistente/edge e política de privacidade para envio de áudio.
