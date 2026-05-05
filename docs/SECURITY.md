# Segurança

Este documento resume práticas de segurança aplicadas no projeto e checklist para operação.

## 1) Supabase e chaves

- O frontend usa apenas variáveis públicas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Não existe uso de `service_role` no cliente.

## 2) Row Level Security (RLS)

O schema em `supabase/schema.sql` habilita RLS para:

- `public.formularios`
- `public.colaboradores`
- `public.colaboradores_diretorio`
- `public.sistemas`
- `public.acessos`

E define políticas explícitas para `anon` e `authenticated` em operações de leitura e inserção.

## 3) Autenticação do dashboard

- Login via Supabase Auth (`signInWithPassword`).
- Sessão observada por `onAuthStateChange`.
- Rota `/dashboard` protegida com redirecionamento para `/dashboard/login` quando sem sessão.

## 4) Fallback local

Quando Supabase não está configurado:

- Submissões são salvas em `localStorage`.
- Validações da diretoria (Portal BI e Monitoramento de Câmeras) também usam `localStorage`.
- Esse modo é útil para desenvolvimento, mas não substitui controle de acesso de produção.

## 5) Validação da diretoria (BI e Câmeras)

- O parecer da diretoria é salvo em `acessos.status` (`Adequado` / `Não adequado` / `Pendente`).
- Observações são salvas em `acessos.ajuste`.
- As telas de validação trabalham por item individual (BI/câmera) e consolidam o status da linha para persistência.

## 6) Checklist antes de produção

- [ ] Confirmar RLS ativo em todas as tabelas expostas.
- [ ] Revisar políticas para menor privilégio possível.
- [ ] Garantir uso exclusivo de chave `anon` no frontend.
- [ ] Configurar rotação de senha e MFA para usuários do dashboard.
- [ ] Revisar retenção de dados e LGPD conforme política interna.
- [ ] Configurar monitoramento de falhas de login e erros de persistência.
- [ ] Definir política de retenção para pareceres salvos em `localStorage` (ambiente dev).
