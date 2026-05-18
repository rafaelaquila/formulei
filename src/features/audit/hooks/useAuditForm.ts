import { useEffect, useRef, useState } from 'react'
import { submitAudit } from '@/features/audit/api/audit.repository'
import {
  AUDIT_DRAFT_STORAGE_KEY,
  createCollaboratorAudit,
  createSystemAccess,
  initialAuditForm,
} from '@/features/audit/model/audit.factory'
import {
  normalizeSelectedAccesses,
  validateAuditForm,
} from '@/features/audit/model/audit.validation'
import { sortSystemAccessesByCatalog } from '@/shared/lib/system-order'
import { useDraft } from '@/shared/hooks/useDraft'
import { useToast } from '@/shared/hooks/useToast'
import type { CollaboratorAudit, SystemAccess } from '@/shared/types/audit'

function getTodayBrazilianDate() {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = String(now.getFullYear())
  return `${dd}/${mm}/${yyyy}`
}

export function useAuditForm() {
  const { state: form, setState: setForm, clearDraft } = useDraft(
    AUDIT_DRAFT_STORAGE_KEY,
    initialAuditForm,
  )
  const didMigrateDraft = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    if (didMigrateDraft.current) return
    didMigrateDraft.current = true
    setForm((prev) => ({
      ...prev,
      colaboradores: prev.colaboradores.map((c) => ({
        ...c,
        sistemas: normalizeSelectedAccesses(c.sistemas),
      })),
    }))
  }, [setForm])

  const setSelectedCollaboratorNames = (names: string[]) => {
    const uniqueOrdered = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)))
    setForm((prev) => {
      const existingByName = new Map(prev.colaboradores.map((item) => [item.nome, item]))
      const colaboradores: CollaboratorAudit[] = uniqueOrdered.map(
        (name) => existingByName.get(name) ?? createCollaboratorAudit(name),
      )
      return { ...prev, colaboradores }
    })
  }

  const updateCollaborator = (
    collaboratorId: string,
    updater: (current: CollaboratorAudit) => CollaboratorAudit,
  ) => {
    setForm((prev) => ({
      ...prev,
      colaboradores: prev.colaboradores.map((item) =>
        item.id === collaboratorId ? updater(item) : item,
      ),
    }))
  }

  const toggleSystemForCollaborator = (
    collaboratorId: string,
    systemName: string,
    checked: boolean,
  ) => {
    updateCollaborator(collaboratorId, (current) => {
      if (checked) {
        if (current.sistemas.some((item) => item.sistema === systemName)) return current
        return {
          ...current,
          sistemas: sortSystemAccessesByCatalog([...current.sistemas, createSystemAccess(systemName)]),
        }
      }
      return {
        ...current,
        sistemas: current.sistemas.filter((item) => item.sistema !== systemName),
      }
    })
  }

  const updateSelectedSystemForCollaborator = (
    collaboratorId: string,
    systemName: string,
    updater: (current: SystemAccess) => SystemAccess,
  ) => {
    updateCollaborator(collaboratorId, (current) => ({
      ...current,
      sistemas: current.sistemas.map((item) =>
        item.sistema === systemName ? updater(item) : item,
      ),
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      ...form,
      dataPreenchimento: getTodayBrazilianDate(),
      colaboradores: form.colaboradores.map((colab) => ({
        ...colab,
        sistemas: normalizeSelectedAccesses(colab.sistemas),
      })),
    }

    const validationError = validateAuditForm(payload)
    if (validationError) {
      showToast(validationError, 'error')
      return
    }

    setIsLoading(true)
    try {
      await submitAudit(payload)
      clearDraft()
      showToast('Formulário enviado com sucesso.', 'success')
    } catch {
      showToast('Não foi possível enviar o formulário. Tente novamente.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    setForm,
    clearDraft,
    setSelectedCollaboratorNames,
    updateCollaborator,
    toggleSystemForCollaborator,
    updateSelectedSystemForCollaborator,
    handleSubmit,
    isLoading,
    toast,
    showToast,
  }
}
