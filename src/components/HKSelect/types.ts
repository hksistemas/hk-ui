export interface HKSelectOption {
    value: string
    label: string
}

export type HKSelectTheme = 'light' | 'dark'

export interface HKSelectProps {
    // base
    options?: HKSelectOption[]
    name: string
    value: string | string[]
    onChange: (value: string | string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    required?: boolean
    disabled?: boolean
    className?: string
    theme?: HKSelectTheme
    minHeight?: number

    // creatable
    creatable?: boolean
    onCreateOption?: (inputValue: string) => void
    formatCreateLabel?: (inputValue: string) => string

    // clearable
    clearable?: boolean
    onClear?: () => void

    // multi
    multi?: boolean

    // async
    loadOptions?: (
        query: string
    ) => Promise<HKSelectOption[]>

    maxListHeight?: number
}