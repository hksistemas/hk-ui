# @hksistemas/hk-ui

Componentes React reutilizáveis desenvolvidos pela **HK Sistemas**.

O objetivo do `@hksistemas/hk-ui` é centralizar componentes visuais e comportamentais reutilizáveis para aplicações React/Next.js, evitando a duplicação de componentes entre projetos.

## Instalação

```bash
npm install @hksistemas/hk-ui
```

## Requisitos

* React 18 ou 19
* React DOM 18 ou 19
* Tailwind CSS
* Next.js, quando utilizado em aplicações Next.js

O pacote utiliza `lucide-react` para os ícones de alguns componentes.

---

# Componentes

## HKSelect

Select customizado com suporte a:

* pesquisa;
* seleção simples;
* seleção múltipla;
* carregamento assíncrono;
* criação de novas opções;
* limpeza do valor;
* tema claro e escuro;
* posicionamento automático do dropdown;
* controle de altura;
* opções estáticas ou carregadas dinamicamente.

### Importação

```tsx
import { HKSelect } from '@hksistemas/hk-ui'
```

### Uso básico

```tsx
<HKSelect
    name="processo_status"
    value={formData.processo_status}
    onChange={(value) =>
        handleChange('processo_status', value)
    }
    placeholder="Selecione..."
    required
    options={[
        {
            value: '1',
            label: 'Em andamento',
        },
        {
            value: '2',
            label: 'Homologado',
        },
        {
            value: '3',
            label: 'Fracassado/Deserto',
        },
        {
            value: '4',
            label: 'Anulado/Cancelado/Revogado',
        },
        {
            value: '5',
            label: 'Suspenso',
        },
    ]}
/>
```

### Props

| Prop                | Tipo                                   | Padrão           | Descrição                                 |
| ------------------- | -------------------------------------- | ---------------- | ----------------------------------------- |
| `name`              | `string`                               | —                | Nome do campo                             |
| `value`             | `string \| string[]`                   | —                | Valor selecionado                         |
| `onChange`          | `(value) => void`                      | —                | Executado quando o valor muda             |
| `options`           | `HKSelectOption[]`                     | `[]`             | Lista de opções                           |
| `placeholder`       | `string`                               | `"Selecione..."` | Texto quando nenhum valor foi selecionado |
| `searchPlaceholder` | `string`                               | `"Buscar..."`    | Placeholder da pesquisa                   |
| `required`          | `boolean`                              | —                | Define o campo como obrigatório           |
| `disabled`          | `boolean`                              | —                | Desabilita o componente                   |
| `className`         | `string`                               | `""`             | Classes CSS adicionais                    |
| `theme`             | `"light" \| "dark"`                    | `"light"`        | Tema do componente                        |
| `minHeight`         | `number`                               | `40`             | Altura mínima do campo                    |
| `creatable`         | `boolean`                              | `false`          | Permite criar uma nova opção              |
| `onCreateOption`    | `(inputValue) => void`                 | —                | Executado ao criar uma opção              |
| `formatCreateLabel` | `(inputValue) => string`               | —                | Personaliza o texto da opção de criação   |
| `clearable`         | `boolean`                              | `false`          | Permite limpar o valor                    |
| `onClear`           | `() => void`                           | —                | Executado ao limpar                       |
| `multi`             | `boolean`                              | `false`          | Permite seleção múltipla                  |
| `loadOptions`       | `(query) => Promise<HKSelectOption[]>` | —                | Carregamento assíncrono                   |
| `maxListHeight`     | `number`                               | `224`            | Altura máxima da lista                    |

### Seleção múltipla

```tsx
<HKSelect
    name="categorias"
    value={categorias}
    onChange={setCategorias}
    multi
    options={[
        {
            value: '1',
            label: 'Categoria 1',
        },
        {
            value: '2',
            label: 'Categoria 2',
        },
        {
            value: '3',
            label: 'Categoria 3',
        },
    ]}
/>
```

### Tema escuro

```tsx
<HKSelect
    name="status"
    value={status}
    onChange={setStatus}
    theme="dark"
    options={options}
/>
```

---

# HKClickableRow

Linha de tabela (`tr`) clicável, desenvolvida para cenários em que uma linha representa um registro e pode executar uma ação ao ser selecionada.

O componente possui suporte nativo a:

* clique na linha;
* identificação do registro através de `id`;
* estado de carregamento individual;
* spinner na primeira célula;
* bloqueio de novos cliques durante o carregamento;
* cursor de espera;
* temas claro e escuro;
* classes CSS personalizadas;
* uso direto dentro de `<table>`.

### Importação

```tsx
import { HKClickableRow } from '@hksistemas/hk-ui'
```

### Uso básico

O `HKClickableRow` substitui diretamente o `<tr>`:

```tsx
<table>
    <tbody>
        <HKClickableRow
            id={processo.id}
            onClick={handleRowClick}
        >
            <td>{processo.numero}</td>
            <td>{processo.modalidade}</td>
            <td>{processo.status}</td>
        </HKClickableRow>
    </tbody>
</table>
```

### Navegação com estado de carregamento

Um dos principais objetivos do componente é permitir que a linha apresente um indicador visual enquanto a ação associada a ela está sendo executada.

Exemplo:

```tsx
const [loadingId, setLoadingId] = useState<
    string | number | null
>(null)

const handleRowClick = async (
    id: string | number
) => {
    setLoadingId(id)

    try {
        await router.push(
            `/contratos/${id}/details`
        )
    } catch (error) {
        setLoadingId(null)
    }
}
```

A linha pode então ser utilizada:

```tsx
<HKClickableRow
    key={c.id}
    id={c.id}
    loadingId={loadingId}
    onClick={handleRowClick}
    className={rowStyle}
>
    <td>{c.numero}</td>
    <td>{c.objeto}</td>
    <td>{c.valor}</td>
</HKClickableRow>
```

Quando o `id` da linha for igual ao `loadingId`, o componente:

1. exibe um spinner na primeira célula;
2. aplica o estado visual de carregamento;
3. bloqueia novos cliques;
4. altera o cursor para `wait`.

Isso permite que somente a linha selecionada fique em estado de carregamento.

### `canClick`

Para tornar uma linha não clicável:

```tsx
<HKClickableRow
    id={processo.id}
    canClick={false}
>
    <td>{processo.numero}</td>
    <td>{processo.status}</td>
</HKClickableRow>
```

Quando `canClick` é `false`, o componente não executa `onClick` e não aplica o comportamento visual de hover/cursor de linha clicável.

### Tema

Tema claro:

```tsx
<HKClickableRow
    id={processo.id}
    theme="light"
>
    <td>{processo.numero}</td>
    <td>{processo.status}</td>
</HKClickableRow>
```

Tema escuro:

```tsx
<HKClickableRow
    id={processo.id}
    theme="dark"
>
    <td>{processo.numero}</td>
    <td>{processo.status}</td>
</HKClickableRow>
```

O componente **não depende de nenhum contexto de tema externo**. O projeto consumidor pode decidir qual tema utilizar.

### Classes personalizadas

A aparência também pode ser complementada através de `className`:

```tsx
<HKClickableRow
    id={processo.id}
    className="hover:bg-blue-50"
>
    <td>{processo.numero}</td>
    <td>{processo.status}</td>
</HKClickableRow>
```

### Props

| Prop        | Tipo                       | Padrão    | Descrição                              |
| ----------- | -------------------------- | --------- | -------------------------------------- |
| `id`        | `string \| number`         | —         | Identificador da linha                 |
| `loadingId` | `string \| number \| null` | —         | ID da linha atualmente em carregamento |
| `onClick`   | `(id) => void`             | —         | Executado ao clicar na linha           |
| `canClick`  | `boolean`                  | `true`    | Define se a linha pode ser clicada     |
| `className` | `string`                   | `""`      | Classes CSS adicionais                 |
| `theme`     | `"light" \| "dark"`        | `"light"` | Tema visual                            |
| `children`  | `React.ReactNode`          | —         | Células `<td>` da linha                |

---

# Tipos

Os tipos dos componentes também são exportados pelo pacote.

```tsx
import type {
    HKSelectOption,
    HKSelectProps,
    HKSelectTheme,
    HKClickableRowProps,
    HKClickableRowTheme,
} from '@hksistemas/hk-ui'
```

---

# Desenvolvimento

Clone o repositório privado da biblioteca:

```bash
git clone https://github.com/hksistemas/hk-ui.git
```

Instale as dependências:

```bash
npm install
```

Execute o build:

```bash
npm run build
```

Limpe o diretório `dist`:

```bash
npm run clean
```

Antes da publicação, o pacote executa automaticamente o build através dos scripts configurados no `package.json`.

---

# Publicação

O código-fonte do projeto é mantido no GitHub privado da HK Sistemas.

O pacote compilado é publicado publicamente no npm:

```bash
npm publish --access public
```

Para uma correção de versão:

```bash
npm version patch
npm publish --access public
```

Para uma nova funcionalidade compatível:

```bash
npm version minor
npm publish --access public
```

---

# Licença

MIT

Copyright © HK Sistemas

```
```
