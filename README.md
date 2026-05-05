# Formulei

Aplicação web para auditoria de acessos com foco em governança, rastreabilidade e operação simples para o time.

## Stack

- React 19 + TypeScript + Vite
- React Router para fluxo entre formulário e dashboard
- Supabase (Auth + Postgres + RLS)
- Recharts para visualizações do dashboard
- Tailwind CSS + componentes de UI reutilizáveis

## Estrutura do projeto

```text
src/
  app/                  # App shell e rotas
  features/
    audit/              # Formulário de auditoria (UI + regras + persistência)
    collaborators/      # Gestão de diretório de colaboradores
    dashboard/          # Login, insights e validações por sistema (BI/Câmeras)
  lib/                  # Infra comum (env, cliente Supabase)
  shared/               # Tipos, UI base, hooks e utilitários reutilizáveis
```

Detalhes da arquitetura: `docs/ARCHITECTURE.md`.

## Pré-requisitos

- Node.js 20+
- pnpm 10+

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (`formulei/.env`) com:

```bash
VITE_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
VITE_SUPABASE_ANON_KEY="SUA_CHAVE_ANON"
```

> Se as variáveis não estiverem definidas, a aplicação continua funcional em modo local com fallback para `localStorage` no envio do formulário.

## Executar localmente

```bash
pnpm install
pnpm dev
```

## Build e qualidade

```bash
pnpm build
pnpm lint
```

## Banco de dados (Supabase)

- Schema principal: `supabase/schema.sql`
- O projeto está centralizado em um único schema versionado para facilitar setup e auditoria.

## Módulos principais na dashboard

- `Visão geral`: métricas agregadas de formulários e acessos.
- `Gerir colaboradores`: cadastro/consulta do diretório de colaboradores e setores.
- `Permissão Portal BI`: filtros e validação da diretoria por item de BI em modal.
- `Permissão Monitoramento Câmeras`: filtros e validação da diretoria por câmera em modal.

## Segurança

Resumo das decisões e checklist operacional em `docs/SECURITY.md`.
