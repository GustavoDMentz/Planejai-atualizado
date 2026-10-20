# Planejaí

**Gestão simples de entradas e saídas para pequenos empreendedores com deficiência**, incluindo pessoas que empreendem diante de barreiras de acesso ao mercado de trabalho.

O Planejaí busca apoiar a autonomia na organização financeira de um pequeno negócio. Não é um ERP contábil completo, não calcula lucro contábil nem substitui orientação profissional. A acessibilidade é parte do objetivo do produto, mas ainda precisa de validação com usuários reais e tecnologias assistivas.

## O que funciona hoje

- Registro manual de entradas e saídas, com edição e exclusão.
- Resumo das movimentações do mês e histórico recente.
- Gráficos de entradas e saídas nos últimos sete dias e saldo acumulado do histórico.
- Tradutor de termos contábeis em linguagem simples.
- Exportação e restauração de backup JSON, com validação, confirmação e substituição atômica dos registros.

**Registro por voz está indisponível por segurança.** Não há integração ativa com Gemini, nem chave de API no navegador. A experiência não deve ser apresentada como controle por voz até existir uma implementação segura e testada.

## Dados, privacidade e limitações

Os registros são armazenados **somente no IndexedDB deste navegador e deste dispositivo** (Dexie). Não há login, sincronização entre aparelhos nem backup automático em nuvem.

**Estado do MVP:** o armazenamento local atual permite manter registros entre sessões normais do navegador, mas **a estratégia definitiva de persistência, backup e recuperação ainda está em estudo**. Ainda não há garantia de recuperação se os dados do navegador forem removidos ou se o aparelho for perdido. A escolha futura será orientada por testes em dispositivos móveis e pelas necessidades de acessibilidade do público-alvo; não há backend ou serviço de nuvem definido.

**Atenção: apagar os dados do navegador, usar outro perfil ou trocar de aparelho pode fazer os registros desaparecerem.** Exporte backups periodicamente e antes de trocar de dispositivo. O backup é um arquivo JSON **sem criptografia**: guarde-o em local privado e confiável. Restaurar um backup **substitui todos os registros atuais** após confirmação.

O saldo exibido é **entradas menos saídas registradas** no período. Não é lucro líquido, saldo bancário conciliado ou relatório contábil.

O projeto contém um manifesto de instalação, mas **não promete funcionamento offline**: não há garantia de cache de aplicação para uso sem rede. A persistência dos dados locais depende das políticas de armazenamento do navegador.

## Tecnologias

React 18, TypeScript, Vite 5, Tailwind CSS 3, Radix UI, Dexie/IndexedDB, Recharts e Lucide. Aplicação estática, sem backend.

## Desenvolvimento

Requer Node.js compatível com as dependências do projeto.

```bash
npm install
npm run dev
npm run build
npm run preview
```

Não configure segredos em variáveis `VITE_`: valores desse prefixo são incluídos no código entregue ao navegador. Nenhuma chave de API é necessária para o funcionamento atual.

## Critérios antes do deploy público

- [ ] `npm run build` concluído sem erros.
- [ ] `npm audit --omit=dev` revisado; dependências de desenvolvimento também avaliadas separadamente, sem atualizações major automáticas.
- [ ] Registrar, editar, excluir e restaurar dados de teste; conferir persistência após recarregar a página.
- [ ] Confirmar que um backup inválido não apaga os dados existentes e que o usuário compreende a substituição na restauração.
- [ ] Testar teclado (Tab, Enter, Esc), foco, zoom de 200%, viewport móvel e pelo menos um leitor de tela.
- [ ] Revisar mensagens e fluxos com pessoas com deficiência, quando possível; testes técnicos não equivalem a validação de acessibilidade.
- [ ] Conferir HTTPS, configuração do domínio, respostas HTTP e publicação estática no provedor escolhido.
- [ ] Confirmar ausência de chaves, arquivos `.env` e dados reais no bundle de produção.

## Deploy e manutenção

Publicar somente depois dos critérios de aceitação. Um provedor de hospedagem estática, como a Vercel, é suficiente para a arquitetura atual. Revisar dependências e falhas de segurança periodicamente, com alterações pequenas e testadas. Evitar ampliar o escopo sem necessidade demonstrada.

## Licença

Verificar o arquivo de licença e a titularidade do projeto antes de declarar condições de reutilização pública.
