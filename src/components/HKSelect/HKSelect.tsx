'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X, Loader2 } from 'lucide-react'
import type { HKSelectOption, HKSelectProps, HKSelectTheme } from './types'

const THEME_CLASSES: Record<HKSelectTheme, {
    trigger: string
    triggerDisabled: string
    value: string
    placeholder: string
    icon: string
    dropdown: string
    searchInput: string
    option: string
    optionSelected: string
    noResults: string
}> = {
    light: {
        trigger: 'border-gray-300 bg-white hover:border-gray-300',
        triggerDisabled: 'bg-gray-50',
        value: 'text-gray-900',
        placeholder: 'text-gray-400',
        icon: 'text-gray-400',
        dropdown: 'bg-white border-gray-200',
        searchInput: 'border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400',
        option: 'text-gray-800 hover:bg-gray-50',
        optionSelected: 'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100',
        noResults: 'text-gray-400',
    },
    dark: {
        trigger: 'border-slate-600 bg-slate-800 hover:border-slate-500',
        triggerDisabled: 'bg-slate-800/50',
        value: 'text-slate-100',
        placeholder: 'text-slate-400',
        icon: 'text-slate-400',
        dropdown: 'bg-slate-800 border-slate-600',
        searchInput: 'border-slate-600 bg-slate-900 text-slate-100 focus:border-slate-400',
        option: 'text-slate-200 hover:bg-slate-700',
        optionSelected: 'bg-blue-900/40 text-blue-300 font-medium hover:bg-blue-900/60',
        noResults: 'text-slate-500',
    },
}

const SEARCH_BAR_HEIGHT = 57
const RADIUS = '0.375rem' // rounded-md, usado só nos casos "raros" (estado aberto), via style

interface DropdownPos {
    top?: number
    bottom?: number
    left: number
    width: number
    openUpward: boolean
}

export function HKSelect({
    options: staticOptions,
    name,
    value,
    onChange,
    placeholder = 'Selecione...',
    searchPlaceholder = 'Buscar...',
    required,
    disabled,
    className = '',
    theme = 'light',
    creatable = false,
    onCreateOption,
    formatCreateLabel,
    clearable = false,
    onClear,
    multi = false,
    loadOptions,
    maxListHeight = 224,
}: HKSelectProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [pos, setPos] = useState<DropdownPos | null>(null)
    const [asyncOptions, setAsyncOptions] = useState<HKSelectOption[]>([])
    const [asyncLoading, setAsyncLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    const wrapperRef = useRef<HTMLDivElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const t = THEME_CLASSES[theme]

    const options = loadOptions ? asyncOptions : (staticOptions ?? [])

    const selectedValues: string[] = multi
        ? (Array.isArray(value) ? value : [])
        : (value ? [value as string] : [])

    const selectedOptions = options.filter(o => selectedValues.includes(o.value))

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        o.value.toLowerCase().includes(query.toLowerCase())
    )

    useEffect(() => { setMounted(true) }, [])

    const showCreateOption = creatable &&
        query.trim() !== '' &&
        !options.some(o => o.label.toLowerCase() === query.trim().toLowerCase())

    const fetchAsync = useCallback(async (q: string) => {
        if (!loadOptions) return
        setAsyncLoading(true)
        try {
            const result = await loadOptions(q)
            setAsyncOptions(result)
        } catch (err) {
            console.error('HKSelect loadOptions error:', err)
        } finally {
            setAsyncLoading(false)
        }
    }, [loadOptions])

    useEffect(() => {
        if (!loadOptions) return
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchAsync(query), 300)
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [query, loadOptions, fetchAsync])

    useEffect(() => {
        if (open && loadOptions && asyncOptions.length === 0) fetchAsync('')
    }, [open])

    useEffect(() => {
        if (!open || !listRef.current) return
        const frame = requestAnimationFrame(() => {
            const list = listRef.current
            if (!list) return
            const firstSelected = multi ? selectedValues[0] : (value as string)
            if (!firstSelected) return
            const selectedEl = list.querySelector<HTMLElement>('[data-selected="true"]')
            if (selectedEl) selectedEl.scrollIntoView({ block: 'nearest' })
        })
        return () => cancelAnimationFrame(frame)
    }, [open])

    const computePosition = useCallback(() => {
        const rect = wrapperRef.current?.getBoundingClientRect()
        if (!rect) return

        const requiredHeight = SEARCH_BAR_HEIGHT + maxListHeight
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const openUpward = spaceBelow < requiredHeight && spaceAbove > spaceBelow

        setPos(
            openUpward
                ? { bottom: window.innerHeight - rect.top, left: rect.left, width: rect.width, openUpward: true }
                : { top: rect.bottom, left: rect.left, width: rect.width, openUpward: false }
        )
    }, [maxListHeight])

    const toggle = () => {
        if (disabled) return
        if (!open) computePosition()
        setOpen(prev => !prev)
    }

    useEffect(() => {
        if (!open) return
        const handle = () => computePosition()
        window.addEventListener('scroll', handle, true)
        window.addEventListener('resize', handle)
        return () => {
            window.removeEventListener('scroll', handle, true)
            window.removeEventListener('resize', handle)
        }
    }, [open, computePosition])

    useEffect(() => {
        if (open) searchRef.current?.focus()
        else setQuery('')
    }, [open])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node
            const clickedWrapper = wrapperRef.current?.contains(target)
            const clickedDropdown = dropdownRef.current?.contains(target)
            if (!clickedWrapper && !clickedDropdown) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const select = (optValue: string) => {
        if (multi) {
            const next = selectedValues.includes(optValue)
                ? selectedValues.filter(v => v !== optValue)
                : [...selectedValues, optValue]
            onChange(next)
        } else {
            onChange(optValue)
            setOpen(false)
        }
    }

    const deselect = (optValue: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(selectedValues.filter(v => v !== optValue))
    }

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(multi ? [] : '')
        onClear?.()
    }

    const hasValue = multi ? selectedValues.length > 0 : !!value

    // Radius do trigger: no estado FECHADO usa a classe Tailwind normal
    // (rounded-sm), que é segura e nunca é purgada. Só o estado ABERTO
    // (corner-radius assimétrico, dependente de openUpward) vai via style,
    // porque essa combinação é rara e pode não existir em nenhum outro
    // lugar do app consumidor.
    const triggerStyle: React.CSSProperties = open
        ? (pos?.openUpward
            ? { borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS, borderTopLeftRadius: 0, borderTopRightRadius: 0 }
            : { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 })
        : {}

    const chevronStyle: React.CSSProperties = {
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms',
    }

    const dropdownNode = open && pos && (
        <div
            ref={dropdownRef}
            className={`shadow-[0_8px_24px_rgba(0,0,0,0.12)] border ${t.dropdown}`}
            style={{
                position: 'fixed',
                left: pos.left,
                width: pos.width,
                top: pos.top,
                bottom: pos.bottom,
                zIndex: 9999,
                ...(pos.openUpward
                    ? { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS, borderBottomWidth: 0 }
                    : { borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS, borderTopWidth: 0 }),
            }}
        >
            <div className="p-2 border-b border-gray-100/10">
                <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={`w-full px-3 h-8 text-sm border rounded-md outline-none ${t.searchInput}`}
                />
            </div>

            <ul ref={listRef} className="max-h-56 overflow-y-auto py-1" style={{ maxHeight: maxListHeight }}>
                {asyncLoading && (
                    <li className={`flex items-center justify-center gap-2 px-3 py-3 text-sm ${t.noResults}`}>
                        <Loader2 size={14} className="animate-spin" />
                        Carregando...
                    </li>
                )}

                {!asyncLoading && filtered.length === 0 && !showCreateOption && (
                    <li className={`px-3 py-3 text-sm text-center ${t.noResults}`}>Nenhum resultado</li>
                )}

                {!asyncLoading && filtered.map(option => {
                    const isSelected = selectedValues.includes(option.value)
                    return (
                        <li
                            key={option.value}
                            data-selected={isSelected ? 'true' : 'false'}
                            onClick={() => select(option.value)}
                            className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected ? t.optionSelected : t.option}`}
                        >
                            <span>{option.label}</span>
                            {multi && isSelected && <X size={12} className="text-blue-400" />}
                        </li>
                    )
                })}

                {showCreateOption && (
                    <li
                        onClick={() => { onCreateOption?.(query.trim()); setOpen(false); setQuery('') }}
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors text-blue-600 border-t border-gray-100"
                    >
                        <span className="text-lg leading-none">+</span>
                        {formatCreateLabel ? formatCreateLabel(query.trim()) : `Criar "${query.trim()}"`}
                    </li>
                )}
            </ul>
        </div>
    )

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            {multi
                ? selectedValues.map(v => <input key={v} type="hidden" name={name} value={v} />)
                : <input type="hidden" name={name} value={value as string} required={required} />
            }

            <button
                type="button"
                onClick={toggle}
                disabled={disabled}
                className={`
                    w-full flex items-center gap-2 px-3 min-h-10 text-sm text-left
                    border transition-colors
                    ${open ? 'border-gray-400' : `rounded-sm ${t.trigger}`}
                    ${disabled ? `opacity-50 cursor-not-allowed ${t.triggerDisabled}` : `cursor-pointer ${t.trigger}`}
                `}
                style={triggerStyle}
            >
                <span className="flex-1 flex flex-wrap gap-1 py-1">
                    {multi && selectedOptions.length > 0 ? (
                        selectedOptions.map(o => (
                            <span key={o.value} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                {o.label}
                                <X size={12} className="cursor-pointer hover:text-blue-900" onClick={(e) => deselect(o.value, e)} />
                            </span>
                        ))
                    ) : (
                        <span className={!hasValue ? t.placeholder : t.value}>
                            {!multi && selectedOptions[0] ? selectedOptions[0].label : placeholder}
                        </span>
                    )}
                </span>

                <span className="flex items-center gap-1 shrink-0">
                    {clearable && hasValue && (
                        <X size={14} className="text-gray-400 hover:text-gray-600 transition-colors" onClick={clear} />
                    )}
                    <ChevronDown size={16} className={t.icon} style={chevronStyle} />
                </span>
            </button>

            {mounted && dropdownNode && createPortal(dropdownNode, document.body)}
        </div>
    )
}