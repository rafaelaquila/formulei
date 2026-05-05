import type { AccessType } from '@/shared/types/audit'

/** Placeholder específico por tipo de acesso (sem template genérico). */
export const OBSERVATION_PLACEHOLDERS: Record<AccessType, string> = {
  'Sem acesso':
    'Ex.: Não utilizo este sistema no dia a dia; apenas abro o menu inicial em raras ocasiões.',
  Consulta:
    'Ex.: Consulto cadastro de motoristas e histórico de viagens para conferência, sem alterar dados.',
  Inclusão:
    'Ex.: Incluo novos cadastros de veículos e anexo documentação digitalizada conforme checklist do setor.',
  Alteração:
    'Ex.: Atualizo dados cadastrais de clientes após validação do gestor e registro no protocolo interno.',
  Exclusão:
    'Ex.: Removo registros duplicados ou obsoletos somente após aprovação formal e backup exportado.',
  'Aprovação/autorização':
    'Ex.: Libero faturas e documentos pendentes na fila de aprovação dentro do meu perfil de aprovador.',
  Administração:
    'Ex.: Gerencio usuários locais, permissões de perfil e parâmetros de integração autorizados ao meu cargo.',
  'Exportação de dados':
    'Ex.: Extraio relatórios de consumo e km em CSV para auditoria mensal, sem compartilhar fora da empresa.',
}

export const OBSERVACAO_EXTRA_MONITORAMENTO_PLACEHOLDER =
  'Ex.: Horários em que costuma acessar as câmeras, motivo da consulta (incidente, rotina), ou restrições acordadas com a liderança.'

export const OBSERVACAO_EXTRA_PORTAL_BI_PLACEHOLDER =
  'Ex.: Uso restrito a consultas do próprio setor, sem exportação externa; dúvidas sobre filtros padrão do relatório.'
