import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface MultiComboboxOption {
  value: string
  label: string
  description?: string
}

export interface MultiComboboxProps {
  options: MultiComboboxOption[]
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function MultiCombobox({
  options,
  values,
  onChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado.',
  disabled,
  className,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const labelByValue = React.useMemo(() => {
    const map = new Map<string, MultiComboboxOption>()
    for (const opt of options) {
      map.set(opt.value, opt)
    }
    return map
  }, [options])

  const toggle = (value: string) => {
    const set = new Set(values)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    onChange(Array.from(set))
  }

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value))
  }

  const summary =
    values.length === 0
      ? placeholder
      : `${values.length} selecionado${values.length === 1 ? '' : 's'}`

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-auto min-h-9 w-full justify-between px-3 py-2 text-left font-normal',
              className,
            )}
            aria-expanded={open}
          >
            <span className="line-clamp-2 flex-1 text-left text-sm">{summary}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,520px)] max-w-[520px] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const selected = values.includes(opt.value)
                  return (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.value} ${opt.label} ${opt.description ?? ''}`}
                      onSelect={() => toggle(opt.value)}
                    >
                      <span
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300',
                          selected ? 'border-slate-900 bg-slate-900 text-white' : 'opacity-50',
                        )}
                      >
                        <Check className={cn('h-3 w-3', selected ? 'opacity-100' : 'opacity-0')} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-medium">{opt.label}</span>
                        {opt.description ? (
                          <span className="text-xs text-slate-500">{opt.description}</span>
                        ) : null}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((id) => {
            const meta = labelByValue.get(id)
            return (
              <Badge key={id} variant="secondary" className="max-w-full gap-1 pr-1 font-normal">
                <span className="truncate" title={meta?.label}>
                  {meta?.label ?? id}
                </span>
                <button
                  type="button"
                  className="rounded-sm p-0.5 hover:bg-slate-200"
                  onClick={() => remove(id)}
                  aria-label={`Remover ${meta?.label ?? id}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
