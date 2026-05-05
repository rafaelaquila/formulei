export interface PortalBiReport {
  id: string
  nome: string
  nivelDados: string
}

/** Catálogo de relatórios do Portal BI e respectivo nível de dados. */
export const PORTAL_BI_CATALOG: PortalBiReport[] = [
  { id: 'telemetria', nome: 'Telemetria', nivelDados: 'Telemetria, KM Rodado, Consumo de Combustível' },
  {
    id: 'manutencao-60-dias',
    nome: 'Manutenção 60 dias',
    nivelDados: 'Ordens de Serviço VDC e BDO',
  },
  {
    id: 'faturamento-por-filial',
    nome: 'Faturamento por Filial',
    nivelDados: 'Faturalmento Total, Por Filial, Cliente,Por Empresa',
  },
  {
    id: 'rentabilidade-contratos-frete',
    nome: 'Rentabilidade - Contratos de Frete',
    nivelDados: 'Depesas por CTRB, Rentabilidade, Impostos',
  },
  {
    id: 'monitoramento-servidores',
    nome: 'Monitoramento Servidores',
    nivelDados: 'Processamento do Servidor',
  },
  {
    id: 'faturamento-placa-composicao',
    nome: 'Faturamento por Placa e Composição',
    nivelDados: 'Faturamento por Composição, Cliente e Placa',
  },
  {
    id: 'centro-custo-ordem-compra',
    nome: 'Centro de Custo - Ordem de Compra',
    nivelDados: 'Ordens de Compra por Comprador, Centro de Custo e Empresa',
  },
  {
    id: 'apuracao-faturamento-amostragem',
    nome: 'Apuração de Faturamento por Amostragem',
    nivelDados: 'Faturamento por Placa e KM',
  },
  {
    id: 'produtividade-motoristas-regra-final-excludente',
    nome: 'Produtividade Motoristas - Regra Final Excludente',
    nivelDados: 'Premiação de Produtividade, KM, Faturamento por Motorista',
  },
  {
    id: 'premiacao-direcao-segura-economica',
    nome: 'Premiação Direção Segura e Econômica',
    nivelDados: 'Premiação de Economia, KM/L, Eventos Telemetria por Motorista',
  },
  {
    id: 'media-combustivel',
    nome: 'Média de Combustível',
    nivelDados: 'Consumo de Combustível, KM Percorrido por Acerto/Motorista',
  },
  {
    id: 'inadimplencia-por-titulo',
    nome: 'Inadimplência por Título',
    nivelDados: 'Titulos Financeiros por CNPJ, Valor de Inadimplência',
  },
  {
    id: 'premiacao-gestor-frota-acertos',
    nome: 'Premiação Gestor de Frota - Acertos',
    nivelDados: 'Receita, Gasto com Diesel, por Composiçõ e Acerto/Motorista',
  },
  {
    id: 'representatividade-custos-xml-senior',
    nome: 'Representatividade de Custos - XML e Senior',
    nivelDados: 'Impostos, Receitas e Despesas por CNPJ',
  },
  {
    id: 'km-rodado-smp',
    nome: 'KM Rodado por SMP',
    nivelDados: 'KM Rodado Diario, por Placa, Composição e Cliente',
  },
  {
    id: 'produtividade-motoristas',
    nome: 'Produtividade Motoristas',
    nivelDados: 'KM Rodado, Proventos, Prêmios, Receita, Provisões por Motorista/Acerto',
  },
  {
    id: 'produtividade-motoristas-regra-final',
    nome: 'Produtividade Motoristas - Regra Final',
    nivelDados:
      'KM Rodado, Prêmios, Consumo de Combustível, Gasto Diesel, Receita Motorista/Acerto',
  },
  {
    id: 'relatorio-averbacao',
    nome: 'Relatório de Averbação',
    nivelDados: 'Averbação, Valor Mercadoria por Cliente',
  },
  {
    id: 'permanencia-na-base',
    nome: 'Permanência na Base',
    nivelDados: 'Veículos em Brumado',
  },
  {
    id: 'faturamento-por-filial-sem-icms',
    nome: 'Faturamento por Filial sem ICMS',
    nivelDados: 'Faturalmento Total, Por Filial, Cliente,Por Empresa -  Sem o ICMS',
  },
  {
    id: 'auditoria-combustivel',
    nome: 'Auditoria de Combustível',
    nivelDados: 'KM Rodado, Consumo de Combustível por Acerto e Telemetria',
  },
  {
    id: 'produtividade-motoristas-nova-regra',
    nome: 'Produtividade Motoristas Nova Regra',
    nivelDados: 'Premiação de Produtividade, KM, Faturamento por Motorista',
  },
  {
    id: 'km-rodado-x-hora-extra',
    nome: 'KM Rodado x Hora Extra',
    nivelDados: 'Horas de Jornada e KM por Motorista',
  },
  {
    id: 'planejamento-ferias',
    nome: 'Planejamento Férias',
    nivelDados: 'Data de Admissão e Previsão de Aquisição de Férias por Colaborador/Departamento',
  },
  {
    id: 'veiculos-parados',
    nome: 'Veículos Parados',
    nivelDados: 'Monitoramento de Tempo Parado dos Veículos e sua localização atual',
  },
  {
    id: 'combustivel-apuracao-impostos',
    nome: 'Combustível Apuração de Impostos',
    nivelDados: 'Custo de Combustivel, Receita, Impostos por CNPJ',
  },
  {
    id: 'combustivel-apuracao-impostos-xml-2026',
    nome: 'Combustível Apuração de Impostos - XML 2026',
    nivelDados: 'Custo de Combustivel, Receita, Impostos por CNPJ - Origem XML',
  },
  {
    id: 'combustivel-apuracao-impostos-xml-2025',
    nome: 'Combustível Apuração de Impostos - XML 2025',
    nivelDados: 'Custo de Combustivel, Receita, Impostos por CNPJ - Origem XML',
  },
  {
    id: 'dre-comtrasil-2026',
    nome: 'DRE Comtrasil - 2026',
    nivelDados: 'Toda a Receita e Custos de todas as Empresas, Filiais e Contas',
  },
  {
    id: 'combustivel-receita-km-rodado-2025',
    nome: 'Combustível Receita x KM Rodado 2025',
    nivelDados: 'Custo de Combustivel, Receita, Impostos por CNPJ , KM Rodado',
  },
  {
    id: 'conciliacao-bancaria-novo',
    nome: 'Conciliação Bancária Novo',
    nivelDados: 'Titulos Financeiros, Faturas, IBC, CTEs Emitidos, por Cliente CNPJ',
  },
  {
    id: 'premiacao-produtividade',
    nome: 'Premiação Produtividade',
    nivelDados: 'Premiação de Produtividade, KM, Faturamento por Motorista',
  },
  {
    id: 'painel-manutencao',
    nome: 'Painel de Manutenção',
    nivelDados: 'Ordens de Serviço VDC e BDO',
  },
  {
    id: 'indicadores-produtividade-acerto-contas',
    nome: 'Indicadores Produtividade Acerto de Contas',
    nivelDados: 'Produção de Acertos',
  },
  {
    id: 'checklist-insumos',
    nome: 'Checklist - Insumos',
    nivelDados: 'Custos com Insumos de Carregamento',
  },
  {
    id: 'financeiro-baixas-condominio',
    nome: 'Financeiro - Baixas Condomínio',
    nivelDados: 'Comparativo de Notas de Débito com NF',
  },
  {
    id: 'monitoramento-synctruck',
    nome: 'Monitoramento SyncTruck',
    nivelDados: 'Logs do SyncTruck',
  },
  {
    id: 'controle-custos-chapa',
    nome: 'Controle de Custos - Chapa',
    nivelDados: 'Despesas com Chapa',
  },
  {
    id: 'bi-ordem-compras',
    nome: 'BI de Ordem de Compras',
    nivelDados: 'Despesas com Ordem de Compras por Filial e Departamento',
  },
  {
    id: 'acompanhamento-registros',
    nome: 'Acompanhamento de Registros',
    nivelDados: 'Total Contratações, Desligamentos, Exames Psicológicos',
  },
  {
    id: 'relatorio-borracharia',
    nome: 'RELATÓRIO_BORRACHARIA',
    nivelDados: 'Despesas Externas com Borracharia',
  },
  {
    id: 'bi-analise-resultados',
    nome: 'BI de Análise de Resultados',
    nivelDados: 'Receita, Gasto com Diesel, por Composiçõ e Acerto/Motorista',
  },
  {
    id: 'bi-insumos',
    nome: 'BI de Insumos',
    nivelDados: 'Movimentação de Itens Almoxarifado',
  },
  {
    id: 'resultados-abasteceu',
    nome: 'Resultados Abasteceu',
    nivelDados: 'Monitoramento de Logs Abasteceu',
  },
  {
    id: 'movimentacoes-almoxarifado',
    nome: 'Movimentações Almoxarifado',
    nivelDados: 'Movimentação de Itens Almoxarifado por Usuário',
  },
  {
    id: 'emissao-cte',
    nome: 'Emissão de CTE',
    nivelDados: 'Tempo de Última Emissão de CTE por Veículo',
  },
  {
    id: 'relatorio-horas-extras-oficina-vdc',
    nome: 'Relatório - Horas Extras Oficina VDC',
    nivelDados: 'Produtividade Manutenção VDC por Finais de Semana',
  },
  {
    id: 'despesas-vitoria-da-conquista',
    nome: 'Despesas Vitória da Conquista',
    nivelDados: 'Custos Filial de VDC',
  },
  {
    id: 'bi-melhores-piores-medias',
    nome: 'BI Melhores e Piores Médias',
    nivelDados: 'Receita, Gasto com Diesel, por Composiçõ e Acerto/Motorista KM/L',
  },
  {
    id: 'bi-insumos-totalizador',
    nome: 'BI de Insumos Totalizador',
    nivelDados: 'Movimentação de Itens Almoxarifado Totalizador',
  },
  {
    id: 'bi-manutencao-externa',
    nome: 'BI - Manutenção Externa',
    nivelDados: 'Ordens de Serviço Externa por Placa, Serviços e Itens',
  },
]

export function portalBiById(id: string): PortalBiReport | undefined {
  return PORTAL_BI_CATALOG.find((r) => r.id === id)
}
