<div align="center">

# 💸 Planejaí

### Controle financeiro pessoal com registro manual

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)]()

</div>

> App de finanças pessoais **mobile-first** com registro manual de transações, armazenamento local das transações (IndexedDB via Dexie) e dashboard com análise de gastos — tudo sem backend.

---

## ✨ Funcionalidades

### 🎙️ Registro por voz (temporariamente indisponível)
O envio de áudio e a integração com Gemini foram desativados por segurança. Use a entrada manual.

### 📊 Dashboard Financeiro
- Cards de **entradas**, **saídas** e **saldo do mês** em tempo real
- Lista das **3 transações mais recentes**
- Atualização **reativa** via `useLiveQuery` (Dexie) — sem refresh necessário

### 📈 Painel de Insights
- Gráficos de evolução de gastos por categoria (Recharts)
- Análise visual do histórico de transações

### ✏️ Entrada Manual
- Drawer de formulário completo para cadastro manual de qualquer transação
- Edição e exclusão de registros existentes

### 🔄 Tradutor de Transações
- Drawer auxiliar para re-categorizar ou corrigir transações extraídas por voz

### 📱 PWA — Funciona como App
- Instalável na tela inicial do celular (manifest.webmanifest)
- Interface otimizada para mobile com navegação por drawer
- Aviso de compatibilidade de browser integrado

### 💾 Backup e restauração
- Use **Exportar backup** para salvar um JSON local.
- **Restaurar backup** valida o arquivo e substitui todos os registros em uma única transação atômica, após confirmação.
- Faça uma cópia antes de restaurar. O arquivo contém dados financeiros pessoais sem criptografia.

### 💾 100% Local — Sem Backend
- Todos os dados ficam no **IndexedDB do próprio navegador** via [Dexie.js](https://dexie.org)
- As transações são armazenadas localmente; a integração de áudio com um serviço externo está temporariamente desabilitada por segurança
- O uso offline depende de cache prévio e de suporte PWA ainda não implementado

---

## 🏗️ Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilo | Tailwind CSS 3 + Fontsource (Lexend) |
| Componentes UI | Radix UI (Dialog, ToggleGroup) + Lucide Icons |
| Banco de dados | Dexie.js (IndexedDB) |
| Gráficos | Recharts |
| IA | Integração desativada por segurança |
| PWA | Web App Manifest |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+

### Instalação

```bash
# Clone o repositório
git clone https://github.com/GustavoDMentz/Planejai-atualizado.git
cd Planejai-atualizado

# Instale as dependências
npm install
```

### Variáveis de ambiente
Nenhuma chave de API é necessária. **Não configure `VITE_GEMINI_API_KEY`: variáveis `VITE_` são públicas no navegador.**

### Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse em: **http://localhost:5173**

### Build de produção

```bash
npm run build
npm run preview
```

> **Dica:** Se mudanças de configuração ou estilos não refletirem, limpe o cache do Vite:
> ```bash
> rm -rf node_modules/.vite && npm run dev
> ```

---

## 📂 Estrutura do Projeto

```
Planejai-atualizado/
├── public/
│   └── manifest.webmanifest      # Configuração PWA
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Painel principal com cards e saldo
│   │   ├── InsightsDrawer.tsx     # Drawer de gráficos e análises
│   │   ├── ManualEntryDrawer.tsx  # Formulário de entrada manual
│   │   ├── TranslatorDrawer.tsx   # Re-categorização de transações
│   │   ├── VoiceConfirmationDrawer.tsx  # Confirmação pós-gravação
│   │   ├── BrowserWarningModal.tsx      # Aviso de compatibilidade
│   │   └── BrowserWarningToast.tsx
│   ├── lib/
│   │   └── gemini.ts              # Integração com a API Gemini (áudio → JSON)
│   ├── db.ts                      # Schema e instância do Dexie (IndexedDB)
│   ├── App.tsx                    # Componente raiz e orquestração de estado
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais e tokens Tailwind
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🔐 Segurança e persistência

Não coloque segredos em variáveis `VITE_`. Os registros ficam no IndexedDB do navegador e podem ser perdidos se o armazenamento local for apagado. Exporte backups regularmente e mantenha os arquivos em local seguro.

## 📄 Licença

MIT — uso livre.
