# Portfólio Profissional — Engenharia Web, UI/UX & Operações em Escala

Portfólio interativo construído sob medida em **React 19 + TypeScript 5.8 + Vite 6 + Three.js**, com suporte nativo a **3 idiomas (`PT` / `EN` / `ES`)**, laboratórios executáveis no navegador e configuração pronta para deploy na **Vercel**.

---

## 1. Como continuar em outro PC

### Pré-requisitos na nova máquina
1. **Node.js** `v20 LTS` ou superior (recomendado `v20` ou `v22+`) — [nodejs.org](https://nodejs.org/)
2. **Git** instalado — [git-scm.com](https://git-scm.com/)

### Passo a passo para rodar localmente
Abra o terminal (PowerShell, Terminal do Windows, bash ou terminal do editor) e execute:

```bash
# 1. Clonar o repositório
git clone https://github.com/Cariocakrk/portifolio.git

# 2. Entrar na pasta do projeto
cd portifolio

# 3. Instalar todas as dependências
npm install

# 4. Iniciar o servidor de desenvolvimento local
npm run dev
```

O site abrirá em **`http://localhost:5173/`** com *Hot Reload* ativo.

> **Nota para Windows (PowerShell):** Caso o PowerShell bloqueie a execução de `npm.ps1` (`PSSecurityException`), rode `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` uma única vez no PowerShell, ou use `npm.cmd install` e `npm.cmd run dev`.

### Scripts disponíveis
| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local Vite em `http://localhost:5173/` |
| `npm run typecheck` | Valida toda a tipagem estrita do TypeScript (`tsc --noEmit`) |
| `npm run build` | Compila TypeScript e gera o pacote otimizado de produção em `dist/` |
| `npm run preview` | Testa localmente a versão compilada de produção (`dist/`) |

---

## 2. Onde personalizar seus dados e textos

1. **Dados centrais de perfil e contato** -> [`src/config/profile.ts`](./src/config/profile.ts)
   - Altere `brandMark`, `email`, `discord`, `githubUrl`, `linkedinUrl`, `availabilityStatus` e `metrics`.
2. **Textos e traduções (`PT`, `EN`, `ES`)** -> [`src/i18n/`](./src/i18n/)
   - [`src/i18n/pt.ts`](./src/i18n/pt.ts) — Português
   - [`src/i18n/en.ts`](./src/i18n/en.ts) — Inglês
   - [`src/i18n/es.ts`](./src/i18n/es.ts) — Espanhol
   - [`src/i18n/types.ts`](./src/i18n/types.ts) — Contrato TypeScript que garante paridade entre os 3 idiomas.
3. **Amostras de código do Workbench** -> [`src/data/codeSnippets.ts`](./src/data/codeSnippets.ts)

---

## 3. Mapa da Arquitetura (para retomada rápida)

```text
├── public/
│   └── favicon.svg                 # Ícone vetorial da aba
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Barra fixa + relógio ao vivo + barra de leitura + idiomas
│   │   ├── ChapterRail.tsx         # Régua Vernier lateral de capítulos (00–07)
│   │   ├── PrecisionReticle.tsx    # Cursor/retículo de precisão com amortecimento exponencial
│   │   ├── Hero.tsx                # Palco editorial + HUD de controle WebGL + métricas
│   │   ├── HeroMeshCanvas.tsx      # Campo tensorial 3D em Three.js (3 modos + ondas de choque)
│   │   ├── AboutSection.tsx        # Sobre mim + especificações + Matriz de Convergência
│   │   ├── SystemsSandbox.tsx      # 3 Labs ao vivo: Anti-Raid (Node), Física Δt (C++) e Busca NFD (JS)
│   │   ├── DevelopmentSection.tsx  # Seção de Engenharia + Workbench de 8 stacks com prova ao vivo
│   │   ├── InterfaceStudio.tsx     # Estúdio Duplo: Game HUD Tático (teclas 1–4) + Web Design System
│   │   ├── DesignSection.tsx       # Seção de UI/UX + Inspetor de Grid Suíço de 12 colunas
│   │   ├── CommunitySection.tsx    # Topologia 4 níveis, Playbook de Crises, Simulador de Staff + 12 domínios
│   │   ├── AreasSection.tsx        # Matriz suíça das 6 frentes operacionais
│   │   ├── CompetencyExplorer.tsx  # Diretório completo auditável com filtros rápidos e busca sem acento
│   │   ├── ContactSection.tsx      # Contato com cópia em 1 clique + resumo do sistema
│   │   ├── CommandPalette.tsx      # Paleta global Ctrl+K (abre labs, copia contato, troca idioma)
│   │   └── Footer.tsx              # Rodapé técnico + colofão
│   ├── config/profile.ts           # Credenciais, links e constantes globais do perfil
│   ├── data/codeSnippets.ts        # Snippets arquiteturais + syntax highlighter próprio
│   ├── hooks/useActiveSection.ts   # Detecção de capítulo ativo via IntersectionObserver
│   ├── i18n/                       # Contexto de idioma (URL ?lang=, localStorage) + dicionários PT/EN/ES
│   └── styles/
│       ├── tokens.css              # Paleta e escopos estritos por superfície (data-theme)
│       ├── global.css              # Reset, tipografia, textura física (grain) e utilitários
│       ├── components.css          # Layout editorial, seções e responsividade
│       └── labs.css                # Estilos dos laboratórios de engenharia, Game HUD e Design System
├── vercel.json                     # Configuração pronta de build, rotas SPA e cache imutável na Vercel
└── vite.config.ts                  # Code-splitting dedicado (chunk separado para Three.js e React)
```

---

## 4. Como subir na Vercel (Produção)

O arquivo [`vercel.json`](./vercel.json) já está configurado na raiz do projeto com preset **Vite**, headers de segurança, cache imutável para bundles e rewrite para SPA.

### Opção A — Pelo Painel da Vercel (Recomendado, deploy automático a cada `git push`)
1. Acesse [vercel.com](https://vercel.com/) e entre com sua conta **GitHub**.
2. Clique em **Add New...** -> **Project**.
3. Importe o repositório **`Cariocakrk/portifolio`**.
4. Confira as configurações (a Vercel detectará automaticamente pelo `vercel.json`):
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` *(caso o repositório tenha subpasta, selecione a pasta onde está o `package.json`)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Clique em **Deploy**. Em ~40 segundos sua URL pública estará no ar, e qualquer novo `git push` atualizará o site automaticamente.

### Opção B — Pela linha de comando (Vercel CLI)
```bash
# Login na Vercel (abre o navegador)
npx vercel login

# Deploy de preview
npx vercel

# Deploy direto para produção
npx vercel --prod
```

---

## 5. Fluxo Git para salvar alterações no outro PC

Sempre que terminar uma sessão de trabalho:

```bash
# Baixar eventuais mudanças remotas antes de começar
git pull origin main

# Verificar o que mudou e validar o build antes de subir
npm run build
git status

# Adicionar, criar commit e enviar ao GitHub
git add .
git commit -m "feat: atualização do portfólio"
git push origin main
```
