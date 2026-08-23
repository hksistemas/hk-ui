// 'use client'

// import {
//     useState,
//     useEffect,
//     useRef,
//     useCallback,
// } from 'react'

// import {
//     ChevronDown,
//     X,
//     Loader2,
// } from 'lucide-react'

// import type {
//     HKSelectOption,
//     HKSelectProps,
//     HKSelectTheme,
// } from './types'


// const THEME_CLASSES: Record<
//     HKSelectTheme,
//     {
//         trigger: string
//         triggerDisabled: string
//         value: string
//         placeholder: string
//         icon: string
//         dropdown: string
//         searchInput: string
//         option: string
//         optionSelected: string
//         noResults: string
//     }
// > = {
//     light: {
//         trigger:
//             'border-gray-300 bg-white hover:border-gray-300',

//         triggerDisabled:
//             'bg-gray-50',

//         value:
//             'text-gray-900',

//         placeholder:
//             'text-gray-400',

//         icon:
//             'text-gray-400',

//         dropdown:
//             'bg-white border-gray-200',

//         searchInput:
//             'border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400',

//         option:
//             'text-gray-800 hover:bg-gray-50',

//         optionSelected:
//             'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100',

//         noResults:
//             'text-gray-400',
//     },

//     dark: {
//         trigger:
//             'border-slate-600 bg-slate-800 hover:border-slate-500',

//         triggerDisabled:
//             'bg-slate-800/50',

//         value:
//             'text-slate-100',

//         placeholder:
//             'text-slate-400',

//         icon:
//             'text-slate-400',

//         dropdown:
//             'bg-slate-800 border-slate-600',

//         searchInput:
//             'border-slate-600 bg-slate-900 text-slate-100 focus:border-slate-400',

//         option:
//             'text-slate-200 hover:bg-slate-700',

//         optionSelected:
//             'bg-blue-900/40 text-blue-300 font-medium hover:bg-blue-900/60',

//         noResults:
//             'text-slate-500',
//     },
// }


// const SEARCH_BAR_HEIGHT = 57


// export function HKSelect({
//     options: staticOptions,
//     name,
//     value,
//     onChange,
//     placeholder = 'Selecione...',
//     searchPlaceholder = 'Buscar...',
//     required,
//     disabled,
//     className = '',
//     theme = 'light',

//     creatable = false,
//     onCreateOption,
//     formatCreateLabel,

//     clearable = false,
//     onClear,

//     multi = false,

//     loadOptions,

//     maxListHeight = 224,
// }: HKSelectProps) {

//     const [open, setOpen] = useState(false)

//     const [query, setQuery] = useState('')

//     const [openUpward, setOpenUpward] =
//         useState(false)

//     const [asyncOptions, setAsyncOptions] =
//         useState<HKSelectOption[]>([])

//     const [asyncLoading, setAsyncLoading] =
//         useState(false)


//     const wrapperRef =
//         useRef<HTMLDivElement>(null)

//     const searchRef =
//         useRef<HTMLInputElement>(null)

//     const listRef =
//         useRef<HTMLUListElement>(null)

//     const debounceRef =
//         useRef<ReturnType<typeof setTimeout> | null>(
//             null
//         )


//     const t = THEME_CLASSES[theme]


//     const options =
//         loadOptions
//             ? asyncOptions
//             : (staticOptions ?? [])


//     const selectedValues: string[] =
//         multi
//             ? (
//                 Array.isArray(value)
//                     ? value
//                     : []
//             )
//             : (
//                 value
//                     ? [value as string]
//                     : []
//             )


//     const selectedOptions =
//         options.filter(option =>
//             selectedValues.includes(
//                 option.value
//             )
//         )


//     const filtered =
//         options.filter(option =>
//             option.label
//                 .toLowerCase()
//                 .includes(
//                     query.toLowerCase()
//                 )
//             ||
//             option.value
//                 .toLowerCase()
//                 .includes(
//                     query.toLowerCase()
//                 )
//         )


//     function getScrollParent(
//         node: HTMLElement | null
//     ): HTMLElement | null {

//         let parent =
//             node?.parentElement

//         while (parent) {

//             const { overflowY } =
//                 window.getComputedStyle(
//                     parent
//                 )

//             if (
//                 overflowY === 'auto'
//                 ||
//                 overflowY === 'scroll'
//             ) {
//                 return parent
//             }

//             parent =
//                 parent.parentElement
//         }

//         return null
//     }


//     const showCreateOption =
//         creatable
//         &&
//         query.trim() !== ''
//         &&
//         !options.some(
//             option =>
//                 option.label
//                     .toLowerCase()
//                     ===
//                     query
//                         .trim()
//                         .toLowerCase()
//         )


//     const fetchAsync =
//         useCallback(
//             async (query: string) => {

//                 if (!loadOptions) return

//                 setAsyncLoading(true)

//                 try {

//                     const result =
//                         await loadOptions(
//                             query
//                         )

//                     setAsyncOptions(
//                         result
//                     )

//                 } catch (error) {

//                     console.error(
//                         'HKSelect loadOptions error:',
//                         error
//                     )

//                 } finally {

//                     setAsyncLoading(false)
//                 }
//             },
//             [loadOptions]
//         )


//     useEffect(() => {

//         if (!loadOptions) return

//         if (debounceRef.current) {
//             clearTimeout(
//                 debounceRef.current
//             )
//         }

//         debounceRef.current =
//             setTimeout(
//                 () =>
//                     fetchAsync(query),
//                 300
//             )

//         return () => {

//             if (debounceRef.current) {
//                 clearTimeout(
//                     debounceRef.current
//                 )
//             }
//         }

//     }, [
//         query,
//         loadOptions,
//         fetchAsync,
//     ])


//     useEffect(() => {

//         if (
//             open
//             &&
//             loadOptions
//             &&
//             asyncOptions.length === 0
//         ) {
//             fetchAsync('')
//         }

//     }, [open])


//     useEffect(() => {

//         if (
//             !open
//             ||
//             !listRef.current
//         ) {
//             return
//         }

//         const frame =
//             requestAnimationFrame(
//                 () => {

//                     const list =
//                         listRef.current

//                     if (!list) return

//                     const firstSelected =
//                         multi
//                             ? selectedValues[0]
//                             : value as string

//                     if (!firstSelected) {
//                         return
//                     }

//                     const selectedEl =
//                         list.querySelector<HTMLElement>(
//                             '[data-selected="true"]'
//                         )

//                     if (selectedEl) {

//                         selectedEl.scrollIntoView({
//                             block: 'nearest',
//                         })
//                     }
//                 }
//             )

//         return () =>
//             cancelAnimationFrame(
//                 frame
//             )

//     }, [open])


//     const toggle = () => {

//         if (disabled) return

//         if (!open) {

//             const rect =
//                 wrapperRef.current
//                     ?.getBoundingClientRect()

//             if (rect) {

//                 const scrollParent =
//                     getScrollParent(
//                         wrapperRef.current
//                     )

//                 const boundaryBottom =
//                     scrollParent
//                         ? scrollParent
//                             .getBoundingClientRect()
//                             .bottom
//                         : window.innerHeight

//                 const boundaryTop =
//                     scrollParent
//                         ? scrollParent
//                             .getBoundingClientRect()
//                             .top
//                         : 0

//                 const spaceBelow =
//                     boundaryBottom
//                     -
//                     rect.bottom

//                 const spaceAbove =
//                     rect.top
//                     -
//                     boundaryTop

//                 const requiredHeight =
//                     SEARCH_BAR_HEIGHT
//                     +
//                     maxListHeight

//                 setOpenUpward(
//                     spaceBelow < requiredHeight
//                     &&
//                     spaceAbove > spaceBelow
//                 )
//             }
//         }

//         setOpen(
//             previous => !previous
//         )
//     }


//     useEffect(() => {

//         if (open) {

//             searchRef.current?.focus()

//         } else {

//             setQuery('')
//         }

//     }, [open])


//     useEffect(() => {

//         const handler =
//             (event: MouseEvent) => {

//                 if (
//                     wrapperRef.current
//                     &&
//                     !wrapperRef.current.contains(
//                         event.target as Node
//                     )
//                 ) {
//                     setOpen(false)
//                 }
//             }

//         document.addEventListener(
//             'mousedown',
//             handler
//         )

//         return () => {

//             document.removeEventListener(
//                 'mousedown',
//                 handler
//             )
//         }

//     }, [])


//     const select =
//         (optionValue: string) => {

//             if (multi) {

//                 const next =
//                     selectedValues.includes(
//                         optionValue
//                     )
//                         ? selectedValues.filter(
//                             value =>
//                                 value !== optionValue
//                         )
//                         : [
//                             ...selectedValues,
//                             optionValue,
//                         ]

//                 onChange(next)

//             } else {

//                 onChange(
//                     optionValue
//                 )

//                 setOpen(false)
//             }
//         }


//     const deselect =
//         (
//             optionValue: string,
//             event: React.MouseEvent
//         ) => {

//             event.stopPropagation()

//             onChange(
//                 selectedValues.filter(
//                     value =>
//                         value !== optionValue
//                 )
//             )
//         }


//     const clear =
//         (event: React.MouseEvent) => {

//             event.stopPropagation()

//             onChange(
//                 multi
//                     ? []
//                     : ''
//             )

//             onClear?.()
//         }


//     const hasValue =
//         multi
//             ? selectedValues.length > 0
//             : !!value


//     const dropdownClass =
//         openUpward
//             ? `
//                 bottom-full
//                 top-auto
//                 border-t
//                 border-b-0
//                 rounded-t-md
//                 rounded-b-none
//             `
//             : `
//                 top-full
//                 border-t-0
//                 rounded-b-md
//                 rounded-t-none
//             `


//     const triggerOpenClass =
//         openUpward
//             ? `
//                 rounded-b-md
//                 rounded-t-none
//             `
//             : `
//                 rounded-t-md
//                 rounded-b-none
//             `


//     return (

//         <div
//             ref={wrapperRef}
//             className={`
//                 relative
//                 w-full
//                 ${className}
//             `}
//         >

//             {multi
//                 ? selectedValues.map(
//                     value => (
//                         <input
//                             key={value}
//                             type="hidden"
//                             name={name}
//                             value={value}
//                         />
//                     )
//                 )
//                 : (
//                     <input
//                         type="hidden"
//                         name={name}
//                         value={value as string}
//                         required={required}
//                     />
//                 )
//             }


//             <button
//                 type="button"
//                 onClick={toggle}
//                 disabled={disabled}
//                 className={`
//                     w-full
//                     flex
//                     items-center
//                     gap-2
//                     px-3
//                     min-h-10
//                     text-sm
//                     text-left
//                     border
//                     transition-colors

//                     ${
//                         open
//                             ? `
//                                 border-gray-400
//                                 ${triggerOpenClass}
//                             `
//                             : `
//                                 rounded-sm
//                                 ${t.trigger}
//                             `
//                     }

//                     ${
//                         disabled
//                             ? `
//                                 opacity-50
//                                 cursor-not-allowed
//                                 ${t.triggerDisabled}
//                             `
//                             : `
//                                 cursor-pointer
//                                 ${t.trigger}
//                             `
//                     }
//                 `}
//             >

//                 <span
//                     className="
//                         flex-1
//                         flex
//                         flex-wrap
//                         gap-1
//                         py-1
//                     "
//                 >

//                     {multi
//                     &&
//                     selectedOptions.length > 0
//                         ? selectedOptions.map(
//                             option => (

//                                 <span
//                                     key={option.value}
//                                     className="
//                                         inline-flex
//                                         items-center
//                                         gap-1
//                                         px-2
//                                         py-0.5
//                                         bg-blue-50
//                                         text-blue-700
//                                         rounded
//                                         text-xs
//                                     "
//                                 >

//                                     {option.label}

//                                     <X
//                                         size={12}
//                                         className="
//                                             cursor-pointer
//                                             hover:text-blue-900
//                                         "
//                                         onClick={
//                                             event =>
//                                                 deselect(
//                                                     option.value,
//                                                     event
//                                                 )
//                                         }
//                                     />

//                                 </span>
//                             )
//                         )
//                         : (
//                             <span
//                                 className={
//                                     !hasValue
//                                         ? t.placeholder
//                                         : t.value
//                                 }
//                             >

//                                 {
//                                     !multi
//                                     &&
//                                     selectedOptions[0]
//                                         ? selectedOptions[0].label
//                                         : placeholder
//                                 }

//                             </span>
//                         )
//                     }

//                 </span>


//                 <span
//                     className="
//                         flex
//                         items-center
//                         gap-1
//                         shrink-0
//                     "
//                 >

//                     {clearable
//                     &&
//                     hasValue
//                     && (
//                         <X
//                             size={14}
//                             className="
//                                 text-gray-400
//                                 hover:text-gray-600
//                                 transition-colors
//                             "
//                             onClick={clear}
//                         />
//                     )}

//                     <ChevronDown
//                         size={16}
//                         className={`
//                             transition-transform
//                             duration-200
//                             ${
//                                 open
//                                     ? 'rotate-180'
//                                     : ''
//                             }
//                             ${t.icon}
//                         `}
//                     />

//                 </span>

//             </button>


//             {open && (

//                 <div
//                     className={`
//                         shadow-[0_8px_24px_rgba(0,0,0,0.12)]
//                         absolute
//                         z-50
//                         left-0
//                         right-0
//                         border
//                         ${t.dropdown}
//                         ${dropdownClass}
//                     `}
//                 >

//                     <div
//                         className="
//                             p-2
//                             border-b
//                             border-gray-100/10
//                         "
//                     >

//                         <input
//                             ref={searchRef}
//                             type="text"
//                             value={query}
//                             onChange={
//                                 event =>
//                                     setQuery(
//                                         event.target.value
//                                     )
//                             }
//                             placeholder={
//                                 searchPlaceholder
//                             }
//                             className={`
//                                 w-full
//                                 px-3
//                                 h-8
//                                 text-sm
//                                 border
//                                 rounded-md
//                                 outline-none
//                                 ${t.searchInput}
//                             `}
//                         />

//                     </div>


//                     <ul
//                         ref={listRef}
//                         className="
//                             max-h-56
//                             overflow-y-auto
//                             py-1
//                         "
//                         style={{
//                             maxHeight:
//                                 maxListHeight,
//                         }}
//                     >

//                         {asyncLoading && (

//                             <li
//                                 className={`
//                                     flex
//                                     items-center
//                                     justify-center
//                                     gap-2
//                                     px-3
//                                     py-3
//                                     text-sm
//                                     ${t.noResults}
//                                 `}
//                             >

//                                 <Loader2
//                                     size={14}
//                                     className="
//                                         animate-spin
//                                     "
//                                 />

//                                 Carregando...

//                             </li>
//                         )}


//                         {!asyncLoading
//                         &&
//                         filtered.length === 0
//                         &&
//                         !showCreateOption
//                         && (

//                             <li
//                                 className={`
//                                     px-3
//                                     py-3
//                                     text-sm
//                                     text-center
//                                     ${t.noResults}
//                                 `}
//                             >
//                                 Nenhum resultado
//                             </li>
//                         )}


//                         {!asyncLoading
//                         &&
//                         filtered.map(
//                             option => {

//                                 const isSelected =
//                                     selectedValues.includes(
//                                         option.value
//                                     )

//                                 return (

//                                     <li
//                                         key={
//                                             option.value
//                                         }
//                                         data-selected={
//                                             isSelected
//                                                 ? 'true'
//                                                 : 'false'
//                                         }
//                                         onClick={
//                                             () =>
//                                                 select(
//                                                     option.value
//                                                 )
//                                         }
//                                         className={`
//                                             flex
//                                             items-center
//                                             justify-between
//                                             px-3
//                                             py-2
//                                             text-sm
//                                             cursor-pointer
//                                             transition-colors
//                                             ${
//                                                 isSelected
//                                                     ? t.optionSelected
//                                                     : t.option
//                                             }
//                                         `}
//                                     >

//                                         <span>
//                                             {option.label}
//                                         </span>

//                                         {multi
//                                         &&
//                                         isSelected
//                                         && (
//                                             <X
//                                                 size={12}
//                                                 className="
//                                                     text-blue-400
//                                                 "
//                                             />
//                                         )}

//                                     </li>
//                                 )
//                             }
//                         )}


//                         {showCreateOption && (

//                             <li
//                                 onClick={() => {

//                                     onCreateOption?.(
//                                         query.trim()
//                                     )

//                                     setOpen(false)

//                                     setQuery('')
//                                 }}
//                                 className="
//                                     flex
//                                     items-center
//                                     gap-2
//                                     px-3
//                                     py-2
//                                     text-sm
//                                     cursor-pointer
//                                     hover:bg-gray-50
//                                     transition-colors
//                                     text-blue-600
//                                     border-t
//                                     border-gray-100
//                                 "
//                             >

//                                 <span
//                                     className="
//                                         text-lg
//                                         leading-none
//                                     "
//                                 >
//                                     +
//                                 </span>

//                                 {
//                                     formatCreateLabel
//                                         ? formatCreateLabel(
//                                             query.trim()
//                                         )
//                                         : `Criar "${query.trim()}"`
//                                 }

//                             </li>
//                         )}

//                     </ul>

//                 </div>
//             )}

//         </div>
//     )
// }

'use client'

import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from 'react'

import {
    ChevronDown,
    X,
    Loader2,
} from 'lucide-react'

import type {
    HKSelectOption,
    HKSelectProps,
    HKSelectTheme,
} from './types'


const THEME_CLASSES: Record<
    HKSelectTheme,
    {
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
    }
> = {
    light: {
        trigger:
            'border-gray-300 bg-white hover:border-gray-300',

        triggerDisabled:
            'bg-gray-50',

        value:
            'text-gray-900',

        placeholder:
            'text-gray-400',

        icon:
            'text-gray-400',

        dropdown:
            'bg-white border-gray-200',

        searchInput:
            'border-gray-200 bg-gray-50 text-gray-900 focus:border-gray-400',

        option:
            'text-gray-800 hover:bg-gray-50',

        optionSelected:
            'bg-blue-50 text-blue-700 font-medium hover:bg-blue-100',

        noResults:
            'text-gray-400',
    },

    dark: {
        trigger:
            'border-slate-600 bg-slate-800 hover:border-slate-500',

        triggerDisabled:
            'bg-slate-800/50',

        value:
            'text-slate-100',

        placeholder:
            'text-slate-400',

        icon:
            'text-slate-400',

        dropdown:
            'bg-slate-800 border-slate-600',

        searchInput:
            'border-slate-600 bg-slate-900 text-slate-100 focus:border-slate-400',

        option:
            'text-slate-200 hover:bg-slate-700',

        optionSelected:
            'bg-blue-900/40 text-blue-300 font-medium hover:bg-blue-900/60',

        noResults:
            'text-slate-500',
    },
}


const SEARCH_BAR_HEIGHT = 57


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

    const [openUpward, setOpenUpward] =
        useState(false)

    const [asyncOptions, setAsyncOptions] =
        useState<HKSelectOption[]>([])

    const [asyncLoading, setAsyncLoading] =
        useState(false)


    const wrapperRef =
        useRef<HTMLDivElement>(null)

    const searchRef =
        useRef<HTMLInputElement>(null)

    const listRef =
        useRef<HTMLUListElement>(null)

    const debounceRef =
        useRef<ReturnType<typeof setTimeout> | null>(
            null
        )


    const t = THEME_CLASSES[theme]


    const options =
        loadOptions
            ? asyncOptions
            : (staticOptions ?? [])


    const selectedValues: string[] =
        multi
            ? (
                Array.isArray(value)
                    ? value
                    : []
            )
            : (
                value
                    ? [value as string]
                    : []
            )


    const selectedOptions =
        options.filter(option =>
            selectedValues.includes(
                option.value
            )
        )


    const filtered =
        options.filter(option =>
            option.label
                .toLowerCase()
                .includes(
                    query.toLowerCase()
                )
            ||
            option.value
                .toLowerCase()
                .includes(
                    query.toLowerCase()
                )
        )


    function getScrollParent(
        node: HTMLElement | null
    ): HTMLElement | null {

        let parent =
            node?.parentElement

        while (parent) {

            const { overflowY } =
                window.getComputedStyle(
                    parent
                )

            if (
                overflowY === 'auto'
                ||
                overflowY === 'scroll'
            ) {
                return parent
            }

            parent =
                parent.parentElement
        }

        return null
    }


    const showCreateOption =
        creatable
        &&
        query.trim() !== ''
        &&
        !options.some(
            option =>
                option.label
                    .toLowerCase()
                    ===
                    query
                        .trim()
                        .toLowerCase()
        )


    const fetchAsync =
        useCallback(
            async (query: string) => {

                if (!loadOptions) return

                setAsyncLoading(true)

                try {

                    const result =
                        await loadOptions(
                            query
                        )

                    setAsyncOptions(
                        result
                    )

                } catch (error) {

                    console.error(
                        'HKSelect loadOptions error:',
                        error
                    )

                } finally {

                    setAsyncLoading(false)

                }
            },
            [loadOptions]
        )


    useEffect(() => {

        if (!loadOptions) return

        if (debounceRef.current) {

            clearTimeout(
                debounceRef.current
            )

        }

        debounceRef.current =
            setTimeout(
                () =>
                    fetchAsync(query),
                300
            )

        return () => {

            if (debounceRef.current) {

                clearTimeout(
                    debounceRef.current
                )

            }

        }

    }, [
        query,
        loadOptions,
        fetchAsync,
    ])


    useEffect(() => {

        if (
            open
            &&
            loadOptions
            &&
            asyncOptions.length === 0
        ) {

            fetchAsync('')

        }

    }, [open])


    useEffect(() => {

        if (
            !open
            ||
            !listRef.current
        ) {
            return
        }

        const frame =
            requestAnimationFrame(
                () => {

                    const list =
                        listRef.current

                    if (!list) return

                    const firstSelected =
                        multi
                            ? selectedValues[0]
                            : value as string

                    if (!firstSelected) {
                        return
                    }

                    const selectedEl =
                        list.querySelector<HTMLElement>(
                            '[data-selected="true"]'
                        )

                    if (selectedEl) {

                        selectedEl.scrollIntoView({
                            block: 'nearest',
                        })

                    }

                }
            )

        return () =>
            cancelAnimationFrame(
                frame
            )

    }, [open])


    const toggle = () => {

        if (disabled) return

        if (!open) {

            const rect =
                wrapperRef.current
                    ?.getBoundingClientRect()

            if (rect) {

                const scrollParent =
                    getScrollParent(
                        wrapperRef.current
                    )

                const boundaryBottom =
                    scrollParent
                        ? scrollParent
                            .getBoundingClientRect()
                            .bottom
                        : window.innerHeight

                const boundaryTop =
                    scrollParent
                        ? scrollParent
                            .getBoundingClientRect()
                            .top
                        : 0

                const spaceBelow =
                    boundaryBottom
                    -
                    rect.bottom

                const spaceAbove =
                    rect.top
                    -
                    boundaryTop

                const requiredHeight =
                    SEARCH_BAR_HEIGHT
                    +
                    maxListHeight

                setOpenUpward(
                    spaceBelow < requiredHeight
                    &&
                    spaceAbove > spaceBelow
                )

            }

        }

        setOpen(
            previous => !previous
        )

    }


    useEffect(() => {

        if (open) {

            searchRef.current?.focus()

        } else {

            setQuery('')

        }

    }, [open])


    useEffect(() => {

        const handler =
            (event: MouseEvent) => {

                if (
                    wrapperRef.current
                    &&
                    !wrapperRef.current.contains(
                        event.target as Node
                    )
                ) {

                    setOpen(false)

                }

            }

        document.addEventListener(
            'mousedown',
            handler
        )

        return () => {

            document.removeEventListener(
                'mousedown',
                handler
            )

        }

    }, [])


    const select =
        (optionValue: string) => {

            if (multi) {

                const next =
                    selectedValues.includes(
                        optionValue
                    )
                        ? selectedValues.filter(
                            value =>
                                value !== optionValue
                        )
                        : [
                            ...selectedValues,
                            optionValue,
                        ]

                onChange(next)

            } else {

                onChange(
                    optionValue
                )

                setOpen(false)

            }

        }


    const deselect =
        (
            optionValue: string,
            event: React.MouseEvent
        ) => {

            event.stopPropagation()

            onChange(
                selectedValues.filter(
                    value =>
                        value !== optionValue
                )
            )

        }


    const clear =
        (event: React.MouseEvent) => {

            event.stopPropagation()

            onChange(
                multi
                    ? []
                    : ''
            )

            onClear?.()

        }


    const hasValue =
        multi
            ? selectedValues.length > 0
            : !!value


    const dropdownClass =
        openUpward
            ? `
                bottom-full
                top-auto
                border-t
                border-b-0
                rounded-t-md
                rounded-b-none
            `
            : `
                top-full
                border-t-0
                rounded-b-md
                rounded-t-none
            `


    const triggerOpenClass =
        openUpward
            ? `
                rounded-b-md
                rounded-t-none
            `
            : `
                rounded-t-md
                rounded-b-none
            `


    return (

        <div
            ref={wrapperRef}
            className={`
                relative
                w-full
                ${className}
            `}
        >

            {multi
                ? selectedValues.map(
                    value => (
                        <input
                            key={value}
                            type="hidden"
                            name={name}
                            value={value}
                        />
                    )
                )
                : (
                    <input
                        type="hidden"
                        name={name}
                        value={value as string}
                        required={required}
                    />
                )
            }


            <button
                type="button"
                onClick={toggle}
                disabled={disabled}
                className={`
                    w-full
                    flex
                    items-center
                    gap-2
                    px-3
                    min-h-10
                    text-sm
                    text-left
                    border
                    transition-colors

                    ${
                        open
                            ? `
                                border-gray-400
                                ${triggerOpenClass}
                            `
                            : `
                                rounded-sm
                                ${t.trigger}
                            `
                    }

                    ${
                        disabled
                            ? `
                                opacity-50
                                cursor-not-allowed
                                ${t.triggerDisabled}
                            `
                            : `
                                cursor-pointer
                                ${t.trigger}
                            `
                    }
                `}
            >

                <span
                    className="
                        flex-1
                        flex
                        flex-wrap
                        gap-1
                        py-1
                    "
                >

                    {multi
                    &&
                    selectedOptions.length > 0
                        ? selectedOptions.map(
                            option => (

                                <span
                                    key={option.value}
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        px-2
                                        py-0.5
                                        bg-blue-50
                                        text-blue-700
                                        rounded
                                        text-xs
                                    "
                                >

                                    {option.label}

                                    <X
                                        size={12}
                                        className="
                                            cursor-pointer
                                            hover:text-blue-900
                                        "
                                        onClick={
                                            event =>
                                                deselect(
                                                    option.value,
                                                    event
                                                )
                                        }
                                    />

                                </span>

                            )
                        )
                        : (

                            <span
                                className={
                                    !hasValue
                                        ? t.placeholder
                                        : t.value
                                }
                            >
                                {
                                    !multi
                                    &&
                                    selectedOptions[0]
                                        ? selectedOptions[0].label
                                        : placeholder
                                }
                            </span>

                        )
                    }

                </span>


                <span
                    className="
                        flex
                        items-center
                        gap-1
                        shrink-0
                    "
                >

                    {clearable
                    &&
                    hasValue
                    && (

                        <X
                            size={14}
                            className="
                                text-gray-400
                                hover:text-gray-600
                                transition-colors
                            "
                            onClick={clear}
                        />

                    )}

                    <ChevronDown
                        size={16}
                        className={`
                            transition-transform
                            duration-200

                            ${
                                open
                                    ? 'rotate-180'
                                    : ''
                            }

                            ${t.icon}
                        `}
                    />

                </span>

            </button>


            {open && (

                <div
                    className={`
                        shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                        absolute
                        z-50
                        left-0
                        right-0
                        border
                        ${t.dropdown}
                        ${dropdownClass}
                    `}
                >

                    <div
                        className="
                            p-2
                            border-b
                            border-gray-100/10
                        "
                    >

                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={
                                event =>
                                    setQuery(
                                        event.target.value
                                    )
                            }
                            placeholder={
                                searchPlaceholder
                            }
                            className={`
                                w-full
                                px-3
                                h-8
                                text-sm
                                border
                                rounded-md
                                outline-none
                                ${t.searchInput}
                            `}
                        />

                    </div>


                    <ul
                        ref={listRef}
                        className="
                            max-h-56
                            overflow-y-auto
                            py-1
                        "
                        style={{
                            maxHeight:
                                maxListHeight,
                        }}
                    >

                        {asyncLoading && (

                            <li
                                className={`
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    px-3
                                    py-3
                                    text-sm
                                    ${t.noResults}
                                `}
                            >

                                <Loader2
                                    size={14}
                                    className="
                                        animate-spin
                                    "
                                />

                                Carregando...

                            </li>

                        )}


                        {!asyncLoading
                        &&
                        filtered.length === 0
                        &&
                        !showCreateOption
                        && (

                            <li
                                className={`
                                    px-3
                                    py-3
                                    text-sm
                                    text-center
                                    ${t.noResults}
                                `}
                            >
                                Nenhum resultado
                            </li>

                        )}


                        {!asyncLoading
                        &&
                        filtered.map(
                            option => {

                                const isSelected =
                                    selectedValues.includes(
                                        option.value
                                    )

                                return (

                                    <li
                                        key={
                                            option.value
                                        }
                                        data-selected={
                                            isSelected
                                                ? 'true'
                                                : 'false'
                                        }
                                        onClick={
                                            () =>
                                                select(
                                                    option.value
                                                )
                                        }
                                        className={`
                                            flex
                                            items-center
                                            justify-between
                                            px-3
                                            py-2
                                            text-sm
                                            cursor-pointer
                                            transition-colors

                                            ${
                                                isSelected
                                                    ? t.optionSelected
                                                    : t.option
                                            }
                                        `}
                                    >

                                        <span>
                                            {
                                                option.label
                                            }
                                        </span>


                                        {multi
                                        &&
                                        isSelected
                                        && (

                                            <X
                                                size={12}
                                                className="
                                                    text-blue-400
                                                "
                                            />

                                        )}

                                    </li>

                                )

                            }
                        )}


                        {showCreateOption && (

                            <li
                                onClick={() => {

                                    onCreateOption?.(
                                        query.trim()
                                    )

                                    setOpen(false)

                                    setQuery('')

                                }}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-3
                                    py-2
                                    text-sm
                                    cursor-pointer
                                    hover:bg-gray-50
                                    transition-colors
                                    text-blue-600
                                    border-t
                                    border-gray-100
                                "
                            >

                                <span
                                    className="
                                        text-lg
                                        leading-none
                                    "
                                >
                                    +
                                </span>

                                {
                                    formatCreateLabel
                                        ? formatCreateLabel(
                                            query.trim()
                                        )
                                        : `Criar "${query.trim()}"`
                                }

                            </li>

                        )}

                    </ul>

                </div>

            )}

        </div>

    )
}