'use client'

import React from 'react'

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

interface CellProps {
    className?: string
    style?: React.CSSProperties
    children?: React.ReactNode
    [key: string]: unknown
}

// Paleta espelhando os tokens do Tailwind (slate/blue),
// como valores reais de CSS — não depende de nenhum scan.
const PALETTE = {
    light: {
        text: '#0f172a',        // slate-900
        hoverBg: '#f8fafc',     // slate-50
        loadingBg: '#f1f5f9',   // slate-100
        spinnerBg: 'rgba(255,255,255,0.8)',
        spinnerColor: '#2563eb', // blue-600
    },
    dark: {
        text: '#f1f5f9',        // slate-100
        hoverBg: 'rgba(51,65,85,0.6)',  // slate-700/60
        loadingBg: '#334155',   // slate-700
        spinnerBg: 'rgba(30,41,59,0.8)', // slate-800/80
        spinnerColor: '#60a5fa', // blue-400
    },
}

export function HKClickableRow({
    id,
    loadingId,
    onClick,
    canClick = true,
    className = '',
    theme = 'light',
    children,
}: HKClickableRowProps) {
    const p = PALETTE[theme]
    const isLoading = loadingId === id

    const handleClick = () => {
        if (!canClick || isLoading) return
        onClick?.(id)
    }

    const cells = React.Children.toArray(children)

    const renderedCells = cells.map((cell, index) => {
        if (index === 0 && React.isValidElement(cell)) {
            const props = cell.props as CellProps

            return React.cloneElement(
                cell as React.ReactElement<CellProps>,
                {
                    ...props,
                    style: {
                        ...(props.style ?? {}),
                        position: 'relative',
                        transition: 'padding 200ms ease',
                        paddingLeft: isLoading ? '3rem' : props.style?.paddingLeft,
                    },
                    children: (
                        <>
                            {props.children}

                            {isLoading && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '1.25rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        borderRadius: '9999px',
                                        padding: '0.125rem',
                                        backgroundColor: p.spinnerBg,
                                        display: 'flex',
                                    }}
                                >
                                    <svg
                                        width={16}
                                        height={16}
                                        style={{
                                            animation: 'hk-spin 1s linear infinite',
                                            color: p.spinnerColor,
                                        }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            style={{ opacity: 0.25 }}
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            style={{ opacity: 0.75 }}
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                            )}
                        </>
                    ),
                }
            )
        }

        return cell
    })

    return (
        <tr
            onClick={handleClick}
            className={className}
            style={{
                color: p.text,
                cursor: isLoading ? 'wait' : canClick ? 'pointer' : 'default',
                opacity: isLoading ? 0.5 : 1,
                pointerEvents: isLoading ? 'none' : 'auto',
                backgroundColor: isLoading ? p.loadingBg : undefined,
                transition: 'background-color 200ms ease, opacity 200ms ease',
            }}
            onMouseEnter={(e) => {
                if (canClick && !isLoading) {
                    e.currentTarget.style.backgroundColor = p.hoverBg
                }
            }}
            onMouseLeave={(e) => {
                if (canClick && !isLoading) {
                    e.currentTarget.style.backgroundColor = ''
                }
            }}
        >
            {renderedCells}
        </tr>
    )
}

export default HKClickableRow