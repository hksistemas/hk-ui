# HKSelect

Select customizável com busca, criação de opções, seleção múltipla e carregamento assíncrono, feito para o pacote `hk-ui`. Renderiza o dropdown em um portal (`document.body`), então funciona corretamente dentro de modais, tabelas com scroll, ou qualquer container com `overflow` ou `transform` — sem cortar, sem desalinhar.

## Instalação

```bash
npm install hk-ui
```

`react` e `react-dom` são `peerDependencies` — o projeto que consome o pacote precisa já ter essas duas instaladas (versões `>=18.2.0 <20`).

## Uso básico

```tsx
import { HKSelect } from 'hk-ui'

const options = [
    { value: '1', label: 'Agente de Controle Interno' },
    { value: '2', label: 'Coordenadora' },
]

function Exemplo() {
    const [valor, setValor] = useState('')

    return (
        <HKSelect
            name="cargo"
            value={valor}
            onChange={(v) => setValor(v as string)}
            options={options}
            placeholder="Selecione..."
        />
    )
}
```

`onChange` recebe `string` no modo simples e `string[]` no modo `multi`. Faça o type narrowing conforme o caso, como no exemplo acima.

## Propriedades

### Básicas

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `options` | `HKSelectOption[]` | `[]` | Lista de opções `{ value, label }`. Ignorado se `loadOptions` for passado. |
| `name` | `string` | — | Nome do campo, usado no(s) `<input type="hidden">` interno(s) — útil pra formulários nativos (`<form>` + `FormData`). |
| `value` | `string \| string[]` | — | Valor(es) selecionado(s). `string` no modo simples, `string[]` no modo `multi`. |
| `onChange` | `(value: string \| string[]) => void` | — | Disparado a cada seleção/remoção. |
| `placeholder` | `string` | `'Selecione...'` | Texto exibido quando não há valor selecionado. |
| `searchPlaceholder` | `string` | `'Buscar...'` | Placeholder do campo de busca dentro do dropdown. |
| `required` | `boolean` | — | Aplica `required` no `<input type="hidden">` (modo simples apenas — não tem efeito em `multi`). |
| `disabled` | `boolean` | — | Desabilita o campo (visual + interação). |
| `className` | `string` | `''` | Classes adicionais aplicadas no wrapper externo (`div`). |
| `theme` | `'light' \| 'dark'` | `'light'` | Paleta de cores do componente. |

### Altura

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `minHeight` | `number \| string` | `40` (equivale a `2.5rem`) | Altura mínima do campo (trigger). Aceita número em `px` (`48`) ou string com unidade (`'3rem'`). Use pra igualar a altura de outros inputs do mesmo formulário. |

### Criação de opções (`creatable`)

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `creatable` | `boolean` | `false` | Se `true`, exibe a opção "Criar ..." quando o texto buscado não corresponde a nenhuma opção existente. |
| `onCreateOption` | `(inputValue: string) => void` | — | Chamado ao clicar em "Criar ...". Normalmente aqui você salva a nova opção no backend e atualiza a lista de `options` manualmente. |
| `formatCreateLabel` | `(inputValue: string) => string` | `` `Criar "${valor}"` `` | Customiza o texto da opção de criação. |

```tsx
<HKSelect
    name="cargo"
    value={cargo?.value ?? ''}
    options={options}
    onChange={(v) => setCargo(options.find(o => o.value === v) ?? null)}
    creatable
    onCreateOption={async (texto) => {
        const novo = await criarCargo(texto)
        setOptions(prev => [...prev, novo])
        setCargo(novo)
    }}
    formatCreateLabel={(v) => `Clique para criar "${v}"`}
/>
```

### Campo limpável (`clearable`)

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `clearable` | `boolean` | `false` | Exibe um "x" pra limpar o valor selecionado, sem precisar abrir o dropdown. |
| `onClear` | `() => void` | — | Chamado (além do `onChange`) quando o campo é limpo pelo "x". |

### Seleção múltipla (`multi`)

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `multi` | `boolean` | `false` | Ativa seleção múltipla. `value` e `onChange` passam a trabalhar com `string[]`. As opções selecionadas aparecem como chips dentro do campo, cada um removível individualmente. |

```tsx
<HKSelect
    name="unidades"
    multi
    value={unidadesSelecionadas}
    onChange={(v) => setUnidadesSelecionadas(v as string[])}
    options={unidades}
/>
```

### Carregamento assíncrono (`loadOptions`)

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `loadOptions` | `(query: string) => Promise<HKSelectOption[]>` | — | Se passado, `options` é ignorado. É chamado automaticamente ao abrir o dropdown (com `query` vazia) e a cada digitação na busca, com debounce de 300ms. |
| `maxListHeight` | `number` | `224` | Altura máxima (em px) da lista de opções antes de rolar. Também usado no cálculo de abrir o dropdown pra cima ou para baixo. |

```tsx
<HKSelect
    name="municipio"
    value={municipioId}
    onChange={(v) => setMunicipioId(v as string)}
    loadOptions={async (query) => {
        const res = await fetch(`/api/municipios?q=${query}`)
        return res.json()
    }}
/>
```

## Comportamentos importantes

- **Posicionamento via portal:** o dropdown é renderizado com `createPortal` direto no `document.body`, com posição calculada via `getBoundingClientRect()` e `position: fixed`. Isso evita os problemas clássicos de `overflow: hidden` cortando o dropdown ou `transform` (comum em modais/diálogos) descolando a posição.
- **Abre pra cima automaticamente:** se não houver espaço suficiente abaixo do campo (considerando `maxListHeight`) mas houver espaço acima, o dropdown se posiciona acima do campo automaticamente.
- **Recalcula em scroll e resize:** enquanto aberto, a posição é recalculada continuamente (inclusive scroll dentro de containers internos, como o corpo de um modal).
- **Fecha ao clicar fora:** considera tanto o campo quanto o dropdown portalado como "dentro".
- **Foco automático na busca:** ao abrir, o campo de busca recebe foco automaticamente.
- **Scroll até o item selecionado:** ao abrir, a lista rola automaticamente até a opção já selecionada (modo simples) ou a primeira selecionada (modo `multi`).

## Tipos

```ts
export interface HKSelectOption {
    value: string
    label: string
}

export type HKSelectTheme = 'light' | 'dark'

export interface HKSelectProps {
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
    creatable?: boolean
    onCreateOption?: (inputValue: string) => void
    formatCreateLabel?: (inputValue: string) => string
    clearable?: boolean
    onClear?: () => void
    multi?: boolean
    loadOptions?: (query: string) => Promise<HKSelectOption[]>
    maxListHeight?: number
    minHeight?: number | string
}
```

## Limitações conhecidas

- `required` só tem efeito no modo simples (o `<input type="hidden">` de cada valor selecionado, no modo `multi`, não recebe `required`).
- Não há suporte a navegação por teclado (setas/Enter) na lista de opções — apenas clique e digitação na busca.
- O componente depende de `document` (via portal), então só funciona em componentes client (`'use client'`); não é compatível com renderização puramente server-side sem hidratação.
