# Arquitetura do Formulei

## Objetivos

- Separar regras de negócio, infraestrutura e UI por domínio.
- Facilitar manutenção com baixo acoplamento entre telas.
- Permitir fallback local quando Supabase não estiver configurado.

## Organização por camadas

```text
src/
  app/
    App.tsx                     # Rotas e guarda de autenticação do dashboard
  features/
    audit/
      pages/                    # Página do formulário
      hooks/                    # Orquestração de estado e submit
      model/                    # Factory + validação do domínio de auditoria
      api/                      # Repositório de persistência da auditoria
      storage/                  # Fallback local (localStorage)
    collaborators/
      pages/                    # Gestão de colaboradores
      api/                      # Diretório de colaboradores e setores
    dashboard/
      pages/                    # Login, visão geral e validações por sistema
      auth/                     # Sessão/login/logout
      api/                      # Agregações, listagens e persistência de parecer da diretoria
  lib/
    env.ts                      # Variáveis públicas e validação
    supabase/client.ts          # Cliente Supabase singleton
  shared/
    types/                      # Tipos compartilhados de domínio
    constants/                  # Catálogos fixos (sistemas, vínculo, status)
    hooks/                      # Hooks reutilizáveis
    lib/                        # Utilitários puros (datas, CSV)
    ui/                         # Componentes base de interface
```

## Fluxo principal (formulário)

1. `AuditFormPage` renderiza a UI e usa `useAuditForm`.
2. `useAuditForm` controla estado, validação e feedback de erro/sucesso.
3. `submitAudit` persiste no Supabase quando configurado.
4. Sem Supabase, `appendLocalSubmission` salva em `localStorage`.

## Fluxo do dashboard

1. `App.tsx` verifica sessão e protege a rota `/dashboard`.
2. `DashboardLoginPage` autentica via `loginDashboard`.
3. `DashboardPage` lê métricas via `getDashboardInsights`.
4. `PortalBiPermissionsPage` e `CameraMonitoringPermissionsPage` exibem permissões por colaborador com filtros.
5. A validação da diretoria é feita por item (BI/Câmera) via modal, com consolidação de status por linha.
6. Se tabelas não existirem ou Supabase não estiver configurado, os módulos usam fallback em `localStorage`.

## Decisões técnicas

- **Alias `@/`** para imports absolutos no `src`, reduzindo imports relativos longos.
- **Repositórios por feature** para concentrar acesso a dados.
- **Hooks de UI isolados** (`useToast`, `useDraft`) para reaproveitamento e testes.
- **Tipos de domínio centralizados** em `shared/types/audit.ts`.

## Pontos de extensão

- Extrair a lógica compartilhada de validação por item (BI/Câmeras) para um hook/componente comum.
- Adicionar testes unitários para `audit.validation.ts`, `dashboard.repository.ts` e repositórios de permissões.
- Adicionar observabilidade (logs e tracing) no fluxo de submit.
- Evoluir autenticação com perfis/permissões para múltiplos níveis de dashboard.
