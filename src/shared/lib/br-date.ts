/** Entrada com máscara ou ISO `AAAA-MM-DD` → exibição DD/MM/AAAA */
export function formatBrazilianDate(value: string) {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch
    return `${dd}/${mm}/${yyyy}`
  }

  const digitsOnly = value.replace(/\D/g, '').slice(0, 8)
  if (digitsOnly.length <= 2) return digitsOnly
  if (digitsOnly.length <= 4) return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`
}

export function toBrazilianDisplayDate(value: string) {
  if (!value) return ''
  return formatBrazilianDate(value)
}

export function isValidBrazilianDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return false

  const [, dd, mm, yyyy] = match
  const day = Number(dd)
  const month = Number(mm)
  const year = Number(yyyy)
  if (month < 1 || month > 12 || day < 1) return false

  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function brazilianDateToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return value
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}
