<div align="center">

# 💸 Planejaí

### Controle financeiro pessoal com registro por voz e IA

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini_AI-Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)]()

</div>

> App de finanças pessoais **mobile-first** com registro de transações por **voz**, processamento por IA (Google Gemini), armazenamento 100% local (IndexedDB via Dexie) e dashboard com análise de gastos — tudo sem backend.

---

## ✨ Funcionalidades

### 🎙️ Registro por Voz com IA
Fale naturalmente — o Gemini transcreve e extrai automaticamente:
- **Valor** da transação
- **Tipo**: entrada ou saída
- **Categoria** (Alimentação, Transporte, Salário…)
- **Descrição** resumida

> *Exemplo: "Gastei trinta reais no mercado hoje"*  
> → `{ valor: 30.00, tipo: "saida", categoria: "Alimentação", descricao: "Compras no mercado" }`

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

### 💾 100% Local — Sem Backend
- Todos os dados ficam no **IndexedDB do próprio navegador** via [Dexie.js](https://dexie.org)
- Privacidade total: nenhum dado financeiro sai do dispositivo
- Funciona offline após o primeiro carregamento

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
| IA | Google Gemini (via API REST, multimodal áudio) |
| PWA | Web App Manifest |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Chave da API do Google Gemini (gratuita em [aistudio.google.com](https://aistudio.google.com))

### Instalação

```bash
# Clone o repositório
git clone https://github.com/GustavoDMentz/Planejai-atualizado.git
cd Planejai-atualizado

# Instale as dependências
npm install
```

### Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
```

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

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_GEMINI_API_KEY` | Chave da API do Google Gemini | — (obrigatório) |
| `VITE_GEMINI_MODEL` | Modelo Gemini a usar | `gemini-3.5-flash` |

> ⚠️ Nunca commite o arquivo `.env` — ele já está no `.gitignore`.

---

## 📄 Licença

MIT — uso livre.
