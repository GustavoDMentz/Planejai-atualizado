# Planejaí

**Gestão simples de entradas e saídas para pequenos empreendedores com deficiência**, incluindo pessoas que empreendem diante de barreiras de acesso ao mercado de trabalho.

O Planejaí busca apoiar a autonomia na organização financeira de um pequeno negócio. Não é um ERP contábil completo, não calcula lucro contábil nem substitui orientação profissional. A acessibilidade é parte do objetivo do produto, mas ainda precisa de validação com usuários reais e tecnologias assistivas.

## O que funciona hoje

- Registro manual de entradas e saídas, com edição e exclusão.
- Resumo das movimentações do mês e histórico recente.
- Gráficos de entradas e saídas nos últimos sete dias e saldo acumulado do histórico.
- Tradutor de termos contábeis em linguagem simples.
- Exportação e restauração de backup JSON, com validação, confirmação e substituição atômica dos registros.

**Registro por voz experimental (BYOK):** o usuário fornece uma chave do Google AI Studio, armazenada no localStorage do próprio navegador sem criptografia. O áudio e a chave são enviados via HTTPS à função `/api/voice` da Vercel e ao Google. A IA apenas sugere a transação; o usuário confirma antes de salvar. O microfone depende de `VITE_VOICE_ENABLED=true` no build e `VOICE_ENABLED=true` na função. Consulte `docs/voice-integration.md`.

## Dados, privacidade e limitações

Os registros são armazenados **somente no IndexedDB deste navegador e deste dispositivo** (Dexie). Não há login, sincronização entre aparelhos nem backup automático em nuvem.

**Estado da prova de conceito:** os registros permanecem localmente entre sessões normais, mas não há recuperação automática se o navegador for limpo ou o aparelho perdido. O único serviço remoto é o proxy de voz, que não armazena as transações. A chave de voz não entra no backup financeiro.

**Atenção: apagar os dados do navegador, usar outro perfil ou trocar de aparelho pode fazer os registros desaparecerem.** Exporte backups periodicamente e antes de trocar de dispositivo. O backup é um arquivo JSON **sem criptografia**: guarde-o em local privado e confiável. Restaurar um backup **substitui todos os registros atuais** após confirmação.

O saldo exibido é **entradas menos saídas registradas** no período. Não é lucro líquido, saldo bancário conciliado ou relatório contábil.

O projeto contém um manifesto de instalação, mas **não promete funcionamento offline**: não há garantia de cache de aplicação para uso sem rede. A persistência dos dados locais depende das políticas de armazenamento do navegador.

## Tecnologias

React 18, TypeScript, Vite 8, Tailwind CSS 4, Radix UI, Dexie/IndexedDB, Recharts e Lucide. Frontend estático com função serverless opcional para interpretação de voz.

## Desenvolvimento

Requer Node.js compatível com as dependências do projeto.

```bash
npm install
npm run dev
npm run build
npm run preview
```

Não configure segredos em variáveis `VITE_`: valores desse prefixo são incluídos no código entregue ao navegador. Registro manual não exige chave. O recurso de voz exige chave própria do Google AI Studio configurada pelo usuário no navegador; nunca inclua a chave em variáveis `VITE_*`.

## Publicação

**Aplicação publicada:** https://planejai-atualizado.vercel.app

O deploy de produção é feito pela Vercel a partir da branch `main`. O registro por voz com Gemini utiliza chave fornecida pelo próprio usuário (BYOK), e a rota `/api/voice` possui uma regra ativa de rate limiting no firewall da Vercel (10 requisições por 60 segundos por IP). A disponibilidade do serviço de IA depende da chave, dos limites e das condições do provedor.

## Verificações e cuidados de manutenção

- [ ] `npm run build` concluído sem erros.
- [ ] `npm audit --omit=dev` revisado; dependências de desenvolvimento também avaliadas separadamente, sem atualizações major automáticas.
- [ ] Registrar, editar, excluir e restaurar dados de teste; conferir persistência após recarregar a página.
- [ ] Confirmar que um backup inválido não apaga os dados existentes e que o usuário compreende a substituição na restauração.
- [ ] Testar teclado (Tab, Enter, Esc), foco, zoom de 200%, viewport móvel e pelo menos um leitor de tela.
- [ ] Revisar mensagens e fluxos com pessoas com deficiência, quando possível; testes técnicos não equivalem a validação de acessibilidade.
- [x] Deploy de Production concluído com status `READY` na Vercel; fluxo de voz testado no Preview.
- [ ] Realizar verificação funcional também no domínio de Production (incluindo voz, gravação e persistência).
- [x] Configurar proteção contra abuso/rate limiting no firewall da Vercel; BYOK e verificação de Origin não substituem esse controle.
- [x] Remover `GEMINI_API_KEY` e `VOICE_TEST_TOKEN` legados da Vercel e confirmar variáveis `VOICE_ENABLED` e `VITE_VOICE_ENABLED` em Production.
- [ ] Confirmar ausência de chaves, arquivos `.env` e dados reais no bundle de produção.

## Deploy e manutenção

A Vercel hospeda o frontend e a função serverless opcional de voz. Os itens ainda não marcados acima são verificações recomendadas para manutenção e validação adicional; não devem ser interpretados como testes já executados. Revisar dependências e falhas de segurança periodicamente, com alterações pequenas e testadas. Evitar ampliar o escopo sem necessidade demonstrada.

## Licença

Verificar o arquivo de licença e a titularidade do projeto antes de declarar condições de reutilização pública.
