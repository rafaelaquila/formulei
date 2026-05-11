import { Badge } from '@/components/ui/badge'
import { MultiCombobox } from '@/components/ui/multi-combobox'
import { ACCESS_TYPES } from '@/shared/constants/audit'
import {
  camerasByUnit,
  isCameraFromUnit,
  type CameraUnit,
} from '@/shared/constants/camera-catalog'
import {
  OBSERVATION_PLACEHOLDERS,
} from '@/shared/constants/observation-placeholders'
import { PORTAL_BI_CATALOG } from '@/shared/constants/portal-bi-catalog'
import {
  isMonitoramentoCameraSystem,
  isPortalBiSystem,
} from '@/shared/constants/system-ids'
import { UNIT_OPTIONS } from '@/shared/constants/units'
import { orderedSelectedAccessTypes } from '@/shared/lib/access-order'
import { Field } from '@/shared/ui/ui'
import type { CameraMonitoringUnit, SystemAccess } from '@/shared/types/audit'

interface Props {
  system: SystemAccess
  updateSelectedSystem: (
    systemName: string,
    updater: (current: SystemAccess) => SystemAccess,
  ) => void
}

export function SystemAccessDetails({ system, updateSelectedSystem }: Props) {
  if (isMonitoramentoCameraSystem(system.sistema)) {
    const selectedUnit = (system.cameraMonitoringUnit ?? 'Matriz Brumado') as CameraUnit
    const cameraOptions = camerasByUnit(selectedUnit).map((c) => ({
      value: c.id,
      label: c.label,
    }))

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Tipo de acesso permitido:</span>
          <Badge variant="secondary">Consulta</Badge>
        </div>

        <Field label="Unidade das câmeras">
          <select
            value={selectedUnit}
            onChange={(event) =>
              updateSelectedSystem(system.sistema, (current) => {
                const nextUnit = event.target.value as CameraUnit
                return {
                  ...current,
                  cameraMonitoringUnit: nextUnit,
                  camerasConsultaIds: (current.camerasConsultaIds ?? []).filter((id) =>
                    isCameraFromUnit(id, nextUnit),
                  ),
                }
              })
            }
          >
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </Field>

        <Field label="Câmeras com permissão de consulta">
          <MultiCombobox
            options={cameraOptions}
            values={(system.camerasConsultaIds ?? []).filter((id) =>
              isCameraFromUnit(id, selectedUnit),
            )}
            placeholder="Busque e marque as câmeras"
            searchPlaceholder="Filtrar câmeras..."
            emptyText="Nenhuma câmera encontrada."
            onChange={(next) =>
              updateSelectedSystem(system.sistema, (current) => ({
                ...current,
                camerasConsultaIds: next,
              }))
            }
          />
        </Field>

        {/* Sem observações adicionais para monitoramento, conforme regra atual. */}
      </div>
    )
  }

  if (isPortalBiSystem(system.sistema)) {
    const selectedBiUnit = (system.portalBiUnit ?? 'Matriz Brumado') as CameraMonitoringUnit
    const biOptions = PORTAL_BI_CATALOG.map((r) => ({
      value: r.id,
      label: r.nome,
      description: r.nivelDados,
    }))

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Tipo de acesso permitido:</span>
          <Badge variant="secondary">Consulta</Badge>
        </div>

        <Field label="Unidade do Portal BI">
          <select
            value={selectedBiUnit}
            onChange={(event) =>
              updateSelectedSystem(system.sistema, (current) => ({
                ...current,
                portalBiUnit: event.target.value as CameraMonitoringUnit,
              }))
            }
          >
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </Field>

        <fieldset className="fieldset">
          <legend>Tipo de acesso ao BI</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={system.portalBiAccessMode === 'Interno'}
                onChange={() =>
                  updateSelectedSystem(system.sistema, (current) => ({
                    ...current,
                    portalBiAccessMode: 'Interno',
                  }))
                }
              />
              Interno
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={system.portalBiAccessMode === 'Externo'}
                onChange={() =>
                  updateSelectedSystem(system.sistema, (current) => ({
                    ...current,
                    portalBiAccessMode: 'Externo',
                  }))
                }
              />
              Externo
            </label>
          </div>
        </fieldset>

        <Field label="Relatórios do Portal BI e nível de dados">
          <MultiCombobox
            options={biOptions}
            values={system.portalBiReportIds ?? []}
            placeholder="Busque pelo nome do BI ou pelo nível de dados"
            searchPlaceholder="Filtrar relatórios..."
            emptyText="Nenhum relatório encontrado."
            onChange={(next) =>
              updateSelectedSystem(system.sistema, (current) => ({
                ...current,
                portalBiReportIds: next,
              }))
            }
          />
        </Field>


      </div>
    )
  }

  return (
    <>
      <fieldset className="fieldset">
        <legend>Tipo de acesso</legend>
        <div className="checkbox-grid">
          {ACCESS_TYPES.map((type) => (
            <label key={`${system.id}-${type}`}>
              <input
                type="checkbox"
                checked={system.tipoAcesso.includes(type)}
                onChange={() =>
                  updateSelectedSystem(system.sistema, (current) => {
                    const alreadySelected = current.tipoAcesso.includes(type)
                    const nextSet = new Set(current.tipoAcesso)
                    if (alreadySelected) nextSet.delete(type)
                    else nextSet.add(type)
                    const nextTipos = ACCESS_TYPES.filter((t) => nextSet.has(t))
                    const nextObservacoes = { ...(current.observacoesPorTipoAcesso ?? {}) }
                    if (alreadySelected) {
                      delete nextObservacoes[type]
                    }
                    return {
                      ...current,
                      tipoAcesso: nextTipos,
                      observacoesPorTipoAcesso: nextObservacoes,
                    }
                  })
                }
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid">
        {orderedSelectedAccessTypes(system.tipoAcesso).map((tipoAcessoSelecionado) => (
          <Field
            key={`${system.id}-${tipoAcessoSelecionado}-obs`}
            label={`Obs. de ${tipoAcessoSelecionado}`}
            htmlFor={`obs-${system.id}-${tipoAcessoSelecionado}`}
          >
            <textarea
              id={`obs-${system.id}-${tipoAcessoSelecionado}`}
              className="mt-1 min-h-[88px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={system.observacoesPorTipoAcesso?.[tipoAcessoSelecionado] ?? ''}
              onChange={(event) =>
                updateSelectedSystem(system.sistema, (current) => ({
                  ...current,
                  observacoesPorTipoAcesso: {
                    ...current.observacoesPorTipoAcesso,
                    [tipoAcessoSelecionado]: event.target.value,
                  },
                }))
              }
              placeholder={OBSERVATION_PLACEHOLDERS[tipoAcessoSelecionado]}
              rows={3}
            />
          </Field>
        ))}
      </div>
    </>
  )
}
