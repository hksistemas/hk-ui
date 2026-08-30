
import type React from 'react'

export type HKClickableRowTheme = 'light' | 'dark'

export interface HKClickableRowProps {
    id: number | string
    loadingId?: number | string | null
    onClick?: (id: number | string) => void
    canClick?: boolean
    className?: string
    theme?: HKClickableRowTheme
    children: React.ReactNode
}

