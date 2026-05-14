export interface CameraOption {
  id: string
  label: string
}

import type { CameraMonitoringUnit } from '@/shared/types/audit'

export type CameraUnit = CameraMonitoringUnit

/** Inventário Matriz Brumado — parte operacional / oficina. */
export const CAMERAS_MATRIZ_BRUMADO_PRINCIPAL: CameraOption[] = [
  { id: 'mb-1', label: '1- Box Pintura' },
  { id: 'mb-2', label: '2- Almoxarifado Superior LE' },
  { id: 'mb-3', label: '3- Almoxarifado Corredor AB' },
  { id: 'mb-4', label: '4- Almoxarifado Corredor CD' },
  { id: 'mb-5', label: '5- Almoxarifado Corredor J' },
  { id: 'mb-6', label: '6- Almoxarifado Corredor FG' },
  { id: 'mb-7', label: '7- Almoxarifado Corredor E' },
  { id: 'mb-8', label: '8- Via Lateral Almoxarifado' },
  { id: 'mb-9', label: '9- Almoxarifado Superior LD' },
  { id: 'mb-10', label: '10- Box Borracharia' },
  { id: 'mb-11', label: '11- Almoxarifado Entregas' },
  { id: 'mb-12', label: '12- Frente dos Box LE para LD' },
  { id: 'mb-13', label: '13- Box Solda' },
  { id: 'mb-14', label: '14- Vala' },
  { id: 'mb-15', label: '15- Depto. Elétrico' },
  { id: 'mb-16', label: '16- Ferramental' },
  { id: 'mb-17', label: '17- Via Cozinha e Banheiros' },
  { id: 'mb-18', label: '18- Box Borracharia 2' },
  { id: 'mb-19', label: '19- Box Carpintaria' },
  { id: 'mb-20', label: '20- Box Mecânica Pesada 2' },
  { id: 'mb-21', label: '21- Almoxarifado Sub Solo' },
  { id: 'mb-22', label: '22- Box Mecânica Pesada 1' },
  { id: 'mb-23', label: '23- Box Suspensão e Freios' },
  { id: 'mb-24', label: '24- Lateral Oficina / Posto' },
  { id: 'mb-25', label: '25- Fundo Compressor / Prédio ADM' },
  { id: 'mb-26', label: '26- Fundo Compressor / Lavador' },
  { id: 'mb-27', label: '27- Fundo Tampas / Lavador' },
  { id: 'mb-28', label: '28- Sala Manutenção Externa' },
  { id: 'mb-29', label: '29- Checklist / Pátio' },
  { id: 'mb-30', label: '30- Checklist' },
  { id: 'mb-31', label: '31- Almoxarifado Pedidos' },
  { id: 'mb-32', label: '32- Descarte de Oleo' },
  { id: 'mb-33', label: '33- Entrada Principal' },
  { id: 'mb-34', label: '34- Sala Monitoramento' },
  { id: 'mb-35', label: '35- Corredor Atendimento' },
  { id: 'mb-36', label: '36- Corredor Interno' },
  { id: 'mb-37', label: '37- Financeiro / Suprimentos' },
  { id: 'mb-38', label: '38- Contabilidade' },
  { id: 'mb-39', label: '39- Logistica Programadores' },
  { id: 'mb-40', label: '40- Hall de entrada Predio' },
  { id: 'mb-41', label: '41- Servidor Interno' },
  { id: 'mb-42', label: '42- Portão Veiculos' },
  { id: 'mb-43', label: '43- Estacionamento interno adm' },
  { id: 'mb-44', label: '44- Portaria Entrada' },
  { id: 'mb-45', label: '45- Guarita' },
  { id: 'mb-46', label: '46- Portaria Interna' },
  { id: 'mb-47', label: '47- Rua de acesso a Oficina' },
  { id: 'mb-48', label: '48- Diretoria / Juridico' },
  { id: 'mb-49', label: '49- Estacionamento Externo' },
  { id: 'mb-50', label: '50- Caixa Dagua' },
  { id: 'mb-51', label: '51- Cond. Log. Box de Coleta Seletiva' },
  { id: 'mb-52', label: '52- Frente Revenda de Veiculos' },
  { id: 'mb-53', label: '53- Cond. Log. Interno Portão' },
  { id: 'mb-54', label: '54- Cond. Log. Estacionamento de Motos' },
  { id: 'mb-55', label: '55- Frente da Gomma Pneus' },
  { id: 'mb-56', label: '56- Lateral condominio Logistico' },
  { id: 'mb-57', label: '57- Casa do Oleo' },
  { id: 'mb-58', label: '58- Divisa com o Motel' },
  { id: 'mb-59', label: '59- Entrada Rodovia' },
]

/** Inventário completo da Matriz Brumado. */
export const TODAS_CAMERAS_MATRIZ_BRUMADO: CameraOption[] = [
  ...CAMERAS_MATRIZ_BRUMADO_PRINCIPAL,
]

export const CAMERAS_MATRIZ_VITORIA_DA_CONQUISTA: CameraOption[] = [
  { id: 'vdc-1', label: '1- Galpão Borracharia - Interno (Lateral Direita)' },
  { id: 'vdc-2', label: '2- Frente do Pátio Refeitório - Externa' },
  { id: 'vdc-3', label: '3- Corredor do Gerador - Lateral' },
  { id: 'vdc-4', label: '4- Desativada (Está em Cima do Forro do Refeitório)' },
  { id: 'vdc-5', label: '5- Entrada e Saída de Peças - Almoxarifado - Frente Interna' },
  { id: 'vdc-6', label: '6- Galpão Troca de Óleo / Frente Rampa - Interna' },
  { id: 'vdc-7', label: '7- Sala dos Encarregados - Interna Frente' },
  { id: 'vdc-8', label: '8- Rampa do Galpão de Troca de Óleo - Frente Externa' },
  { id: 'vdc-9', label: '9- Corredor - Balcão Almoxarifado - Frente Externa' },
  { id: 'vdc-10', label: '10- Portão Entrada e Saída de Pneus - Almoxarifado - Frente Interna' },
  { id: 'vdc-11', label: '11- Entrada Lado Direito (Galpão Borracharia) - Frente Externa' },
  { id: 'vdc-12', label: '12- Desativada (Entrada Portaria)' },
  { id: 'vdc-13', label: '13- Entrada dos Banheiros ADM - Lateral' },
  { id: 'vdc-14', label: '14- ADM - Frente ao "Estacionamento" / RH / Sala dos Motoristas - Lateral' },
  { id: 'vdc-15', label: '15- Sala de Treinamento/Reunião e Fundo do ADM - Frente' },
  { id: 'vdc-16', label: '16- Frente Sala de Jogos/Encarregados - Lateral' },
]

export const TODAS_CAMERAS_MONITORAMENTO: CameraOption[] = [
  ...TODAS_CAMERAS_MATRIZ_BRUMADO,
  ...CAMERAS_MATRIZ_VITORIA_DA_CONQUISTA,
]

export function camerasByUnit(unit: CameraUnit): CameraOption[] {
  if (unit === 'Matriz Brumado') return TODAS_CAMERAS_MATRIZ_BRUMADO
  if (unit === 'Filial Vitória da Conquista') return CAMERAS_MATRIZ_VITORIA_DA_CONQUISTA
  return []
}

export function isCameraFromUnit(cameraId: string, unit: CameraUnit): boolean {
  return camerasByUnit(unit).some((camera) => camera.id === cameraId)
}

export function cameraLabelById(cameraId: string): string | undefined {
  return TODAS_CAMERAS_MONITORAMENTO.find((c) => c.id === cameraId)?.label
}
